"use client"

import { useState, useEffect, useRef } from "react"
import { Timer, Play, Pause, RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface ChronoState {
  time: number
  isRunning: boolean
  startTime: number | null
  initialStartTime: number | null
  savedTimes: Array<{ time: number; date: string }>
}

export default function ChronoPage() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [savedTimes, setSavedTimes] = useState<Array<{ time: number; date: string }>>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const initialStartTimeRef = useRef<number | null>(null)

  // Charger l'état depuis localStorage au montage
  useEffect(() => {
    const savedState = localStorage.getItem("chronoState")
    if (savedState) {
      try {
        const parsed: ChronoState = JSON.parse(savedState)
        setSavedTimes(parsed.savedTimes || [])
        
        // Si le chrono était en cours, calculer le temps écoulé depuis le début
        if (parsed.isRunning && parsed.initialStartTime) {
          const elapsed = Date.now() - parsed.initialStartTime
          setTime(elapsed) // Utiliser le temps écoulé depuis le vrai début
          setIsRunning(true)
          startTimeRef.current = parsed.startTime
          initialStartTimeRef.current = parsed.initialStartTime
        } else {
          setTime(parsed.time || 0) // Utiliser le temps sauvegardé (incluant les pauses)
          initialStartTimeRef.current = parsed.initialStartTime
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'état du chrono:", error)
      }
    }
  }, [])

  // Sauvegarder l'état dans localStorage à chaque changement (uniquement si le chrono est en cours)
  useEffect(() => {
    if (isRunning) {
      const stateToSave: ChronoState = {
        time,
        isRunning,
        startTime: startTimeRef.current,
        initialStartTime: initialStartTimeRef.current,
        savedTimes
      }
      localStorage.setItem("chronoState", JSON.stringify(stateToSave))
    }
  }, [time, isRunning, savedTimes])

  // Sauvegarder l'état final quand le chrono s'arrête
  useEffect(() => {
    if (!isRunning && startTimeRef.current === null && time > 0) {
      const stateToSave: ChronoState = {
        time,
        isRunning: false,
        startTime: null,
        initialStartTime: initialStartTimeRef.current,
        savedTimes
      }
      localStorage.setItem("chronoState", JSON.stringify(stateToSave))
    }
  }, [isRunning, time, savedTimes])

  // Gérer le chronomètre
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10)
      }, 10)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true)
      
      // Si c'est le premier démarrage, initialiser initialStartTime
      if (!initialStartTimeRef.current) {
        initialStartTimeRef.current = Date.now()
        setTime(0) // Remettre le temps à 0 pour le premier démarrage
      } else {
        // C'est une reprise après pause, on garde le temps accumulé
        // mais on ajuste initialStartTime pour qu'il corresponde au temps réel
        const realElapsed = time
        initialStartTimeRef.current = Date.now() - realElapsed
      }
      
      startTimeRef.current = Date.now()
      
      // Sauvegarder le nouvel état de démarrage
      const stateToSave: ChronoState = {
        time, // Garder le temps actuel
        isRunning: true,
        startTime: Date.now(),
        initialStartTime: initialStartTimeRef.current,
        savedTimes
      }
      localStorage.setItem("chronoState", JSON.stringify(stateToSave))
    }
  }

  const handlePause = () => {
    setIsRunning(false)
    startTimeRef.current = null
  }

  const handleReset = () => {
    setIsRunning(false)
    setTime(0)
    startTimeRef.current = null
    initialStartTimeRef.current = null // Reset du initialStartTime
    
    // Sauvegarder l'état reset dans localStorage
    const stateToSave: ChronoState = {
      time: 0,
      isRunning: false,
      startTime: null,
      initialStartTime: null,
      savedTimes
    }
    localStorage.setItem("chronoState", JSON.stringify(stateToSave))
  }

  const handleSave = () => {
    if (time > 0) {
      const newEntry = {
        time,
        date: new Date().toLocaleString("fr-FR")
      }
      setSavedTimes(prev => [newEntry, ...prev])
      toast.success("Temps sauvegardé!")
    }
  }

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const ms = Math.floor((milliseconds % 1000) / 10)

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
  }

  const clearSavedTimes = () => {
    setSavedTimes([])
    toast.success("Temps sauvegardés effacés!")
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Chronomètre</h1>
        <p className="text-muted-foreground">Mesurez vos temps de repos</p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Affichage du temps */}
            <div className="relative">
              <Timer className="absolute -top-8 left-1/2 -translate-x-1/2 h-6 w-6 text-primary/20" />
              <div className="text-6xl font-mono font-bold tracking-tight tabular-nums">
                {formatTime(time)}
              </div>
            </div>

            {/* Contrôles */}
            <div className="flex justify-center gap-3">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="w-20 h-20 rounded-full"
                >
                  <Play className="h-6 w-6" />
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  size="lg"
                  variant="secondary"
                  className="w-20 h-20 rounded-full"
                >
                  <Pause className="h-6 w-6" />
                </Button>
              )}
              
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="w-20 h-20 rounded-full"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>

              <Button
                onClick={handleSave}
                size="lg"
                variant="outline"
                className="w-20 h-20 rounded-full"
                disabled={time === 0}
              >
                <Save className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Temps sauvegardés */}
      {savedTimes.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Temps sauvegardés</h3>
              <Button
                onClick={clearSavedTimes}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
              >
                Effacer tout
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedTimes.map((entry, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 rounded-lg bg-muted/50"
                >
                  <span className="font-mono text-sm">
                    {formatTime(entry.time)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.date}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
