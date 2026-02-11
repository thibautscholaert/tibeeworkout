import { getPrograms, getWorkoutHistory } from '@/app/actions';
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
    // Check if the set is within 2h of any set in the session
    for (const [key, sessionSets] of grouped.entries()) {
      if (sessionSets.length === 0) continue;

      // Check if set is within 2h of any set in this session
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

export async function GET() {
  try {
    const [historyResult, programsResult] = await Promise.all([getWorkoutHistory(), getPrograms()]);

    const response: any = {
      success: true,
      data: {},
    };

    if (historyResult.success) {
      // Group history by session
      const groupedHistory = groupSetsBySession(historyResult.data).splice(0, 10); // Keep only the 10 most recent sessions
      response.data.history = groupedHistory;
    } else {
      response.data.history = [];
      response.historyError = historyResult.error;
    }

    if (programsResult.success) {
      response.data.programs = programsResult.data;
    } else {
      response.data.programs = [];
      response.programsError = programsResult.error;
    }

    // Si les deux ont échoué, retourner une erreur
    if (!historyResult.success && !programsResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch both history and programs',
          historyError: historyResult.error,
          programsError: programsResult.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error fetching data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
