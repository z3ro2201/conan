interface TrackTitleInfo {
  dubType: string;
  titles: { language: string; title: string }[];
  artist: string;
}

export function getTrackDisplayTitle(track: TrackTitleInfo): string {
  const ja = track.titles.find((t) => t.language === "ja")?.title;
  const ko = track.titles.find((t) => t.language === "ko")?.title;

  if (track.dubType === "ORIGINAL") {
    // 원곡: 일본어 우선, 한국어는 괄호로 보조 표시
    const primary = ja ?? ko ?? track.artist;
    const secondary = ja && ko ? ko : null;
    return secondary ? `${primary} (${secondary})` : primary;
  }

  // 한국어 더빙판: 한국어 우선, 일본어는 괄호로 보조 표시
  const primary = ko ?? ja ?? track.artist;
  const secondary = ko && ja ? ja : null;
  return secondary ? `${primary} (${secondary})` : primary;
}
