'use client';

import { BottomNav } from '@/components/bottom-nav';
import { WorkoutProvider } from '@/lib/workout-context';

export default function WorkoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkoutProvider>
      <main className="min-h-screen bg-background">
        {/* Content Area */}
        <div className="mx-auto max-w-md px-1 pt-6 pb-24">{children}</div>

        {/* Bottom Navigation */}
        <BottomNav />
      </main>
    </WorkoutProvider>
  );
}
