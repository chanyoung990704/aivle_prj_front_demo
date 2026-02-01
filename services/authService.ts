import { sentinelFetch } from "@/lib/api-client";

export const authService = {
  login: async (payload: any) => {
    return sentinelFetch<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  
  signup: async (payload: any) => {
    return sentinelFetch<any>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  
  logout: () => {
    localStorage.removeItem("auth-console.tokens");
  },
  
  logoutAll: async () => {
    return sentinelFetch("/auth/logout-all", { method: "POST" });
  },

  getClaims: async () => {
    return sentinelFetch<any>("/auth/console/claims");
  },

  verifyEmail: async (token: string) => {
    return sentinelFetch<string>(`/api/auth/verify-email?token=${token}`, { method: "GET" });
  },

  resendVerification: async (userId: number) => {
    return sentinelFetch<string>(`/api/auth/resend-verification?userId=${userId}`, { method: "GET" });
  }
};
