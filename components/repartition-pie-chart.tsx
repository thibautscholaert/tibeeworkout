'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';

const RADIAN = Math.PI / 180;

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.35 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 24 } },
};

export type RepartitionSlice = {
  name: string;
  count: number;
  percent: number;
  fill: string;
  icon?: LucideIcon;
};

type RepartitionPieChartProps = {
  data: RepartitionSlice[];
  className?: string;
  summary?: string;
  emptyMessage?: string;
  noDataMessage?: string;
  hasHistory?: boolean;
  /** Solid pie (no donut hole). */
  filled?: boolean;
};

function renderSliceIconLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
  payload,
  index = 0,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  payload?: RepartitionSlice;
  index?: number;
}) {
  const Icon = payload?.icon;
  if (!Icon || (percent ?? 0) < 0.06) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <foreignObject x={x - 14} y={y - 14} width={28} height={28} className="overflow-visible">
      <motion.div
        className="flex h-full w-full items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.25 + index * 0.1,
          type: 'spring',
          stiffness: 280,
          damping: 18,
        }}
      >
        <Icon className="h-6 w-6 text-primary-foreground drop-shadow-sm" strokeWidth={2} />
      </motion.div>
    </foreignObject>
  );
}

function SliceIndicator({ slice }: { slice: RepartitionSlice }) {
  const Icon = slice.icon;
  if (Icon) {
    return (
      <motion.span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/50"
        style={{ backgroundColor: slice.fill }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <Icon className="h-4 w-4 text-primary-foreground" strokeWidth={2} />
      </motion.span>
    );
  }
  return <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: slice.fill }} />;
}

export function RepartitionPieChart({
  data,
  className,
  summary,
  emptyMessage = 'Aucune donnée pour afficher la répartition',
  noDataMessage = 'Aucune donnée classifiable dans l\u2019historique',
  hasHistory = true,
  filled = false,
}: RepartitionPieChartProps) {
  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        data.map((slice) => [
          slice.name,
          {
            label: slice.name,
            color: slice.fill,
            ...(slice.icon ? { icon: slice.icon } : {}),
          },
        ])
      ),
    [data]
  );

  const hasIcons = data.some((slice) => slice.icon);
  const animated = filled && hasIcons;

  if (!hasHistory) {
    return (
      <motion.div
        className={cn('flex h-[220px] items-center justify-center text-sm text-muted-foreground', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {emptyMessage}
      </motion.div>
    );
  }

  if (data.length === 0) {
    return (
      <motion.div
        className={cn('flex h-[220px] items-center justify-center text-sm text-muted-foreground', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {noDataMessage}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn('space-y-1', className)}
      initial={animated ? { opacity: 0, y: 10 } : false}
      animate={animated ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {summary && (
        <motion.p
          className="text-xs text-muted-foreground"
          initial={animated ? { opacity: 0 } : false}
          animate={animated ? { opacity: 1 } : false}
          transition={{ delay: 0.1 }}
        >
          {summary}
        </motion.p>
      )}

      <motion.div
        initial={animated ? { opacity: 0, scale: 0.88 } : false}
        animate={animated ? { opacity: 1, scale: 1 } : false}
        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.05 }}
      >
        <ChartContainer config={chartConfig} className={cn('mx-auto w-full max-w-md', filled ? 'aspect-square h-[280px]' : 'h-[260px]')}>
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => {
                    const slice = item.payload as RepartitionSlice | undefined;
                    const label = slice?.name ?? (name as string);
                    const percent = slice?.percent ?? item.payload?.percent;
                    const Icon = slice?.icon;
                    return (
                      <>
                        <span className="flex items-center gap-0.5 min-w-0">
                          {Icon ? (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: slice?.fill }}>
                              <Icon className="h-3.5 w-3.5 text-primary-foreground" />
                            </span>
                          ) : slice?.fill ? (
                            <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: slice.fill }} />
                          ) : null}
                          <span className="font-medium truncate">{label}</span>
                        </span>
                        <span className="font-mono font-medium tabular-nums shrink-0">
                          {typeof value === 'number' ? value.toLocaleString() : value} ({percent}%)
                        </span>
                      </>
                    );
                  }}
                />
              }
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={filled ? 0 : 56}
              outerRadius={filled ? '88%' : 96}
              paddingAngle={filled ? 0 : 2}
              strokeWidth={filled ? 1 : 2}
              stroke="hsl(var(--background))"
              label={hasIcons ? renderSliceIconLabel : undefined}
              labelLine={false}
              isAnimationActive
              animationDuration={animated ? 700 : 400}
              animationBegin={0}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </motion.div>

      <motion.ul
        className={cn('flex flex-wrap justify-between gap-2 text-xs', filled && hasIcons ? ' ' : 'gap-y-1.5 ')}
        variants={animated ? listVariants : undefined}
        initial={animated ? 'hidden' : false}
        animate={animated ? 'show' : false}
      >
        {data.map((slice) => (
          <motion.li
            key={slice.name}
            variants={animated ? listItemVariants : undefined}
            className={cn(
              'flex items-center justify-between gap-1 min-w-0',
              filled && hasIcons && 'rounded-lg border border-border/40 bg-muted/20 p-2'
            )}
            whileHover={animated ? { scale: 1.02 } : undefined}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <span className="flex items-center gap-1 min-w-0">
              <SliceIndicator slice={slice} />
              <span className={cn('truncate text-muted-foreground')}>{slice.name}</span>
            </span>
            <span className="shrink-0 font-medium tabular-nums">{slice.percent}%</span>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
