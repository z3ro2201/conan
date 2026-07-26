import { SVGProps } from "react";

// 코난위키 UI킷의 Icons 섹션 전체(84개)를 컴포넌트화.
// stroke="#22252E"로 고정돼 있던 원본을 currentColor로 바꿔서
// text-primary, text-danger 같은 색상 유틸리티를 아이콘에도 그대로 쓸 수 있게 했습니다.
//
// 이름 겹침 정리:
// - '펼치기'와 'Chevron Down'은 모양이 완전히 같아서 chevron-down 하나로 합침
// - '이미지 없음 (No Image)'과 'NO IMAGE'도 모양이 같아서 image-off 하나로 합침
// - '추가'(plus)와 '플러스'(math-plus)는 이름은 비슷해도 실제 크기가 달라서
//   (plus는 화면 전체를 채우는 굵은 +, math-plus는 계산기 버튼처럼 작고 아담한 +) 구분해서 유지
// - '공유'(share, 네트워크 아이콘)와 '공유 (Share)'(external-link, 화살표+박스 아이콘)도
//   모양이 서로 달라서 별도 이름으로 유지

export type IconName =
  | "search"
  | "close"
  | "edit"
  | "trash"
  | "star"
  | "heart"
  | "share"
  | "menu"
  | "home"
  | "user"
  | "bell"
  | "calendar"
  | "chevron-down"
  | "plus"
  | "check"
  | "play"
  | "pause"
  | "image"
  | "video"
  | "music"
  | "arrow-up"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "chevron-up"
  | "chevron-left"
  | "chevron-right"
  | "chevron-double-up"
  | "chevron-double-down"
  | "chevron-double-left"
  | "chevron-double-right"
  | "triangle-up"
  | "triangle-down"
  | "triangle-left"
  | "triangle-right"
  | "image-off"
  | "mobile"
  | "desktop"
  | "sun"
  | "moon"
  | "headphones"
  | "earbuds"
  | "mask"
  | "bow-tie"
  | "glasses"
  | "stopwatch"
  | "sneaker"
  | "camera"
  | "skateboard"
  | "stop"
  | "skip-next"
  | "skip-previous"
  | "lyrics"
  | "list"
  | "align-left"
  | "align-right"
  | "align-center"
  | "align-justify"
  | "code"
  | "zoom-in"
  | "zoom-out"
  | "pencil"
  | "notebook"
  | "detective-silhouette"
  | "female-silhouette"
  | "boy-detective-silhouette"
  | "math-plus"
  | "math-minus"
  | "math-multiply"
  | "math-divide"
  | "speech-bubble"
  | "speech-bubble-typing"
  | "chat-bubbles"
  | "external-link"
  | "settings"
  | "volume-mute"
  | "volume-up"
  | "coffee"
  | "refresh"
  | "sidebar-icon"
  | "palette"
  | "sunglasses"
  | "phone"
  | "printer"
  | "eye"
  | "eye-off"
  | "upload"
  | "youtube"
  | "repeat"
  | "repeat-one";

const FILLED_ICONS: IconName[] = [
  "play",
  "pause",
  "triangle-up",
  "triangle-down",
  "triangle-left",
  "triangle-right",
  "stop",
  "skip-next",
  "skip-previous",
];

const paths: Record<IconName, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ), // 검색
  close: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ), // 닫기
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ), // 수정
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ), // 삭제
  star: (
    <>
      <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
    </>
  ), // 즐겨찾기
  heart: (
    <>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </>
  ), // 좋아요
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
    </>
  ), // 공유
  menu: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </>
  ), // 메뉴
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </>
  ), // 홈
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ), // 사용자
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ), // 알림
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="16" y1="3" x2="16" y2="7" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ), // 달력
  "chevron-down": (
    <>
      <polyline points="6 9 12 15 18 9" />
    </>
  ), // 펼치기
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ), // 추가
  check: (
    <>
      <polyline points="20 6 9 17 4 12" />
    </>
  ), // 확인
  play: (
    <>
      <polygon points="6 4 20 12 6 20" />
    </>
  ), // 재생
  pause: (
    <>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </>
  ), // 일시정지
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </>
  ), // 이미지
  video: (
    <>
      <rect x="2" y="5" width="15" height="14" rx="2" />
      <polygon points="22 8 17 12 22 16 22 8" />
    </>
  ), // 동영상
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ), // 음악
  "arrow-up": (
    <>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </>
  ), // 위로
  "arrow-down": (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </>
  ), // 아래로
  "arrow-left": (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>
  ), // 왼쪽
  "arrow-right": (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ), // 오른쪽
  "chevron-up": (
    <>
      <polyline points="18 15 12 9 6 15" />
    </>
  ), // Chevron Up
  "chevron-left": (
    <>
      <polyline points="15 18 9 12 15 6" />
    </>
  ), // Chevron Left
  "chevron-right": (
    <>
      <polyline points="9 6 15 12 9 18" />
    </>
  ), // Chevron Right
  "chevron-double-up": (
    <>
      <polyline points="17 11 12 6 7 11" />
      <polyline points="17 18 12 13 7 18" />
    </>
  ), // Double Chevron Up
  "chevron-double-down": (
    <>
      <polyline points="7 13 12 18 17 13" />
      <polyline points="7 6 12 11 17 6" />
    </>
  ), // Double Chevron Down
  "chevron-double-left": (
    <>
      <polyline points="13 17 8 12 13 7" />
      <polyline points="18 17 13 12 18 7" />
    </>
  ), // Double Chevron Left
  "chevron-double-right": (
    <>
      <polyline points="11 17 16 12 11 7" />
      <polyline points="6 17 11 12 6 7" />
    </>
  ), // Double Chevron Right
  "triangle-up": (
    <>
      <polygon points="12 8 18 15 6 15" />
    </>
  ), // 삼각형 Arrow Up
  "triangle-down": (
    <>
      <polygon points="12 16 6 9 18 9" />
    </>
  ), // 삼각형 Arrow Down
  "triangle-left": (
    <>
      <polygon points="8 12 15 6 15 18" />
    </>
  ), // 삼각형 Arrow Left
  "triangle-right": (
    <>
      <polygon points="16 12 9 6 9 18" />
    </>
  ), // 삼각형 Arrow Right (재생)
  "image-off": (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="21" x2="21" y2="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-4.5-4.5" />
    </>
  ), // 이미지 없음 (No Image)
  mobile: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </>
  ), // 모바일
  desktop: (
    <>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </>
  ), // PC
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
      <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
      <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
    </>
  ), // 라이트 모드
  moon: (
    <>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </>
  ), // 다크 모드
  headphones: (
    <>
      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
      <rect x="2" y="14" width="5" height="7" rx="2" />
      <rect x="17" y="14" width="5" height="7" rx="2" />
    </>
  ), // 헤드폰
  earbuds: (
    <>
      <path d="M8 13v-3a4 4 0 0 1 8 0v1" />
      <rect x="6" y="13" width="4" height="6" rx="2" />
      <circle cx="16" cy="11" r="2" />
      <path d="M16 13v4a2 2 0 0 1 -2 2h-1" />
    </>
  ), // 이어폰
  mask: (
    <>
      <path d="M3 9c3 -2 15 -2 18 0v3c0 4 -4 7 -9 7s-9 -3 -9 -7Z" />
      <path d="M8 10.5c1.5 1 6.5 1 8 0" />
    </>
  ), // 마스크
  "bow-tie": (
    <>
      <path d="M11 9 2 6v12l9 -3Z" />
      <path d="M13 9l9 -3v12l-9 -3Z" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ), // 나비넥타이
  glasses: (
    <>
      <circle cx="6" cy="13" r="4" />
      <circle cx="18" cy="13" r="4" />
      <line x1="10" y1="12" x2="14" y2="12" />
      <path d="M2 12l1 -3h2" />
      <path d="M22 12l-1 -3h-2" />
    </>
  ), // 뿔테안경
  stopwatch: (
    <>
      <path d="M9 3h6l1 4h-8z" />
      <path d="M9 21h6l1 -4h-8z" />
      <circle cx="12" cy="12" r="6" />
      <polyline points="12 9 12 12 14 13.5" />
    </>
  ), // 시계
  sneaker: (
    <>
      <path d="M2 17h19c0 -2 -1 -3 -3 -3.5 -2 -.5 -3 -1 -4.5 -2.5 -1 -1 -2 -1.5 -3.5 -1.5 -1 0 -1 1 -2 1.5 -1.5 .8 -3 1.5 -4 2 -1 .5 -2 1 -2 3.5Z" />
      <line x1="2" y1="17" x2="21" y2="17" />
      <line x1="6" y1="14" x2="6" y2="16.5" />
    </>
  ), // 운동화
  camera: (
    <>
      <path d="M4 8h3l2 -2h6l2 2h3v11H4Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ), // 카메라
  skateboard: (
    <>
      <path d="M3 13c2 -2 16 -2 18 0" />
      <circle cx="6" cy="17" r="1.8" />
      <circle cx="18" cy="17" r="1.8" />
      <line x1="6" y1="15.2" x2="6" y2="13" />
      <line x1="18" y1="15.2" x2="18" y2="13" />
    </>
  ), // 스케이트보드
  stop: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="1.5" />
    </>
  ), // 정지
  "skip-next": (
    <>
      <polygon points="5 4 15 12 5 20" />
      <rect x="17" y="4" width="2.5" height="16" />
    </>
  ), // 다음곡
  "skip-previous": (
    <>
      <polygon points="19 4 9 12 19 20" />
      <rect x="4.5" y="4" width="2.5" height="16" />
    </>
  ), // 이전곡
  lyrics: (
    <>
      <path d="M5 3h11l3 3v15H5Z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </>
  ), // 가사(Lyrics)
  list: (
    <>
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <line x1="4" y1="6" x2="4.01" y2="6" />
      <line x1="4" y1="12" x2="4.01" y2="12" />
      <line x1="4" y1="18" x2="4.01" y2="18" />
    </>
  ), // 리스트
  "align-left": (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="14" y2="12" />
      <line x1="4" y1="18" x2="17" y2="18" />
    </>
  ), // 왼쪽 정렬
  "align-right": (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="7" y1="18" x2="20" y2="18" />
    </>
  ), // 오른쪽 정렬
  "align-center": (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="5.5" y1="18" x2="18.5" y2="18" />
    </>
  ), // 가운데 정렬
  "align-justify": (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </>
  ), // 양쪽 정렬
  code: (
    <>
      <polyline points="8 6 3 12 8 18" />
      <polyline points="16 6 21 12 16 18" />
    </>
  ), // 코드 (&lt;/&gt;)
  "zoom-in": (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
      <line x1="11" y1="8" x2="11" y2="14" />
    </>
  ), // 확대(Zoom In)
  "zoom-out": (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </>
  ), // 축소(Zoom Out)
  pencil: (
    <>
      <path d="M17 3l4 4L7 21H3v-4Z" />
      <line x1="14.5" y1="5.5" x2="18.5" y2="9.5" />
    </>
  ), // 펜슬
  notebook: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="4" y1="8" x2="2" y2="8" />
      <line x1="4" y1="13" x2="2" y2="13" />
      <line x1="4" y1="18" x2="2" y2="18" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="13" y2="15" />
    </>
  ), // 수첩
  "detective-silhouette": (
    <>
      <path d="M6 9c0 -3 2.5 -5 6 -5s6 2 6 5" />
      <path d="M4 9h16l-1.5 3h-13Z" />
      <circle cx="12" cy="14" r="4.5" />
      <path d="M4 21c0 -3 3.5 -5 8 -5s8 2 8 5" />
    </>
  ), // 탐정 (일반 실루엣)
  "female-silhouette": (
    <>
      <path d="M6 10c0 -4 2.5 -7 6 -7s6 3 6 7" />
      <path d="M6 10c-1 1 -1 3 0 6l1 5" />
      <path d="M18 10c1 1 1 3 0 6l-1 5" />
      <circle cx="12" cy="11" r="4.2" />
      <path d="M5 21c0 -3 3.5 -5 7 -5s7 2 7 5" />
    </>
  ), // 여성 캐릭터 (일반 실루엣)
  "boy-detective-silhouette": (
    <>
      <circle cx="12" cy="10" r="4.5" />
      <line x1="8.3" y1="9" x2="15.7" y2="9" />
      <path d="M4 21c0 -3.5 3.5 -6 8 -6s8 2.5 8 6" />
      <path d="M9 4.5c1 -1.5 5 -1.5 6 0" />
    </>
  ), // 소년 탐정 (일반 실루엣)
  "math-plus": (
    <>
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ), // 플러스
  "math-minus": (
    <>
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ), // 마이너스
  "math-multiply": (
    <>
      <line x1="8" y1="8" x2="16" y2="16" />
      <line x1="16" y1="8" x2="8" y2="16" />
    </>
  ), // 곱하기
  "math-divide": (
    <>
      <line x1="8" y1="12" x2="16" y2="12" />
      <circle cx="12" cy="8.3" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15.7" r="1.3" fill="currentColor" stroke="none" />
    </>
  ), // 나누기
  "speech-bubble": (
    <>
      <path d="M4 5h16v10H10l-3 3v-3H4Z" />
    </>
  ), // 말풍선
  "speech-bubble-typing": (
    <>
      <path d="M4 5h16v10H10l-3 3v-3H4Z" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
    </>
  ), // 말풍선 (...)
  "chat-bubbles": (
    <>
      <path d="M2.5 4h11v7H8l-2.5 2.3V11H2.5Z" />
      <path d="M10.5 12h11v7h-3.5v2.3L15.5 19h-5Z" />
    </>
  ), // 대화 말풍선
  "external-link": (
    <>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </>
  ), // 공유 (Share)
  settings: (
    <>
      <path d="M12 2a1 1 0 0 1 1 1v1.09a7.95 7.95 0 0 1 2.44 1.01l.77-.77a1 1 0 0 1 1.41 0l1.42 1.42a1 1 0 0 1 0 1.41l-.77.77c.45.75.79 1.57 1.01 2.44H21a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1.09a7.95 7.95 0 0 1-1.01 2.44l.77.77a1 1 0 0 1 0 1.41l-1.42 1.42a1 1 0 0 1-1.41 0l-.77-.77a7.95 7.95 0 0 1-2.44 1.01V21a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1.09a7.95 7.95 0 0 1-2.44-1.01l-.77.77a1 1 0 0 1-1.41 0l-1.42-1.42a1 1 0 0 1 0-1.41l.77-.77A7.95 7.95 0 0 1 4.09 13H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1.09a7.95 7.95 0 0 1 1.01-2.44l-.77-.77a1 1 0 0 1 0-1.41l1.42-1.42a1 1 0 0 1 1.41 0l.77.77A7.95 7.95 0 0 1 11 4.09V3a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ), // 설정
  "volume-mute": (
    <>
      <polygon points="4 9 8 9 13 4 13 20 8 15 4 15" />
      <line x1="17" y1="9" x2="22" y2="15" />
      <line x1="22" y1="9" x2="17" y2="15" />
    </>
  ), // 음소거
  "volume-up": (
    <>
      <polygon points="4 9 8 9 13 4 13 20 8 15 4 15" />
      <path d="M17 8.5a5 5 0 0 1 0 7" />
      <path d="M19.8 6a8.5 8.5 0 0 1 0 12" />
    </>
  ), // 음소거 해제
  coffee: (
    <>
      <path d="M4 8h12v6a4 4 0 0 1 -4 4H8a4 4 0 0 1 -4 -4Z" />
      <path d="M16 9h2a2.5 2.5 0 0 1 0 5h-2" />
      <path d="M7 3.5c0 1 -1 1 -1 2s1 1 1 2" />
      <path d="M11 3.5c0 1 -1 1 -1 2s1 1 1 2" />
    </>
  ), // 커피잔
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1 -3 -6.2" />
      <polyline points="21 3 21 9 15 9" />
    </>
  ), // 새로고침
  "sidebar-icon": (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="9" y1="4" x2="9" y2="20" />
    </>
  ), // 사이드바
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.4 0 1.8 -1.5 .9 -2.4 -.5 -.5 -.3 -1.6.7 -1.6h1.8a3.5 3.5 0 0 0 3.6 -3.5C21 8.3 17 3 12 3Z" />
      <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.2" cy="10" r="1.2" fill="currentColor" stroke="none" />
    </>
  ), // 그림판
  sunglasses: (
    <>
      <circle cx="6" cy="13" r="4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13" r="4" fill="currentColor" stroke="none" />
      <line x1="10" y1="12" x2="14" y2="12" />
      <path d="M2 12l1 -3h2" />
      <path d="M22 12l-1 -3h-2" />
    </>
  ), // 선글라스
  phone: (
    <>
      <path d="M5 4h4l1.5 4 -2 1.5a11 11 0 0 0 5.5 5.5l1.5 -2 4 1.5v4a2 2 0 0 1 -2.2 2 17 17 0 0 1 -13.8 -13.8A2 2 0 0 1 5 4Z" />
    </>
  ), // 전화(통화)
  printer: (
    <>
      <path d="M6 9V3h12v6" />
      <rect x="2" y="9" width="20" height="8" rx="1.5" />
      <path d="M6 14h12v7H6Z" />
    </>
  ), // 프린터
  // 원본 아이콘셋엔 없어서(비밀번호 표시/숨김에 필수라) Feather 스타일로 맞춰 추가
  eye: (
    <>
      <path d="M2 12s3.5 -7 10 -7 10 7 10 7 -3.5 7 -10 7 -10 -7 -10 -7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A9.4 9.4 0 0 1 12 5c6.5 0 10 7 10 7a15.6 15.6 0 0 1 -3.4 4.3" />
      <path d="M6.5 6.6C3.4 8.5 2 12 2 12s3.5 7 10 7c1.4 0 2.6 -.3 3.6 -.8" />
      <path d="M9.5 10a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ),
  youtube: (
    <>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33Z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
    </>
  ),
  repeat: (
    <>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </>
  ), // 반복(전체)
  "repeat-one": (
    <>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
      <path d="M11 10h1v4" />
    </>
  ), // 반복(한 곡)
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  /**
   * 아이콘 단독으로 의미를 전달할 때만 지정 (예: 툴팁 없는 상태표시 아이콘).
   * 버튼 안의 아이콘처럼 이미 aria-label이 붙어있는 경우엔 비워두세요 — 중복 안내됩니다.
   */
  title?: string;
}

export function Icon({ name, size = 20, title, className, ...props }: IconProps) {
  const isFilled = FILLED_ICONS.includes(name);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? "currentColor" : "none"}
      stroke={isFilled ? "none" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      {...props}
    >
      {title && <title>{title}</title>}
      {paths[name]}
    </svg>
  );
}

// ===== 사용 예시 =====
//
// // 장식용 (버튼 안 등 이미 텍스트/aria-label이 의미를 전달하는 경우) — 기본값
// <IconButton icon={<Icon name="close" />} aria-label="닫기" />
//
// // 단독으로 의미를 전달해야 하는 경우 (텍스트도 aria-label도 없는 아이콘)
// <Icon name="star" title="즐겨찾기" />
//
// // 색상은 currentColor 상속 → 부모나 className의 text-* 토큰을 그대로 따라감
// <Icon name="trash" className="text-danger" />
// <Icon name="check" className="text-success" size={16} />
//
// // 코난위키 느낌 나는 실루엣/소품 아이콘 (신규)
// <Icon name="detective-silhouette" size={32} />
// <Icon name="bow-tie" className="text-primary" />
