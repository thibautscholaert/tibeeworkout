"use client"

import { cn } from "@/lib/utils"
import {
  BarChart3,
  ClipboardList,
  Clock,
  Dumbbell,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { id: "log", label: "Log", icon: Dumbbell, href: "/log" },
    { id: "programs", label: "Programs", icon: ClipboardList, href: "/programs" },
    { id: "chrono", label: "Chrono", icon: Clock, href: "/chrono" },
    { id: "history", label: "History", icon: BarChart3, href: "/history" },
    { id: "stats", label: "Stats", icon: TrendingUp, href: "/stats" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                  isActive && "bg-primary/15",
                )}
              >
                <tab.icon className={cn("h-5 w-5", isActive && "scale-110")} />
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  )
}