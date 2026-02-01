export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
  
  // 추후 추가될 수 있는 설정들
  IS_DEV: process.env.NODE_ENV === "development",
};
