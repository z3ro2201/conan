import { Vibrant } from "node-vibrant/node";

export interface ImagePalette {
  vibrant: string;
  muted: string;
  darkVibrant: string;
  darkMuted: string;
  lightVibrant: string;
  lightMuted: string;
}

const FALLBACK_COLOR = "#1e1e1e";

export async function extractPalette(imageUrl: string): Promise<ImagePalette> {
  const fallback: ImagePalette = {
    vibrant: FALLBACK_COLOR,
    muted: FALLBACK_COLOR,
    darkVibrant: FALLBACK_COLOR,
    darkMuted: FALLBACK_COLOR,
    lightVibrant: FALLBACK_COLOR,
    lightMuted: FALLBACK_COLOR,
  };

  try {
    const palette = await Vibrant.from(imageUrl).getPalette();

    return {
      vibrant: palette.Vibrant?.hex ?? FALLBACK_COLOR,
      muted: palette.Muted?.hex ?? FALLBACK_COLOR,
      darkVibrant: palette.DarkVibrant?.hex ?? FALLBACK_COLOR,
      darkMuted: palette.DarkMuted?.hex ?? FALLBACK_COLOR,
      lightVibrant: palette.LightVibrant?.hex ?? FALLBACK_COLOR,
      lightMuted: palette.LightMuted?.hex ?? FALLBACK_COLOR,
    };
  } catch (error) {
    console.error(error);
    return fallback;
  }
}
