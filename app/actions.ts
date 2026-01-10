"use server"

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { revalidatePath } from 'next/cache';
import type { SetFormData } from "@/lib/schemas";

// Configuration de l'authentification
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || '', auth);

// Helper pour calculer le 1RM (Formule de Brzycki)
const calculate1RM = (weight: number, reps: number) => {
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps));
};

export async function saveWorkoutSet(data: SetFormData & { timestamp: Date }) {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Workouts'] || doc.sheetsByIndex[0];

    const newRow = {
      Exercise: data.exerciseName,
      Weight: data.weight.toString(),
      Reps: data.reps.toString(),
      Timestamp: data.timestamp.toISOString(),
      Estimated1RM: calculate1RM(data.weight, data.reps).toFixed(2),
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

    const history = rows.map(row => ({
      exerciseName: row.get('Exercise'),
      weight: parseFloat(row.get('Weight')),
      reps: parseInt(row.get('Reps')),
      timestamp: row.get('Timestamp'),
      oneRM: parseFloat(row.get('Estimated1RM')),
    }));

    return { success: true, data: history };
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    return { success: false, data: [], error: "Failed to fetch data" };
  }
}