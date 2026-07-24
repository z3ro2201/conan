import cn from "@/lib/utils/cn";

export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

// 아주 단순한 규칙 기반 강도 계산 (길이 + 문자 종류 다양성). 실제 서비스라면
// zxcvbn 같은 라이브러리로 교체하는 걸 추천 — 이건 시각적 피드백용 참고치입니다.
export function getPasswordStrength(password: string): PasswordStrengthLevel {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 4) as PasswordStrengthLevel;
}

const levelConfig: Record<PasswordStrengthLevel, { label: string; color: string; bars: number }> = {
  0: { label: "너무 짧아요", color: "bg-danger", bars: 1 },
  1: { label: "약함 — 조금 더 길게 만들어보세요", color: "bg-danger", bars: 1 },
  2: { label: "보통 — 특수문자를 추가하면 더 안전해요", color: "bg-success", bars: 2 },
  3: { label: "강함", color: "bg-success", bars: 3 },
  4: { label: "매우 강함", color: "bg-success", bars: 4 },
};

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

// role="status" + aria-live="polite"로, 타이핑할 때마다 바뀌는 강도 텍스트를
// 스크린리더가 실시간으로 안내하게 함 (막대 색만으로는 스크린리더에 전달 안 됨).

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const level = getPasswordStrength(password);
  const { label, color, bars } = levelConfig[level];

  return (
    <div className={className}>
      <div className="flex gap-1 mb-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("flex-1 h-[5px] rounded-[3px]", i <= bars ? color : "bg-border")} />
        ))}
      </div>
      <div
        role="status"
        aria-live="polite"
        className={cn("text-xs font-bold", bars >= 2 ? "text-success" : "text-danger")}
      >
        {password ? label : ""}
      </div>
    </div>
  );
}

// ===== 사용 예시 =====
//
// const [password, setPassword] = useState('');
// <PasswordField label="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
// <PasswordStrengthMeter password={password} className="mt-1.5" />
//
// 체크리스트
// - getPasswordStrength는 참고용 규칙 기반 계산 — 정말 강도를 정확히 평가해야 하면
//   zxcvbn 같은 전용 라이브러리로 교체하세요 (사전 단어, 반복 패턴 등까지 고려함)
// - role="status" + aria-live="polite"로 타이핑 중 강도 변화를 스크린리더에 실시간 안내
