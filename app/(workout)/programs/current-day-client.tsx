'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { EXERCISES } from '@/lib/exercises';
import { Calendar, Dumbbell, Flame, PersonStandingIcon } from 'lucide-react';
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
  const [selectedProgram, setSelectedProgram] = useState<any>(programs[0] || null);

  useEffect(() => {
    setCurrentDay(getCurrentDayInFrench());
  }, []);

  useEffect(() => {
    if (programs.length > 0 && !selectedProgram) {
      setSelectedProgram(programs[0]);
    }
  }, [programs, selectedProgram]);

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
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Programmes d'entraînement</h1>
      </div>

      {/* Sélecteur de programmes - scroll horizontal */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1">
          {programs.map((program) => {
            const todaySession = program.sessions.find((s: any) => normalizeDayName(s.day) === currentDay);
            const totalExercises = program.sessions.reduce((acc: number, session: any) =>
              acc + session.blocs.reduce((blocAcc: number, bloc: any) => blocAcc + bloc.exercises.length, 0), 0
            );
            const isSelected = selectedProgram?.id === program.id;

            return (
              <button
                key={program.id}
                onClick={() => setSelectedProgram(program)}
                className={`flex-shrink-0 p-2 m-0.5 rounded-xl border transition-all ${isSelected
                  ? 'border-primary bg-primary/5 shadow-lg scale-105'
                  : 'border-muted bg-card hover:border-primary/50 hover:shadow-md hover:scale-102'
                  }`}
              >
                <div className="text-left">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold text-sm ${isSelected ? 'text-primary' : ''}`}>
                      {program.title}
                    </h3>
                    {todaySession && (
                      <Badge variant="default" className="text-xs px-1.5 py-0.5">
                        <Flame className="h-3 w-3 mr-1" />
                        Aujourd'hui
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>{program.sessions.length} session{program.sessions.length > 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{totalExercises} exercice{totalExercises > 1 ? 's' : ''}</span>
                    </div>
                    {todaySession && (
                      <div className="flex items-center gap-1 text-primary">
                        <Calendar className="h-3 w-3" />
                        <span>{todaySession.session} aujourd'hui</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions du programme sélectionné */}
      {selectedProgram && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{selectedProgram.title}</h2>
            <Badge variant="outline" className="text-xs">
              {selectedProgram.sessions.length} session{selectedProgram.sessions.length > 1 ? 's' : ''}
            </Badge>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {selectedProgram.sessions
              .sort((a: any, b: any) => {
                const normalizedA = normalizeDayName(a.day);
                const normalizedB = normalizeDayName(b.day);
                if (normalizedA === currentDay) return -1;
                if (normalizedB === currentDay) return 1;
                return 0;
              })
              .map((session: any, sessionIndex: number) => {
                const normalizedDay = normalizeDayName(session.day);
                const isToday = normalizedDay === currentDay;
                const sessionExercises = session.blocs.flatMap((bloc: any) => bloc.exercises);
                const sessionExerciseCount = sessionExercises.length;
                const sessionSetsCount = sessionExercises.reduce((acc: number, ex: any) => acc + (ex.sets || 1), 0);

                // Compter les types d'exercices pour cette session
                const uniqueExerciseNames = Array.from(new Set(sessionExercises.map((ex: any) => ex.exerciseName))) as string[];
                const exerciseTypes = uniqueExerciseNames.map((name: string) => {
                  const exerciseData = EXERCISES.find((ex: any) => ex.name.toLowerCase() === name.toLowerCase());
                  return {
                    name,
                    isBodyweight: exerciseData?.bodyweight || false,
                  };
                });
                const bodyweightCount = exerciseTypes.filter(e => e.isBodyweight).length;
                const otherCount = exerciseTypes.length - bodyweightCount;

                return (
                  <AccordionItem key={sessionIndex} value={sessionIndex.toString()} className="border-none">
                    <AccordionTrigger
                      className={`rounded-lg p-4 border-l-4 hover:no-underline ${isToday
                        ? 'border-l-primary bg-primary/5 shadow-sm'
                        : 'border-l-muted bg-muted/20'
                        }`}
                    >
                      <div className="flex items-start gap-4 w-full pr-2">
                        <div className="flex-1 text-left min-w-0">
                          <h3 className={`font-semibold text-lg flex items-center gap-2 ${isToday ? 'text-primary' : ''}`}>
                            {isToday ? <Flame className="h-5 w-5 text-orange-500" /> : <Calendar className="h-5 w-5 text-muted-foreground" />}
                            {session.session} - {session.day}
                            {isToday && (
                              <Badge variant="default" className="text-sm">
                                Aujourd'hui
                              </Badge>
                            )}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                            <p className="text-sm text-muted-foreground whitespace-nowrap">
                              {sessionExerciseCount} exercice{sessionExerciseCount > 1 ? 's' : ''} • {sessionSetsCount} série{sessionSetsCount > 1 ? 's' : ''}
                            </p>
                            {/* Exercise type badges */}
                            {otherCount > 0 && (
                              <Badge variant="outline" className="text-sm px-2 h-6 bg-blue-500/10 text-blue-600 border-blue-300/50">
                                <Dumbbell className="h-4 w-4 mr-1" />
                                {otherCount}
                              </Badge>
                            )}
                            {bodyweightCount > 0 && (
                              <Badge variant="outline" className="text-sm px-2 h-6 bg-green-500/10 text-green-600 border-green-300/50">
                                <PersonStandingIcon className="h-4 w-4 mr-1" />
                                {bodyweightCount}
                              </Badge>
                            )}
                          </div>
                          {/* Exercise names preview */}
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            {uniqueExerciseNames.slice(0, 5).map((name: string, idx: number) => (
                              <span key={name} className="text-sm text-muted-foreground/70">
                                {name}
                                {idx < Math.min(4, uniqueExerciseNames.length - 1) && ' •'}
                              </span>
                            ))}
                            {uniqueExerciseNames.length > 5 && (
                              <span className="text-sm text-muted-foreground/70">• +{uniqueExerciseNames.length - 5} autres</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      {/* Blocs de la session */}
                      <div className="space-y-3 ml-2 mt-2">
                        {session.blocs.map((bloc: any, blocIndex: number) => (
                          <div key={blocIndex} className="rounded-lg bg-background/50 border p-3">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                                {blocIndex + 1}
                              </div>
                              <h5 className="font-medium text-sm">{bloc.name}</h5>
                            </div>

                            {/* Exercices du bloc */}
                            <div className="space-y-2">
                              {bloc.exercises.map((exercise: any, exerciseIndex: number) => {
                                const exerciseData = EXERCISES.find((ex: any) => ex.name.toLowerCase() === exercise.exerciseName.toLowerCase());
                                const isBodyweight = exerciseData?.bodyweight || false;

                                return (
                                  <div
                                    key={exerciseIndex}
                                    className={`rounded-lg border p-3 transition-all ${isToday ? 'border-primary/20 bg-primary/5' : 'border-muted bg-background'
                                      }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className={`flex h-5 w-5 items-center justify-center rounded text-xs font-bold ${isToday ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
                                            {exerciseIndex + 1}
                                          </div>
                                          <h6 className="font-medium text-sm">{exercise.exerciseName}</h6>
                                          {isBodyweight && (
                                            <Badge variant="outline" className="text-xs p-1 bg-green-500/10 text-green-600 border-green-300/50">
                                              <PersonStandingIcon className="h-3 w-3" />
                                            </Badge>
                                          )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                                          <div className="flex items-center gap-1">
                                            <span className="font-medium">{exercise.sets || 1}</span>
                                            <span>séries</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span className="font-medium">{exercise.reps}</span>
                                            <span>reps</span>
                                          </div>
                                          {exercise.charge && (
                                            <div className="flex items-center gap-1">
                                              <span className="font-medium">{exercise.charge}</span>
                                              <span>charge</span>
                                            </div>
                                          )}
                                          {exercise.recovery && (
                                            <div className="flex items-center gap-1">
                                              <span className="font-medium">{exercise.recovery}</span>
                                              <span>repos</span>
                                            </div>
                                          )}
                                        </div>

                                        {exercise.notes && (
                                          <div className={`mt-2 p-2 rounded text-xs ${isToday ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
                                            <span className="font-medium">Focus:</span> {exercise.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </Accordion>
        </div>
      )}
    </div>
  );
}
