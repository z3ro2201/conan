import cn from "@/lib/utils/cn";

type AvatarSize = "xs" | "sm" | "md" | "lg";
type AvatarTone = "primary" | "danger" | "ink" | "purple";

interface AvatarProps {
  /** 이미지가 있으면 이미지, 없으면 initials(이니셜)로 대체 */
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  /** 온라인 상태 등 우측 하단 상태 점 */
  status?: "online" | "offline" | "busy";
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: "w-7 h-7 text-[11px]",
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-base",
  lg: "w-14 h-14 text-xl",
};

const toneStyles: Record<AvatarTone, string> = {
  primary: "bg-primary",
  danger: "bg-danger",
  ink: "bg-foreground",
  purple: "bg-[#5B3FA0]", // 팔레트에 보라 토큰이 없어 원본 hex 그대로 유지
};

const statusStyles: Record<NonNullable<AvatarProps["status"]>, string> = {
  online: "bg-success",
  offline: "bg-muted-light",
  busy: "bg-danger",
};

export function Avatar({ src, alt, initials, size = "md", tone = "primary", status, className }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", sizeStyles[size], className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- Next.js 프로젝트면 next/image로 교체 권장
        <img src={src} alt={alt ?? ""} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span
          aria-hidden={!alt}
          className={cn(
            "w-full h-full rounded-full text-white font-black flex items-center justify-center",
            toneStyles[tone],
          )}
        >
          {initials}
        </span>
      )}
      {status && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-surface",
            size === "xs" || size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3",
            statusStyles[status],
          )}
        />
      )}
    </span>
  );
}

// ===== AvatarGroup =====
// 원본의 "겹쳐진 아바타 + +N" 패턴. max를 넘는 인원은 자동으로 "+N" 뱃지로 합쳐짐.

interface AvatarGroupProps {
  avatars: { initials: string; tone?: AvatarTone }[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({ avatars, max = 3, size = "sm", className }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - visible.length;

  return (
    <div role="group" aria-label={`참여자 ${avatars.length}명`} className={cn("flex", className)}>
      {visible.map((a, i) => (
        <Avatar
          key={i}
          initials={a.initials}
          tone={a.tone}
          size={size}
          className={cn("border-2 border-surface", i > 0 && "-ml-2.5")}
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            "rounded-full border-2 border-surface bg-border text-muted font-black flex items-center justify-center -ml-2.5",
            sizeStyles[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

// ===== 사용 예시 =====
//
// <Avatar initials="추" tone="primary" size="lg" />
// <Avatar initials="나" tone="danger" size="md" />
// <Avatar initials="익" tone="purple" status="online" />
// <Avatar src="/users/42/photo.jpg" alt="나비넥타이덕후 프로필 사진" />
//
// <AvatarGroup
//   avatars={[{ initials: 'A', tone: 'primary' }, { initials: 'B', tone: 'danger' }, { initials: 'C' }, { initials: 'D' }]}
//   max={3}
// />
//
// 체크리스트
// - 이미지 아바타는 alt에 "누구의 사진인지" 넣기. 이니셜 아바타는 대개 옆에 이름이
//   텍스트로 같이 있어서 장식으로 취급(aria-hidden), alt를 명시하면 그 값으로 노출됨
// - 상태 점(온라인 등)은 장식이라 aria-hidden — 상태가 중요한 정보면 텍스트로도 따로 표시할 것
