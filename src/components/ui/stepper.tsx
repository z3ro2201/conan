import cn from "@/lib/utils/cn";
import { Icon } from "./icon";

export interface StepperStep {
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  /** 1부터 시작하는 현재 단계 */
  current: number;
  onStepClick?: (step: number) => void;
  "aria-label"?: string;
  className?: string;
}

// nav > ol로 감싸서 "여러 단계로 이뤄진 진행 상황"임을 스크린리더에 전달하고,
// 현재 단계엔 aria-current="step" (Breadcrumb의 aria-current="page"와 같은 원리,
// ARIA 스펙이 단계별 진행에 쓰라고 별도로 마련해둔 값이 "step"입니다).

export function Stepper({ steps, current, onStepClick, className, ...props }: StepperProps) {
  return (
    <nav aria-label={props["aria-label"] ?? "진행 단계"} className={className}>
      <ol className="flex items-center list-none m-0 p-0">
        {steps.map((step, i) => {
          const idx = i + 1;
          const state = idx < current ? "done" : idx === current ? "active" : "todo";
          const circleClassName = cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px]",
            onStepClick && "cursor-pointer",
            state === "todo" ? "bg-border text-muted-light" : "bg-primary text-white",
          );
          const circleContent = state === "done" ? <Icon name="check" size={14} /> : idx;

          return (
            <li key={step.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                {onStepClick ? (
                  <button
                    type="button"
                    onClick={() => onStepClick(idx)}
                    aria-current={state === "active" ? "step" : undefined}
                    className={circleClassName}
                  >
                    {circleContent}
                  </button>
                ) : (
                  <div aria-current={state === "active" ? "step" : undefined} className={circleClassName}>
                    {circleContent}
                  </div>
                )}
                <span
                  className={cn("text-[11px] font-bold", state === "todo" ? "text-muted-light" : "text-foreground")}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-border mx-2 -mt-[18px]" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ===== 사용 예시 =====
//
// const [step, setStep] = useState(2);
// <Stepper
//   aria-label="회원가입 진행 단계"
//   steps={[{ label: '닉네임' }, { label: '이메일' }, { label: '비밀번호' }, { label: '완료' }]}
//   current={step}
//   onStepClick={setStep}
// />
//
// // 클릭으로 단계 이동을 막고 싶으면 onStepClick을 생략 (진행 상태만 보여줌)
// <Stepper steps={steps} current={step} />
//
// 체크리스트
// - 현재 단계엔 aria-current="step" (Breadcrumb의 "page", Nav의 "page"와 마찬가지로
//   ARIA가 상황별로 마련해둔 aria-current 값 중 하나)
// - onStepClick을 안 넘기면 자동으로 div(비클릭)로 렌더링 — 이미 지난 단계로
//   마음대로 되돌아갈 수 없어야 하는 결제 흐름 등에 유용
