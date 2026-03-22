import { getProfile, getPrograms, getWorkoutHistory } from '@/app/actions';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Helper function to group sets by session (day or 2h time range)
function groupSetsBySession(sets: any[]): { sessionKey: string; sets: any[] }[] {
  const grouped = new Map<string, any[]>();

  // Sort sets by timestamp
  const sortedSets = [...sets].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeA - timeB;
  });

  sortedSets.forEach((set) => {
    const setTime = new Date(set.timestamp).getTime();
    let sessionKey: string | null = null;
    const twoHoursInMs = 2 * 60 * 60 * 1000;

    // Try to find an existing session within 2 hours
    for (const [key, sessionSets] of grouped.entries()) {
      if (sessionSets.length === 0) continue;

      const isWithinRange = sessionSets.some((sessionSet) => {
        const timeDiff = Math.abs(setTime - new Date(sessionSet.timestamp).getTime());
        return timeDiff <= twoHoursInMs;
      });

      if (isWithinRange) {
        sessionKey = key;
        break;
      }
    }

    // If no session found within 2h, create a new one based on date
    if (!sessionKey) {
      sessionKey = new Date(set.timestamp).toDateString();
    }

    const existing = grouped.get(sessionKey) || [];
    grouped.set(sessionKey, [...existing, set]);
  });

  // Convert Map to array of objects and sort by date (most recent first)
  return Array.from(grouped.entries())
    .map(([sessionKey, sets]) => ({
      sessionKey,
      sets,
    }))
    .sort((a, b) => new Date(b.sessionKey).getTime() - new Date(a.sessionKey).getTime());
}

// GitHub API helper function
async function updateGitHubFile(content: string, filename: string): Promise<boolean> {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH || 'main';

    console.log('repoOwner', repoOwner);
    console.log('repoName', repoName);


    if (!githubToken || !repoOwner || !repoName) {
      console.error('Missing GitHub configuration');
      return false;
    }

    // Get current file info
    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filename}?ref=${branch}`;
    const getFileResponse = await fetch(getFileUrl, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    let sha: string | undefined;
    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      sha = fileData.sha;
    }

    // Create or update file
    const contentBase64 = Buffer.from(content).toString('base64');
    const updateUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filename}`;

    const body = {
      message: `Update ${filename} via cron job`,
      content: contentBase64,
      branch,
      ...(sha && { sha }),
    };

    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text();
      console.error('Failed to update GitHub file:', errorData);
      return false;
    }

    console.log(`Successfully updated ${filename} in GitHub`);
    return true;
  } catch (error) {
    console.error('Error updating GitHub file:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Validate cron secret using authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {

    // Fetch all data
    const [historyResult, programsResult, profileResult] = await Promise.all([
      getWorkoutHistory(),
      getPrograms(),
      getProfile(),
    ]);

    const syncData: any = {
      lastSync: new Date().toISOString(),
      success: true,
      data: {},
    };

    // Process history (max 20 sessions)
    if (historyResult.success) {
      const groupedHistory = groupSetsBySession(historyResult.data).slice(0, 20);
      syncData.data.history = groupedHistory;
    } else {
      syncData.data.history = [];
      syncData.historyError = historyResult.error;
    }

    // Process programs
    if (programsResult.success) {
      syncData.data.programs = programsResult.data;
    } else {
      syncData.data.programs = [];
      syncData.programsError = programsResult.error;
    }

    // Process profile
    if (profileResult.success) {
      syncData.data.profile = profileResult.data;
    } else {
      syncData.data.profile = null;
      syncData.profileError = profileResult.error;
    }

    // Check if at least one data source succeeded
    if (!historyResult.success && !programsResult.success && !profileResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch all data sources',
          historyError: historyResult.error,
          programsError: programsResult.error,
          profileError: profileResult.error,
        },
        { status: 500 }
      );
    }

    // Write to local file (for backup/debugging)
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const dataDir = path.join(process.cwd(), 'data');
      await fs.mkdir(dataDir, { recursive: true });

      const localFilePath = path.join(dataDir, 'workout-sync.json');
      await fs.writeFile(localFilePath, JSON.stringify(syncData, null, 2));
      console.log(`Data written to local file: ${localFilePath}`);
    } catch (localFileError) {
      console.error('Failed to write local file:', localFileError);
      // Continue with GitHub update even if local write fails
    }

    // Update GitHub repository
    const jsonContent = JSON.stringify(syncData, null, 2);
    const githubSuccess = await updateGitHubFile(jsonContent, 'data/workout-sync.json');

    if (!githubSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update GitHub repository',
          data: syncData.data, // Still return the data for debugging
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      lastSync: syncData.lastSync,
      dataSummary: {
        historySessions: syncData.data.history?.length || 0,
        programs: syncData.data.programs?.length || 0,
        profile: syncData.data.profile ? 'found' : 'not found',
      },
    });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during sync',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Support GET requests for testing
export async function GET(request: NextRequest) {
  // Validate cron secret using authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  return NextResponse.json({
    message: 'Cron sync endpoint - use POST to trigger sync',
    timestamp: new Date().toISOString(),
  });
}
