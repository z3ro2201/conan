import cn from "@/lib/utils/cn";

type Variant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "caption" | "muted";
type Tag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

interface TypographyProps {
  children: React.ReactNode;
  variant?: Variant;
  as?: Tag;
  className?: string;
}

// text-foreground(Ink)를 기본으로, caption/muted만 muted 토큰 사용
const variantStyles: Record<Variant, string> = {
  h1: "text-4xl font-bold tracking-tight text-foreground",
  h2: "text-3xl font-semibold tracking-tight text-foreground",
  h3: "text-2xl font-semibold text-foreground",
  h4: "text-xl font-medium text-foreground",
  h5: "text-lg font-medium text-foreground",
  h6: "text-base font-medium text-foreground",
  body: "text-base leading-7 text-foreground",
  caption: "text-sm text-muted",
  muted: "text-sm text-muted-light",
};

const defaultTag: Record<Variant, Tag> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  caption: "span",
  muted: "span",
};

export function Typography({ children, variant = "body", as, className }: TypographyProps) {
  const Tag = as ?? defaultTag[variant];

  return <Tag className={cn(variantStyles[variant], className)}>{children}</Tag>;
}

// ===== 사용 예시 =====
//
// <Typography variant="h1">페이지 제목</Typography>
// <Typography variant="h1" as="h2">SEO상 h2지만 h1처럼 크게</Typography>
// <Typography variant="caption">2026.07.12 작성</Typography>
