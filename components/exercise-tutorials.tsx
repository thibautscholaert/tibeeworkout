'use client';

import { addTutorialVideo, deleteTutorialVideo } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TutorialVideo } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useWorkout } from '@/lib/workout-context';
import { extractYouTubeId, getYouTubeEmbedUrl } from '@/lib/youtube';
import { Loader2, Plus, Trash2, Video, Youtube } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';

export function ExerciseTutorials({ selectedExercise }: { selectedExercise: string }) {
  const { tutorialVideos, fetchTutorialVideos } = useWorkout();
  const [youtubeInput, setYoutubeInput] = useState('');
  const [label, setLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<TutorialVideo | null>(null);

  const videos = useMemo(() => {
    return tutorialVideos.filter((video) => video.exerciseName.toLowerCase() === selectedExercise.toLowerCase());
  }, [tutorialVideos, selectedExercise]);

  const handleAddVideo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const youtubeId = extractYouTubeId(youtubeInput);
    if (!youtubeId) {
      toast.error('Lien YouTube invalide');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addTutorialVideo({
        exerciseName: selectedExercise,
        youtubeInput: youtubeId,
        label,
      });

      if (result.success) {
        toast.success('Vidéo ajoutée');
        setYoutubeInput('');
        setLabel('');
        fetchTutorialVideos(true);
      } else {
        toast.error(result.error || 'Impossible d’ajouter la vidéo');
      }
    } catch (error) {
      console.error('Error adding tutorial video:', error);
      toast.error('Impossible d’ajouter la vidéo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;

    setDeletingId(videoToDelete.id);
    try {
      const result = await deleteTutorialVideo(videoToDelete.id);
      if (result.success) {
        toast.success('Vidéo supprimée');
        setVideoToDelete(null);
        fetchTutorialVideos(true);
      } else {
        toast.error(result.error || 'Impossible de supprimer la vidéo');
      }
    } catch (error) {
      console.error('Error deleting tutorial video:', error);
      toast.error('Impossible de supprimer la vidéo');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-3">
      <ConfirmationDialog
        open={Boolean(videoToDelete)}
        onOpenChange={(open) => {
          if (!open && !deletingId) {
            setVideoToDelete(null);
          }
        }}
        title="Supprimer cette vidéo ?"
        description={videoToDelete ? `${videoToDelete.label || 'Tutoriel'} - ${videoToDelete.youtubeId}` : undefined}
        confirmLabel="Supprimer"
        destructive
        isConfirming={Boolean(deletingId)}
        onConfirm={handleDeleteVideo}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Youtube className="h-5 w-5 shrink-0 text-red-600" />
          <h2 className="truncate text-lg font-semibold">Tutos {selectedExercise}</h2>
        </div>
        <Badge variant="outline" className="shrink-0">
          {videos.length} vidéo{videos.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {videos.length > 0 ? (
        <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
          {videos.map((video, index) => (
            <div key={video.id} className="min-w-[78vw] max-w-[320px] snap-start space-y-2 sm:min-w-[280px]">
              <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
                <iframe
                  className="aspect-[9/16] w-full bg-black"
                  src={getYouTubeEmbedUrl(video.youtubeId)}
                  title={video.label || `${selectedExercise} tuto ${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{video.label || `Tuto ${index + 1}`}</p>
                  <p className="truncate text-xs text-muted-foreground">{video.youtubeId}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVideoToDelete(video)}
                  disabled={deletingId === video.id}
                  aria-label="Supprimer la vidéo"
                  className="h-8 w-8 shrink-0 p-0"
                >
                  {deletingId === video.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          <Video className="h-4 w-4 shrink-0" />
          <span>Aucune vidéo pour cet exercice.</span>
        </div>
      )}

      <Card className="border-border/50">
        <CardContent className="p-3">
          <form onSubmit={handleAddVideo} className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_0.8fr_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="tutorial-youtube" className="text-sm text-muted-foreground">
                  YouTube
                </Label>
                <Input
                  id="tutorial-youtube"
                  value={youtubeInput}
                  onChange={(event) => setYoutubeInput(event.target.value)}
                  placeholder="Short, URL ou ID"
                  disabled={isSubmitting}
                  className={cn(extractYouTubeId(youtubeInput) && 'border-red-500/40')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tutorial-label" className="text-sm text-muted-foreground">
                  Label
                </Label>
                <Input
                  id="tutorial-label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Technique, échauffement..."
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" disabled={isSubmitting || !selectedExercise} className="h-9">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Ajouter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
