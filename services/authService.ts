import { sentinelFetch } from "@/lib/api-client";
import { ApiResponse, AuthLoginResponse, SignupResponse } from "@/types/api";

export const authService = {
  login: async (payload: any): Promise<AuthLoginResponse> => {
    const res = await sentinelFetch<ApiResponse<AuthLoginResponse>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  signup: async (payload: any): Promise<SignupResponse> => {
    const res = await sentinelFetch<ApiResponse<SignupResponse>>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  logout: async (): Promise<void> => {
    await sentinelFetch("/auth/logout", { method: "POST" });
    localStorage.removeItem("auth-console.tokens");
  },

  logoutAll: async (): Promise<void> => {
    await sentinelFetch("/auth/logout-all", { method: "POST" });
    localStorage.removeItem("auth-console.tokens");
  },

  changePassword: async (payload: any): Promise<void> => {
    await sentinelFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyEmail: async (token: string): Promise<string> => {
    return sentinelFetch<string>(`/api/auth/verify-email?token=${token}`, { 
        method: "GET",
        headers: { "Accept": "text/plain" }
    });
  },

    resendVerification: async (userId: number): Promise<string> => {

      return sentinelFetch<string>(`/api/auth/resend-verification?userId=${userId}`, { 

          method: "GET",

          headers: { "Accept": "text/plain" }

      });

    },

  

    getClaims: async (): Promise<any> => {

      const res = await sentinelFetch<ApiResponse<any>>("/auth/console/claims");

      return res.data;

    }

  };

  