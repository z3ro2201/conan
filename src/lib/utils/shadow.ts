// UI킷의 "Shadow" 디자인 토큰 섹션(sm/md/lg/xl 스와치)을 기준으로 정리.
// 예전엔 패널 기본 그림자(2px 8px 0.06)를 sm으로 임시로 썼었는데,
// 공식 Shadow 섹션이 별도로 있는 걸 확인해서 그 값으로 교체하고 xl도 추가했습니다.
// panel 토큰은 각 섹션 카드 바깥 wrapper가 공통으로 쓰던 그 패널 그림자(sm과는 다른 별개 값)를
// 그대로 보존해서, 필요하면 이쪽도 쓸 수 있게 남겨뒀습니다.

export type Shadow = "none" | "panel" | "sm" | "md" | "lg" | "xl";

export const shadowStyles: Record<Shadow, string> = {
  none: "",
  panel: "shadow-[0_2px_8px_rgba(20,30,60,0.06)]", // 섹션 카드 wrapper가 공통으로 쓰던 그림자
  sm: "shadow-[0_1px_3px_rgba(20,30,60,0.08)]",
  md: "shadow-[0_4px_10px_rgba(20,30,60,0.1)]",
  lg: "shadow-[0_10px_24px_rgba(20,30,60,0.14)]",
  xl: "shadow-[0_20px_44px_rgba(20,30,60,0.2)]",
};
