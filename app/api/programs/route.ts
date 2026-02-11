import { getPrograms } from '@/app/actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await getPrograms();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch programs',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error fetching programs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
