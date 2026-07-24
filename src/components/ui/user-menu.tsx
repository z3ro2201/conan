import { Icon } from "./icon";
import { DropdownMenu, DropdownMenuItem } from "./dropdown-menu";
import { Avatar } from "./avatar";

interface UserMenuProps {
  name: string;
  initials: string;
  items: DropdownMenuItem[];
  className?: string;
}

// 겉모습은 아바타+이름 알약 버튼이지만 "누르면 목록 중 하나를 실행하고 끝"이라는 동작은
// 지난번 만든 DropdownMenu(menu 패턴)와 완전히 같아서 새로 만들지 않고 그대로 감싸 썼습니다.

export function UserMenu({ name, initials, items, className }: UserMenuProps) {
  return (
    <DropdownMenu
      aria-label={`${name} 계정 메뉴`}
      className={className}
      trigger={
        <span className="flex items-center gap-2 bg-border/60 rounded-full pl-1.5 pr-3.5 py-1.5 cursor-pointer">
          <Avatar initials={initials} size="xs" />
          <span className="text-[13px] font-bold text-foreground">{name}</span>
          <Icon name="chevron-down" size={12} className="text-muted-light" />
        </span>
      }
      items={items}
    />
  );
}

// ===== 사용 예시 =====
//
// <UserMenu
//   name="추리광"
//   initials="추"
//   items={[
//     { label: '내 프로필', onClick: () => router.push('/me') },
//     { label: '설정', onClick: () => router.push('/settings') },
//     { label: '로그아웃', onClick: handleLogout, danger: true },
//   ]}
// />
