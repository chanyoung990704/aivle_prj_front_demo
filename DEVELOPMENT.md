# SENTINEL Dashboard Development Guide

이 문서는 SENTINEL 대시보드 프로젝트의 아키텍처와 유지보수를 위한 표준 가이드라인을 담고 있습니다.

## 🏗 아키텍처 구조 (Enterprise Standard)

본 프로젝트는 **Feature-based Atomic Architecture**를 따릅니다.

- **`/app`**: Next.js App Router 정의. 로직보다는 레이아웃과 라우팅에 집중합니다.
- **`/components`**: UI 컴포넌트 계층화.
    - **`/ui`**: 버튼, 카드 등 최소 단위 원자 컴포넌트 (headless UI 지향).
    - **`/shared`**: 사이드바, 네비게이션 등 전역 공유 컴포넌트.
    - **`/features`**: 특정 도메인 로직(대시보드 차트 등)이 결합된 컴포넌트.
- **`/services`**: **API Layer**. 모든 fetch 요청은 여기서 관리됩니다. (유지보수 핵심)
- **`/context`**: 전역 상태 관리 (Auth, Toast 등).
- **`/hooks`**: 재사용 가능한 비즈니스 로직 (useAuth 등).
- **`/lib`**: 외부 라이브러리 설정 및 공통 유틸리티 (cn, api-client).
- **`/types`**: TypeScript 인터페이스 정의.
- **`/constants`**: 변하지 않는 고정값 및 메시지.

## 🎨 디자인 원칙

- **SENTINEL Design System**: `tailwind.config.ts`에 정의된 `paper`, `ink`, `accent` 컬러 시스템을 엄격히 준수합니다.
- **Atomic UI**: `components/ui`에 있는 컴포넌트를 우선적으로 사용하여 UI 일관성을 유지합니다.
- **Responsive**: Mobile-first 전략을 기본으로 하며, `md:` 접두사를 사용하여 데스크톱 최적화를 진행합니다.

## 🛠 주요 서비스 로직

### API 호출 (Service Layer)
컴포넌트에서 직접 `fetch`를 호출하지 마세요. 대신 `services/` 폴더의 서비스 객체를 사용합니다.

```typescript
// Good ✅
import { authService } from "@/services/authService";
const data = await authService.login(payload);

// Bad ❌
const data = await fetch("/api/login", { ... });
```

## 📝 코드 스타일 가이드

- **Component**: `export function Name() { ... }` 형태의 Named Export를 권장합니다.
- **Styling**: Tailwind CSS의 `cn()` 유틸리티를 사용하여 조건부 클래스를 병합하세요.
- **State**: 복잡한 상태 관리는 `useReducer`나 `Context`를 적극 활용합니다.

---
© 2026 SENTINEL Dev Team.
