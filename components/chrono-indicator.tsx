"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Timer } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChronoState {
  time: number
  isRunning: boolean
  startTime: number | null
  initialStartTime: number | null
  savedTimes: Array<{ time: number; date: string }>
}

export function ChronoIndicator() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [initialStartTime, setInitialStartTime] = useState<number | null>(null)

  // Charger l'état depuis localStorage
  useEffect(() => {
    const loadState = () => {
      const savedState = localStorage.getItem("chronoState")
      if (savedState) {
        try {
          const parsed: ChronoState = JSON.parse(savedState)
          
          if (parsed.isRunning && parsed.initialStartTime) {
            const elapsed = Date.now() - parsed.initialStartTime
            setTime(elapsed)
            setIsRunning(true)
            setStartTime(parsed.startTime)
            setInitialStartTime(parsed.initialStartTime)
          } else {
            setTime(parsed.time || 0)
            setIsRunning(false)
            setStartTime(null)
            setInitialStartTime(parsed.initialStartTime)
          }
        } catch (error) {
          console.error("Erreur lors du chargement de l'état du chrono:", error)
        }
      }
    }

    loadState()

    // Écouter les changements dans localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chronoState") {
        loadState()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Mettre à jour le temps si le chrono est en cours
    let interval: NodeJS.Timeout | null = null
    if (isRunning && initialStartTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - initialStartTime
        setTime(elapsed)
      }, 100)
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, startTime, initialStartTime])

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`
  }

  // Ne rien afficher si le chrono est à 0 et pas en cours
  if (time === 0 && !isRunning) {
    return null
  }

  return (
    <Link href="/chrono">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200",
          "bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30",
          isRunning && "animate-pulse"
        )}
      >
        <Timer className={cn("h-4 w-4", isRunning ? "text-primary" : "text-muted-foreground")} />
        <span className={cn("text-sm font-mono font-medium", isRunning ? "text-primary" : "text-muted-foreground")}>
          {formatTime(time)}
        </span>
        {isRunning && (
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>
    </Link>
  )
}
