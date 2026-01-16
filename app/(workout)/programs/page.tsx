import { getPrograms } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Program } from '@/lib/types';
import { BarChart3, Calendar, Clock, Flame, Hash, Lightbulb, Scale, Target } from 'lucide-react';

// Fonction pour obtenir le jour de la semaine en français
function getCurrentDayInFrench(): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const today = new Date();
  return days[today.getDay()];
}

// Fonction pour normaliser les noms de jours (gérer les variations)
function normalizeDayName(day: string): string {
  const dayMap: { [key: string]: string } = {
    lundi: 'Lundi',
    mardi: 'Mardi',
    mercredi: 'Mercredi',
    jeudi: 'Jeudi',
    vendredi: 'Vendredi',
    samedi: 'Samedi',
    dimanche: 'Dimanche',
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  };

  return dayMap[day.toLowerCase()] || day;
}

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

  const currentDay = getCurrentDayInFrench();

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Programmes d'entraînement</h1>
        <p className="text-muted-foreground">Aujourd'hui: {currentDay}</p>
      </div>

      <div className="space-y-6">
        {programs.map((program) => {
          // Trier les jours pour mettre le jour actuel en premier
          const sortedDays = [...program.days].sort((a, b) => {
            const normalizedA = normalizeDayName(a.day);
            const normalizedB = normalizeDayName(b.day);

            if (normalizedA === currentDay) return -1;
            if (normalizedB === currentDay) return 1;
            return 0;
          });

          return (
            <Card key={program.id} className="w-full">
              <CardHeader>
                <CardTitle className="text-xl">{program.title}</CardTitle>
                <CardDescription>
                  {program.days.length} jour{program.days.length > 1 ? 's' : ''} d'entraînement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sortedDays.map((day, dayIndex) => {
                    const normalizedDay = normalizeDayName(day.day);
                    const isToday = normalizedDay === currentDay;

                    return (
                      <div
                        key={dayIndex}
                        className={`rounded-lg p-4 border-l-4 transition-all ${
                          isToday ? 'border-l-primary bg-primary/5 shadow-md' : 'border-l-muted bg-muted/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`font-semibold text-lg flex items-center gap-2 ${isToday ? 'text-primary' : ''}`}>
                            {isToday ? <Flame className="h-4 w-4 text-orange-500" /> : <Calendar className="h-4 w-4 text-muted-foreground" />}
                            {day.day}
                            {isToday && (
                              <Badge variant="default" className="ml-2 text-xs">
                                Aujourd'hui
                              </Badge>
                            )}
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {day.blocs.map((bloc, blocIndex) => (
                            <div key={blocIndex} className={`rounded-lg p-4 ${isToday ? 'bg-background border' : 'bg-muted/30'}`}>
                              <h4 className="font-medium text-md mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4 text-primary" />
                                {bloc.name}
                              </h4>

                              <div className="space-y-2">
                                {bloc.exercises.map((exercise, exerciseIndex) => (
                                  <div
                                    key={exerciseIndex}
                                    className={`rounded-lg p-3 border transition-all ${
                                      isToday ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'bg-background hover:bg-muted/50'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-sm mb-2">{exercise.exerciseName}</h5>

                                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                                          <div className="flex items-center gap-1">
                                            <BarChart3 className="h-3 w-3" />
                                            <span>{exercise.sets} séries</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Hash className="h-3 w-3" />
                                            <span>{exercise.reps} reps</span>
                                          </div>
                                          {exercise.charge && (
                                            <div className="flex items-center gap-1">
                                              <Scale className="h-3 w-3" />
                                              <span>{exercise.charge}</span>
                                            </div>
                                          )}
                                          {exercise.recovery && (
                                            <div className="flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              <span>{exercise.recovery}</span>
                                            </div>
                                          )}
                                        </div>

                                        {exercise.notes && (
                                          <div
                                            className={`mt-2 p-2 rounded text-xs ${
                                              isToday ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                                            }`}
                                          >
                                            <span className="font-medium flex items-center gap-1">
                                              <Lightbulb className="h-3 w-3" />
                                              Focus:
                                            </span>
                                            {exercise.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
