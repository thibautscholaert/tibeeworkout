'use server';

import type { NoteFormData, SetFormData } from '@/lib/schemas';
import { ExerciseNote, Profile, Program } from '@/lib/types';
import { calculateEstimated1RM } from '@/lib/utils';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { revalidatePath } from 'next/cache';

// Configuration de l'authentification
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || '', auth);

export async function saveWorkoutSet(data: SetFormData & { timestamp: Date }) {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Workouts'] || doc.sheetsByIndex[0];

    if (sheet.rowCount <= 1 && sheet.columnCount <= 1) {
      await sheet.setHeaderRow(['Exercise', 'Weight', 'Reps', 'Timestamp']);
    }

    const newRow = {
      Timestamp: data.timestamp.toISOString(),
      Exercise: data.exerciseName,
      Weight: data.weight.toString(),
      Reps: data.reps.toString(),
    };

    await sheet.addRow(newRow);

    // On force Next.js à rafraîchir les données sur les pages qui utilisent cette action
    revalidatePath('/history');
    revalidatePath('/stats');

    return { success: true, id: crypto.randomUUID() };
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    return { success: false, error: 'Failed to save data' };
  }
}

export async function saveNote(data: NoteFormData & { timestamp: Date; exerciseName: string }) {
  try {
    await doc.loadInfo();
    let sheet = doc.sheetsByTitle['Notes'];

    // Create Notes sheet if it doesn't exist
    if (!sheet) {
      sheet = await doc.addSheet({
        title: 'Notes',
        headerValues: ['Exercise', 'Note', 'Timestamp'],
      });
    }

    // Check if sheet has headers and set them if needed
    if (sheet.rowCount <= 1 && sheet.columnCount <= 1) {
      await sheet.setHeaderRow(['Exercise', 'Note', 'Timestamp']);
    }

    // Get all rows to find existing entry for this exercise
    const rows = await sheet.getRows();
    const existingRow = rows.find(row => row.get('Exercise') === data.exerciseName);

    if (existingRow) {
      // Update existing row
      existingRow.set('Note', data.note);
      existingRow.set('Timestamp', data.timestamp.toISOString());
      await existingRow.save();
    } else {
      // Create new row if no existing entry found
      const newRow = {
        Timestamp: data.timestamp.toISOString(),
        Exercise: data.exerciseName,
        Note: data.note,
      };
      await sheet.addRow(newRow);
    }

    // Revalidate paths that might use notes
    revalidatePath('/log');

    return { success: true, id: crypto.randomUUID() };
  } catch (error) {
    console.error('Error saving note to Google Sheets:', error);
    return { success: false, error: 'Failed to save note' };
  }
}

export async function getWorkoutHistory() {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Workouts'] || doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const history = rows.map((row) => {
      const weight = parseFloat(row.get('Weight'));
      const reps = parseInt(row.get('Reps'));
      const exerciseName = row.get('Exercise');
      return {
        timestamp: row.get('Timestamp'),
        exerciseName,
        weight,
        reps,
        oneRM: calculateEstimated1RM(weight, reps, exerciseName),
      };
    });

    return { success: true, data: history };
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return { success: false, data: [], error: 'Failed to fetch data' };
  }
}

export async function getPrograms() {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Program'];

    if (!sheet) {
      console.error('Program sheet not found');
      return { success: false, data: [], error: 'Program sheet not found' };
    }

    const rows = await sheet.getRows();

    // Grouper par Titre -> Session -> Bloc -> Exercices
    const programsMap = new Map<string, Program>();

    rows.forEach((row: any) => {
      const title = row.get('Titre') || '';
      const session = row.get('Session') || '';
      const day = row.get('Jour') || '';
      const bloc = row.get('Bloc') || '';
      const exerciseName = row.get('Exercice') || '';
      const sets = parseInt(row.get('Séries') || '0');
      const reps = row.get('Reps') || '';
      const charge = row.get('Charge / Objectif') || '';
      const recovery = row.get('Récup') || '';
      const notes = row.get('Notes / Focus Technique') || '';

      if (!title || !exerciseName || !session) return;

      // Créer le programme s'il n'existe pas
      if (!programsMap.has(title)) {
        programsMap.set(title, {
          id: crypto.randomUUID(),
          title,
          sessions: [],
        });
      }

      const program: Program = programsMap.get(title) as Program;

      // Trouver ou créer la session
      let sessionObj = program.sessions.find((s: any) => s.session === session);
      if (!sessionObj) {
        sessionObj = { session, day, blocs: [] };
        program.sessions.push(sessionObj);
      }

      // Trouver ou créer le bloc
      let blocObj = sessionObj.blocs.find((b: any) => b.name === bloc);
      if (!blocObj) {
        blocObj = { name: bloc, exercises: [] };
        sessionObj.blocs.push(blocObj);
      }

      // Ajouter l'exercice
      blocObj.exercises.push({
        exerciseName,
        sets,
        reps,
        charge,
        recovery,
        notes,
      });
    });

    const programs = Array.from(programsMap.values());
    return { success: true, data: programs };
  } catch (error) {
    console.error('Error fetching programs from Google Sheets:', error);
    return { success: false, data: [], error: 'Failed to fetch programs' };
  }
}

export async function getNotes() {
  try {
    await doc.loadInfo();
    let sheet = doc.sheetsByTitle['Notes'];

    // Return empty array if Notes sheet doesn't exist yet
    if (!sheet) {
      return { success: true, data: [] };
    }

    const rows = await sheet.getRows();

    const notes: ExerciseNote[] = rows.map((row, index) => ({
      id: `note-${index}-${row.get('Timestamp')}`,
      exerciseName: row.get('Exercise') || '',
      note: row.get('Note') || '',
      timestamp: new Date(row.get('Timestamp') || Date.now()),
    }));

    return { success: true, data: notes };
  } catch (error) {
    console.error('Error fetching notes from Google Sheets:', error);
    return { success: false, data: [], error: 'Failed to fetch notes' };
  }
}

export async function getProfile() {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Profile'];

    if (!sheet) {
      console.error('Profile sheet not found');
      return { success: false, data: null, error: 'Profile sheet not found' };
    }

    const rows = await sheet.getRows();

    if (rows.length === 0) {
      console.error('No data found in Profile sheet');
      return { success: false, data: null, error: 'No data found in Profile sheet' };
    }

    // Get first row data
    const firstRow = rows[0];
    const profile: Profile = {
      name: firstRow.get('Name') || '',
      dob: firstRow.get('DOB') || '',
      weight: parseFloat(firstRow.get('Weight') || '0'),
      size: firstRow.get('Size') || '',
    };

    return { success: true, data: profile };
  } catch (error) {
    console.error('Error fetching profile from Google Sheets:', error);
    return { success: false, data: null, error: 'Failed to fetch profile data' };
  }
}


