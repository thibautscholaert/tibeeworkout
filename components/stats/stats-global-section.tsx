'use client';

import { ConsistencyHeatmap } from '@/components/consistency-heatmap';
import { ExerciseCatsRepartitionChart } from '@/components/exercise-cats-repartition-chart';
import { ExerciseTagsRepartitionChart } from '@/components/exercise-tags-repartition-chart';
import { TrainingStyleRepartitionChart } from '@/components/training-style-repartition-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkoutSet } from '@/lib/types';
import { Calendar, ChartScatter, PieChart } from 'lucide-react';

type StatsGlobalSectionProps = {
  history: WorkoutSet[];
};

export function StatsGlobalSection({ history }: StatsGlobalSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      {/* <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Vue globale</h2>
      </div> */}

      <section className="space-y-4">
        <header className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-base font-medium">Consistance</h3>
        </header>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="">
            <CardTitle className="text-base">Heatmap hebdomadaire</CardTitle>
            <CardDescription>Activité par jour (tous exercices)</CardDescription>
          </CardHeader>
          <CardContent>
            <ConsistencyHeatmap history={history} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <header className="flex items-center gap-2">
          <ChartScatter className="h-5 w-5 text-primary" />
          <h3 className="text-base font-medium">Répartition</h3>
        </header>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Par catégorie
            </CardTitle>
            {/* <CardDescription>Top catégories les plus travaillées selon vos séries</CardDescription> */}
          </CardHeader>
          <CardContent>
            <ExerciseCatsRepartitionChart history={history} />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Par tags
            </CardTitle>
            {/* <CardDescription>Top catégories les plus travaillées selon vos séries</CardDescription> */}
          </CardHeader>
          <CardContent>
            <ExerciseTagsRepartitionChart history={history} />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Par style
            </CardTitle>
            {/* <CardDescription>Poids du corps, powerlifting ou bodybuilding classique</CardDescription> */}
          </CardHeader>
          <CardContent>
            <TrainingStyleRepartitionChart history={history} />
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
