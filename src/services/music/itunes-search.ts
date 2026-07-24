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

export const searchITunesTrack = async (query: string, country: string): Promise<ITunesSearchResult[]> => {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5&country=${country}`,
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

// KR에서 못 찾으면 JP로 재시도
const SEARCH_COUNTRIES = ["KR", "JP"];

export const resolveAppleMusicMeta = async (songTitle: string, artist: string): Promise<AppleMusicMeta | null> => {
  for (const country of SEARCH_COUNTRIES) {
    try {
      const results = await searchITunesTrack(songTitle, country);
      const match = results.find((item) => item.artistName === artist);

      if (match?.artworkUrl100) {
        const palette = await extractPalette(match.artworkUrl100);
        const artworkUrl1000 = getHighResArtwork(match.artworkUrl100, 1000);

        return {
          ...match,
          artworkUrl1000,
          artworkUrl: match.artworkUrl100,
          collectionName: match.collectionName,
          palette,
        };
      }
    } catch (error) {
      console.error(`iTunes 검색 실패 (country=${country}):`, error);
    }
  }

  return null; // KR, JP 둘 다 못 찾음
};
