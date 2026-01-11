"use server"

import type { SetFormData } from "@/lib/schemas";
import { calculateEstimated1RM } from "@/lib/utils";
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
    console.error("Error saving to Google Sheets:", error);
    return { success: false, error: "Failed to save data" };
  }
}

export async function getWorkoutHistory() {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Workouts'] || doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const history = rows.map(row => {
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
    console.error("Error fetching from Google Sheets:", error);
    return { success: false, data: [], error: "Failed to fetch data" };
  }
}