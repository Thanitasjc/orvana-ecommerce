export function parseYouTubeId(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;

  const value = input.trim();

  if (/^[\w-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.slice(1).split("/")[0] || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) return fromQuery;

      const fromEmbed = url.pathname.match(/\/embed\/([^/?]+)/);
      if (fromEmbed?.[1]) return fromEmbed[1];

      const fromShorts = url.pathname.match(/\/shorts\/([^/?]+)/);
      if (fromShorts?.[1]) return fromShorts[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeEmbedUrl(videoId: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: videoId,
    controls: "0",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
    enablejsapi: "1",
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function youtubeThumbnailUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
