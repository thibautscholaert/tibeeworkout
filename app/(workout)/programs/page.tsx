import { getPrograms } from '@/app/actions';
import { Program } from '@/lib/types';
import CurrentDayClient from './current-day-client';

export default async function ProgramsPage() {
  const result = await getPrograms();

  if (!result.success) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Programmes d'entraînement</h1>
          <p className="text-muted-foreground">Erreur lors du chargement des programmes: {result.error}</p>
        </div>
      </div>
    );
  }

  const programs: Program[] = result.data;

  if (programs.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Programmes d'entraînement</h1>
          <p className="text-muted-foreground">Aucun programme trouvé. Vérifiez que la feuille "Program" contient des données.</p>
        </div>
      </div>
    );
  }

  return <CurrentDayClient programs={programs} />;
}
