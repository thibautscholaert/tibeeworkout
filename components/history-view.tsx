'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatReps, formatWeight, groupSetsByDate, groupSetsByExercise } from '@/lib/utils';
import { useWorkout } from '@/lib/workout-context';
import { BarChart3, Calendar, Flame, Target, TrendingUp, Trophy } from 'lucide-react';
import { useMemo } from 'react';

export function HistoryView() {
  const { history } = useWorkout();

  const groupedByDate = useMemo(() => {
    const byDate = groupSetsByDate(history);
    // Sort by date descending
    return Array.from(byDate.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [history]);

  // Calculer les statistiques globales
  const totalStats = useMemo(() => {
    const totalVolume = history.reduce((acc, set) => acc + set.weight * set.reps, 0);
    const totalReps = history.reduce((acc, set) => acc + set.reps, 0);
    const uniqueExercises = new Set(history.map((set) => set.exerciseName)).size;
    const totalDays = groupedByDate.length;

    return { totalVolume, totalReps, uniqueExercises, totalDays };
  }, [history, groupedByDate]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Aucun historique</h2>
          <p className="text-sm text-muted-foreground max-w-sm">Commencez à enregistrer vos séries pour voir votre historique d'entraînement ici</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Historique</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">{history.length}</div>
          <span className="text-sm text-muted-foreground">séries</span>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Statistiques globales */}
      <div className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-primary" />
          <span className="font-semibold">Statistiques globales</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">{totalStats.totalDays}</div>
            <div className="text-xs text-muted-foreground">Jours</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">{totalStats.uniqueExercises}</div>
            <div className="text-xs text-muted-foreground">Exercices</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">{totalStats.totalVolume.toLocaleString()}kg</div>
            <div className="text-xs text-muted-foreground">Volume total</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">{totalStats.totalReps.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Reps totales</div>
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Sessions par date */}
      <div className="space-y-6">
        {groupedByDate.map(([dateString, sets], dateIndex) => {
          const byExercise = groupSetsByExercise(sets);
          const exerciseEntries = Array.from(byExercise.entries());
          const date = new Date(dateString);
          const isToday = dateString === new Date().toISOString().split('T')[0];
          const sessionVolume = sets.reduce((acc, set) => acc + set.weight * set.reps, 0);

          return (
            <div key={dateString} className="space-y-4">
              {/* Header de la session */}
              <div className={`rounded-lg p-4 border-l-4 ${isToday ? 'border-l-primary bg-primary/5 shadow-sm' : 'border-l-muted bg-muted/20'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                      <span className="text-lg font-bold text-primary">{dateIndex + 1}</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold text-base flex items-center gap-2 ${isToday ? 'text-primary' : ''}`}>
                        {isToday ? <Flame className="h-4 w-4 text-orange-500" /> : <Calendar className="h-4 w-4 text-muted-foreground" />}
                        {formatDate(date)}
                        {isToday && (
                          <Badge variant="default" className="ml-2 text-xs">
                            Aujourd'hui
                          </Badge>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {exerciseEntries.length} exercice{exerciseEntries.length > 1 ? 's' : ''} •{sets.length} série{sets.length > 1 ? 's' : ''} •
                        {sessionVolume.toLocaleString()}kg
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exercices de la session */}
              <div className="space-y-3 ml-14">
                {exerciseEntries.map(([exerciseName, exerciseSets], exerciseIndex) => {
                  const totalVolume = exerciseSets.reduce((acc, s) => acc + s.weight * s.reps, 0);
                  const maxWeight = Math.max(...exerciseSets.map((s) => s.weight));
                  const avgReps = Math.round(exerciseSets.reduce((acc, s) => acc + s.reps, 0) / exerciseSets.length);

                  return (
                    <div key={exerciseName} className="space-y-2">
                      {/* Header de l'exercice */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            {exerciseIndex + 1}
                          </div>
                          <h4 className="font-medium text-sm">{exerciseName}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{exerciseSets.length} séries</span>
                          <span className="text-primary font-medium">Max: {formatWeight(maxWeight, exerciseName)}</span>
                        </div>
                      </div>

                      {/* Séries */}
                      <div className="grid grid-cols-1 gap-1">
                        {exerciseSets.map((set, setIndex) => (
                          <div
                            key={set.id}
                            className={`group relative overflow-hidden rounded-lg border border-border/50 p-2 transition-all hover:border-primary/30 hover:shadow-sm ${
                              isToday ? 'bg-primary/5 hover:bg-primary/10' : 'bg-card hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                  {setIndex + 1}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium font-mono">{formatWeight(set.weight, set.exerciseName)}</span>
                                  <span className="text-xs text-muted-foreground">×</span>
                                  <span className="text-sm font-medium font-mono">{formatReps(set.reps, set.exerciseName)}</span>
                                </div>
                                {set.estimated1RM && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">1RM:</span>
                                    <span className="text-xs font-medium text-primary">~{set.estimated1RM}kg</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(set.timestamp).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>

                            {/* Barre de progression */}
                            <div
                              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary/20 to-primary/40 transition-all group-hover:h-1"
                              style={{ width: `${((setIndex + 1) / exerciseSets.length) * 100}%` }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Statistiques de l'exercice */}
                      <div className="flex items-center gap-4 rounded-lg bg-muted/30 p-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          <span>Volume: {totalVolume.toLocaleString()}kg</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>Moy: {avgReps} reps</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          <span>Max: {formatWeight(maxWeight, exerciseName)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Separator entre les sessions */}
              {dateIndex < groupedByDate.length - 1 && <Separator className="mt-6" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
