const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function extractYouTubeId(value: string): string | null {
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  if (YOUTUBE_ID_PATTERN.test(trimmedValue)) {
    return trimmedValue;
  }

  try {
    const url = new URL(trimmedValue);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const watchId = url.searchParams.get('v');
      if (watchId && YOUTUBE_ID_PATTERN.test(watchId)) return watchId;

      const parts = url.pathname.split('/').filter(Boolean);
      const videoPathIndex = parts.findIndex((part) => ['shorts', 'embed', 'live'].includes(part));
      const pathId = videoPathIndex >= 0 ? parts[videoPathIndex + 1] : null;
      return pathId && YOUTUBE_ID_PATTERN.test(pathId) ? pathId : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
}
