import cn from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

// 원본의 "Title/Subtitle" 섹션 4가지 패턴 중 실제로 별도 컴포넌트가 필요한 건 이것뿐이고,
// 나머지는 Typography 조합으로 충분해서 아래 사용 예시로 안내합니다.

export function PageHeader({ title, subtitle, align = "left", className }: PageHeaderProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <h1 className="font-black tracking-tight text-[30px] text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-muted-light mt-1.5">{subtitle}</p>}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <PageHeader title="명탐정 OOO" subtitle="고등학생 탐정 · 214개 문서 중 · 최근 수정 3분 전" />
//
// // 섹션 헤더형 — Typography 조합으로 충분
// <Typography variant="h2" className="text-primary">최근 수정된 문서</Typography>
// <Typography variant="caption" className="mt-1 block">지난 24시간 동안의 편집 내역이에요</Typography>
//
// // 카드 헤더형 — Card 컴포넌트 자체가 이미 CardTitle/CardDescription을 제공
// <Card>
//   <CardTitle>범죄조직 코드명 목록</CardTitle>
//   <CardDescription>흑의 조직 계보 총정리</CardDescription>
// </Card>
//
// // 가운데 정렬형 (모달/빈 상태) — PageHeader에 align="center", 또는 Typography에 text-center
// <PageHeader align="center" title="문서를 삭제할까요?" subtitle="삭제된 문서는 수정 이력에서 되돌릴 수 있어요." />
