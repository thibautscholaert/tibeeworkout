'use client';

import { useEffect, useState } from 'react';

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

interface CurrentDayClientProps {
  programs: any[];
}

export default function CurrentDayClient({ programs }: CurrentDayClientProps) {
  const [currentDay, setCurrentDay] = useState<string>('');

  useEffect(() => {
    setCurrentDay(getCurrentDayInFrench());
  }, []);

  if (!currentDay) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Programmes d'entraînement</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Programmes d'entraînement</h1>
        <p className="text-muted-foreground">Aujourd'hui: {currentDay}</p>
      </div>

      <div className="space-y-6">
        {programs.map((program) => {
          // Trier les sessions pour mettre le jour actuel en premier
          const sortedSessions = [...program.sessions].sort((a, b) => {
            const normalizedA = normalizeDayName(a.day);
            const normalizedB = normalizeDayName(b.day);

            if (normalizedA === currentDay) return -1;
            if (normalizedB === currentDay) return 1;
            return 0;
          });

          return (
            <div key={program.id} className="w-full">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">{program.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {program.sessions.length} session{program.sessions.length > 1 ? 's' : ''} d'entraînement
                  </p>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-6">
                    {sortedSessions.map((session: any, sessionIndex: number) => {
                      const normalizedDay = normalizeDayName(session.day);
                      const isToday = normalizedDay === currentDay;

                      return (
                        <div
                          key={sessionIndex}
                          className={`rounded-lg p-2 pr-0 border-l-4 transition-all ${
                            isToday ? 'border-l-primary bg-primary/5 shadow-md' : 'border-l-muted bg-muted/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className={`font-semibold text-lg flex items-center gap-2 ${isToday ? 'text-primary' : ''}`}>
                              {isToday ? (
                                <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                                  />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                              {session.session} - {session.day}
                              {isToday && <div className="ml-2 text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">Aujourd'hui</div>}
                            </h3>
                          </div>

                          <div className="space-y-4">
                            {session.blocs.map((bloc: any, blocIndex: number) => (
                              <div key={blocIndex} className={`rounded-lg p-4 ${isToday ? 'bg-background border' : 'bg-muted/30'}`}>
                                <h4 className="font-medium text-md mb-3 flex items-center gap-2">
                                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                  </svg>
                                  {bloc.name}
                                </h4>

                                <div className="space-y-2">
                                  {bloc.exercises.map((exercise: any, exerciseIndex: number) => (
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
                                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                />
                                              </svg>
                                              <span>{exercise.sets} séries</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                                />
                                              </svg>
                                              <span>{exercise.reps} reps</span>
                                            </div>
                                            {exercise.charge && (
                                              <div className="flex items-center gap-1">
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                                  />
                                                </svg>
                                                <span>{exercise.charge}</span>
                                              </div>
                                            )}
                                            {exercise.recovery && (
                                              <div className="flex items-center gap-1">
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                  />
                                                </svg>
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
                                              <span className="flex items-center gap-1">
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                                  />
                                                </svg>
                                                <span className="font-medium ">Focus:</span> {exercise.notes}
                                              </span>
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
