'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Program, WorkoutSet } from '@/lib/types';
import { getDayLabel, groupSetsByDate, groupSetsByWeek } from '@/lib/utils';
import { useWorkout } from '@/lib/workout-context';
import { Bot, Calendar, ClipboardList, Copy, Dumbbell, ExternalLink, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// ── constants ─────────────────────────────────────────────────────────────────

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;
type Day = (typeof DAYS)[number];
const LS_KEY = 'ai-available-days';

function loadAvailableDays(): Day[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((d): d is Day => DAYS.includes(d)) : [];
  } catch {
    return [];
  }
}

function saveAvailableDays(days: Day[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(days));
}

// ── helpers ───────────────────────────────────────────────────────────────────

function formatSessionText(sets: WorkoutSet[]): string {
  const byExercise = new Map<string, WorkoutSet[]>();
  for (const s of sets) {
    const arr = byExercise.get(s.exerciseName) ?? [];
    arr.push(s);
    byExercise.set(s.exerciseName, arr);
  }
  return Array.from(byExercise.entries())
    .map(([name, exSets]) => {
      const lines = exSets.map((s) => `${s.weight === 0 ? 'BW' : `${s.weight}kg`} × ${s.reps}`).join(', ');
      return `${name}: ${lines}`;
    })
    .join('\n');
}

function formatWeekText(sets: WorkoutSet[]): string {
  const byDate = groupSetsByDate(sets);
  return Array.from(byDate.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([dateStr, daySets]) => {
      const label = getDayLabel(new Date(dateStr));
      return `[${label}]\n${formatSessionText(daySets)}`;
    })
    .join('\n\n');
}

function formatProgramText(program: Program): string {
  return program.sessions
    .map((session) => {
      const exercises = session.blocs
        .flatMap((b) => b.exercises)
        .map((e) => {
          let line = `${e.exerciseName} ${e.sets}×${e.reps}`;
          if (e.charge) line += ` @${e.charge}kg`;
          if (e.notes) line += ` (${e.notes})`;
          return line;
        })
        .join('\n');
      return `[${session.session} – ${session.day}]\n${exercises}`;
    })
    .join('\n\n');
}

const CHATGPT_PROJECT_URL = 'https://chatgpt.com/g/g-p-69c65f20f83c8191989c470b34aa8807-workout/project';

async function copyOnly(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

async function copyAndOpen(prompt: string): Promise<void> {
  await navigator.clipboard.writeText(prompt);
  window.open(CHATGPT_PROJECT_URL, '_blank');
}

// ── sub-components ────────────────────────────────────────────────────────────

interface ActionCardProps {
  title: string;
  description: string;
  prompt: string;
}

function ActionCard({ title, description, prompt }: ActionCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 px-3 shrink-0" onClick={() => copyOnly(prompt)}>
          <Copy className="h-3.5 w-3.5" />
          Copier
        </Button>
        <Button variant="default" size="sm" className="flex-1 gap-1.5" onClick={() => copyAndOpen(prompt)}>
          <ExternalLink className="h-3.5 w-3.5" />
          Copier &amp; Demander à ChatGPT
        </Button>
      </div>
    </div>
  );
}

// ── day selector ──────────────────────────────────────────────────────────────

interface DaySelectorProps {
  selected: Day[];
  onChange: (days: Day[]) => void;
}

function DaySelector({ selected, onChange }: DaySelectorProps) {
  const toggle = (day: Day) => {
    const next = selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Disponibilités cette semaine</p>
      <div className="flex gap-1.5">
        {DAYS.map((day) => {
          const active = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              className={[
                'flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors',
                active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80',
              ].join(' ')}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── main view ─────────────────────────────────────────────────────────────────

export function AiView() {
  const { history, workoutPrograms } = useWorkout();

  const [availableDays, setAvailableDays] = useState<Day[]>([]);

  useEffect(() => {
    setAvailableDays(loadAvailableDays());
  }, []);

  const handleDaysChange = (days: Day[]) => {
    setAvailableDays(days);
    saveAvailableDays(days);
  };

  const todaySets = useMemo(() => {
    const today = new Date().toDateString();
    return history.filter((s) => new Date(s.timestamp).toDateString() === today);
  }, [history]);

  const thisWeekSets = useMemo(() => {
    const byWeek = groupSetsByWeek(history);
    const sorted = Array.from(byWeek.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    return sorted.length > 0 ? sorted[0][1] : [];
  }, [history]);

  const isCurrentWeek = useMemo(() => {
    if (thisWeekSets.length === 0) return false;
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);
    const mostRecent = new Date(Math.max(...thisWeekSets.map((s) => new Date(s.timestamp).getTime())));
    return mostRecent >= monday;
  }, [thisWeekSets]);

  const todayText = formatSessionText(todaySets);
  const weekText = formatWeekText(thisWeekSets);

  const dateContext = `Nous sommes le ${new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}.\n\n`;

  const availabilityContext = availableDays.length > 0 ? `Mes disponibilités pour m'entraîner cette semaine : ${availableDays.join(', ')}.\n\n` : '';

  const todayPrompt =
    dateContext +
    `Voici ma séance d'entraînement d'aujourd'hui :\n\n${todayText}\n\n` +
    `Analyse-la : volume, intensité, équilibre musculaire, et donne-moi des retours concrets.`;

  const weekPrompt = isCurrentWeek
    ? dateContext +
      `Voici ma semaine d'entraînement en cours :\n\n${weekText}\n\n` +
      `Analyse la semaine : fréquence, équilibre musculaire, répartition du volume, et suggère des améliorations.`
    : dateContext +
      `Voici ma dernière semaine d'entraînement (semaine passée) :\n\n${weekText}\n\n` +
      `Analyse cette semaine : fréquence, équilibre musculaire, répartition du volume, et suggère des améliorations pour la semaine à venir.`;

  const nextSessionPrompt = isCurrentWeek
    ? dateContext +
      availabilityContext +
      `Voici mon historique d'entraînement de la semaine en cours :\n\n${weekText}\n\n` +
      `En te basant sur ces séances et mes disponibilités, propose-moi un programme complet pour la semaine prochaine. ` +
      `Tiens compte des groupes musculaires déjà travaillés, de la fatigue accumulée et de la progression. ` +
      `Pour chaque jour disponible, détaille les exercices, séries, répétitions et charges suggérées.`
    : dateContext +
      availabilityContext +
      `Voici mon historique d'entraînement de la semaine dernière :\n\n${weekText}\n\n` +
      `En te basant sur cette semaine passée et mes disponibilités, propose-moi un programme complet pour la semaine à venir. ` +
      `Tiens compte des groupes musculaires travaillés, de la récupération depuis, et de la progression. ` +
      `Pour chaque jour disponible, détaille les exercices, séries, répétitions et charges suggérées.`;

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
      </div>

      <p className="text-sm text-muted-foreground -mt-4">Copie le prompt ou ouvre directement ton projet ChatGPT avec le contexte prêt à coller.</p>

      {/* Day selector */}
      <div className="rounded-xl border border-border bg-card p-4">
        <DaySelector selected={availableDays} onChange={handleDaysChange} />
      </div>

      <Separator />

      {/* Semaine suivante */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Semaine suivante</span>
        </div>

        {thisWeekSets.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucune séance enregistrée.</p>
        ) : (
          <ActionCard
            title="Générer la semaine suivante"
            description={isCurrentWeek ? 'Basé sur les séances de la semaine en cours' : 'Basé sur la semaine dernière — relance optimale'}
            prompt={nextSessionPrompt}
          />
        )}
      </div>

      <Separator />

      {/* Séance du jour */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Séance du jour</span>
        </div>

        {todaySets.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucune série enregistrée aujourd'hui.</p>
        ) : (
          <ActionCard
            title="Analyser la séance du jour"
            description={`${todaySets.length} séries · ${new Set(todaySets.map((s) => s.exerciseName)).size} exercices`}
            prompt={todayPrompt}
          />
        )}
      </div>

      <Separator />

      {/* Semaine */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {isCurrentWeek ? 'Cette semaine' : 'Semaine passée'}
          </span>
        </div>

        {thisWeekSets.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucune séance cette semaine.</p>
        ) : (
          <ActionCard
            title={isCurrentWeek ? 'Analyser la semaine en cours' : 'Analyser la semaine passée'}
            description={`${thisWeekSets.length} séries sur ${new Set(thisWeekSets.map((s) => new Date(s.timestamp).toDateString())).size} jours`}
            prompt={weekPrompt}
          />
        )}
      </div>

      <Separator />

      {/* Programmes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Programmes</span>
        </div>

        {workoutPrograms.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucun programme trouvé.</p>
        ) : (
          <div className="space-y-3">
            {workoutPrograms.map((program) => {
              const programText = formatProgramText(program);
              const programPrompt =
                dateContext +
                `Voici mon programme d'entraînement "${program.title}" :\n\n${programText}\n\n` +
                `Analyse-le : structure, progression, équilibre musculaire, et suggère des améliorations.`;
              return (
                <ActionCard
                  key={program.id}
                  title={program.title}
                  description={`${program.sessions.length} session${program.sessions.length > 1 ? 's' : ''}`}
                  prompt={programPrompt}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
