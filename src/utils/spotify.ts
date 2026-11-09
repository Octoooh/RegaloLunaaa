/**
 * Spotify URL parser and Embed helpers
 */

export function extractSpotifyTrackId(url: string): string | null {
  if (!url) return null;
  // Match /track/22CharAlphanumeric or spotify:track:22CharAlphanumeric
  const match = url.match(/(?:track\/|spotify:track:)([a-zA-Z0-9]{22})/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export function getSpotifyEmbedUrl(url: string): string | null {
  const trackId = extractSpotifyTrackId(url);
  if (!trackId) return null;
  return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
}
