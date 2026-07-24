import { extractPalette, type ImagePalette } from "@/lib/utils/extract-palette";

export interface ITunesSearchResult {
  artistName: string;
  collectionName: string;
  trackName: string;
  artworkUrl100: string;
}

export const getHighResArtwork = (artworkUrl100: string, size = 1000): string => {
  return artworkUrl100.replace(/\/\d+x\d+bb\.jpg$/, `/${size}x${size}bb.jpg`);
};

export const searchITunesTrack = async (query: string): Promise<ITunesSearchResult[]> => {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5&country=KR`,
  );

  if (!res.ok) {
    throw new Error("iTunes 검색에 실패했습니다.");
  }

  const data = await res.json();
  return data.results;
};

export interface AppleMusicMeta {
  artworkUrl: string;
  collectionName: string;
  palette: ImagePalette;
  artworkUrl1000: string | null;
}

export const resolveAppleMusicMeta = async (songTitle: string, artist: string): Promise<AppleMusicMeta | null> => {
  try {
    const results = await searchITunesTrack(songTitle);
    const match = results.find((item) => item.artistName === artist);

    if (!match?.artworkUrl100) return null;

    const palette = await extractPalette(match.artworkUrl100);
    const artworkUrl1000 = match.artworkUrl100 ? getHighResArtwork(match.artworkUrl100, 1000) : null;

    return {
      ...match,
      artworkUrl1000,
      artworkUrl: match.artworkUrl100,
      collectionName: match.collectionName,
      palette,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
