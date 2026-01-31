import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * tailwind-merge와 clsx를 결합한 유틸리티
 * 조건부 스타일링 시 클래스 충돌을 방지합니다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
