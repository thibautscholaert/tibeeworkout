"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { LogView } from "@/components/log-view"
import { HistoryView } from "@/components/history-view"
import { StatsView } from "@/components/stats-view"
import { WorkoutProvider } from "@/lib/workout-context"

type Tab = "log" | "history" | "stats"

export default function WorkoutTracker() {
  const [activeTab, setActiveTab] = useState<Tab>("log")

  return (
    <WorkoutProvider>
      <main className="min-h-screen bg-background">
        {/* Content Area */}
        <div className="mx-auto max-w-md px-4 pt-6 pb-24">
          {activeTab === "log" && <LogView />}
          {activeTab === "history" && <HistoryView />}
          {activeTab === "stats" && <StatsView />}
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </WorkoutProvider>
  )
}
