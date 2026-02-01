"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Script from "next/script";
import { cn } from "@/lib/utils/cn";

declare global {
  interface Window {
    turnstile?: any;
    turnstileCallback?: (token: string) => void;
  }
}

export default function AuthPage() {
  const { login, logout, accessToken } = useAuth();
  const [log, setLog] = useState<any>("Ready...");
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Turnstile States
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isTurnstileValid, setIsTurnstileValid] = useState(false);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  
  // Email Verification States
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // 1. Turnstile 수동 렌더링 함수
  const renderTurnstile = () => {
    if (typeof window !== "undefined" && window.turnstile && activeTab === "signup") {
      // 기존 위젯이 있다면 삭제
      if (widgetId) {
        window.turnstile.remove(widgetId);
      }

      const id = window.turnstile.render("#turnstile-container", {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
        callback: (token: string) => {
          setTurnstileToken(token);
          setIsTurnstileValid(true);
          setLog("Turnstile Token 발급 완료");
        },
        "expired-callback": () => {
          setTurnstileToken("");
          setIsTurnstileValid(false);
          setLog("Turnstile 토큰이 만료되었습니다.");
        },
        "error-callback": () => {
          setLog("Turnstile 위젯 오류가 발생했습니다.");
        },
      });
      setWidgetId(id);
    }
  };

  useEffect(() => {
    // 탭이 signup으로 바뀔 때 위젯 렌더링
    if (activeTab === "signup") {
        // 스크립트가 이미 로드되어 있다면 즉시 실행, 아니면 약간의 지연
        const timer = setTimeout(renderTurnstile, 100);
        return () => clearTimeout(timer);
    } else {
        // 다른 탭 이동 시 위젯 제거
        if (widgetId && window.turnstile) {
            window.turnstile.remove(widgetId);
            setWidgetId(null);
        }
    }
  }, [activeTab]);

  const handleTurnstileReset = () => {
    if (window.turnstile) {
        window.turnstile.reset();
        setTurnstileToken("");
        setIsTurnstileValid(false);
        setLog("보안 검증을 초기화했습니다.");
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);

    try {
      const res = await authService.login(payload);
      login(res.accessToken);
      setLog(`Login Success!\nAccess: ${res.accessToken.slice(0, 20)}...`);
      setPendingUserId(null);
    } catch (err: any) {
      setLog(`Login Failed: ${err.message}`);
      // 인증 필요 에러 처리
      if (err.message.includes("EMAIL_VERIFICATION_REQUIRED") || err.message.includes("인증이 필요합니다")) {
        showNotification("이메일 인증이 필요합니다.", "error");
        // 실제 API에서 userId를 에러 바디에 담아준다고 가정하거나, 이메일로 다시 찾기 유도
      }
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!turnstileToken) {
      setLog("Please complete the Turnstile challenge first.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const payload = {
        ...Object.fromEntries(formData),
        turnstileToken,
        admin: formData.get("admin") === "on"
    };

    try {
      const res = await authService.signup(payload);
      setLog(`Signup Success! Status: ${res.status}`);
      
      if (res.status === "PENDING") {
        setPendingUserId(res.id);
        setVerificationSent(true);
        showNotification("인증 이메일이 발송되었습니다.", "success");
      } else {
        showNotification("회원가입 완료! 로그인 해주세요.");
        setActiveTab("login");
      }
    } catch (err: any) {
      setLog(`Signup Failed: ${err.message}`);
      showNotification(err.message, "error");
    }
  };

  const handleResend = async () => {
    if (!pendingUserId) return;
    try {
        const res = await authService.resendVerification(pendingUserId);
        showNotification("인증 메일을 재발송했습니다.");
        setLog(res);
    } catch (err: any) {
        showNotification(err.message, "error");
    }
  };

  const handleLogoutAll = async () => {
    try {
        await authService.logoutAll();
        logout();
        setLog("Logged out from all devices.");
    } catch (err: any) {
        setLog(`Logout All Failed: ${err.message}`);
    }
  };

  const handleGetClaims = async () => {
    try {
        const res = await authService.getClaims();
        setLog({ title: "Token Claims", ...res });
    } catch (err: any) {
        setLog(`Get Claims Failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {notification && (
        <div className={cn(
          "fixed top-10 right-10 z-[100] px-6 py-3 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-300",
          notification.type === "success" ? "bg-accent-tertiary text-white" : "bg-red-500 text-white"
        )}>
          {notification.message}
        </div>
      )}

      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      
      <header className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-ink font-medium">Auth Console</h1>
        <p className="text-ink-soft mt-2">Manage JWT Tokens & Test Turnstile Integration</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-1 rounded-2xl border border-line inline-flex mb-4">
            {(["login", "signup"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-accent text-white shadow-sm"
                    : "text-ink-soft hover:bg-paper"
                }`}
              >
                {tab === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          <Card>
            <CardContent>
              {verificationSent ? (
                <div className="text-center py-8 space-y-4 animate-in zoom-in duration-300">
                    <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                        <Mail className="text-accent" size={32} />
                    </div>
                    <h3 className="text-xl font-serif font-medium">이메일을 확인해 주세요!</h3>
                    <p className="text-sm text-ink-soft leading-relaxed">
                        입력하신 이메일로 인증 링크를 보냈습니다.<br/>
                        인증 완료 후 로그인이 가능합니다.
                    </p>
                    <div className="pt-4 space-y-2">
                        <Button onClick={handleResend} variant="outline" className="w-full text-xs">인증 메일 다시 받기</Button>
                        <button onClick={() => setVerificationSent(false)} className="text-xs text-ink-muted hover:underline">가입 화면으로 돌아가기</button>
                    </div>
                </div>
              ) : activeTab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-ink-muted uppercase">Email</label>
                    <input name="email" type="email" placeholder="user@example.com" className="w-full p-3 bg-paper rounded-xl border border-line focus:border-accent outline-none" required />
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-ink-muted uppercase">Password</label>
                      <input name="password" type="password" placeholder="********" className="w-full p-3 bg-paper rounded-xl border border-line focus:border-accent outline-none" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <input name="deviceId" placeholder="Device ID" className="p-3 bg-paper rounded-xl border border-line text-sm" />
                      <input name="deviceInfo" placeholder="Device Info" className="p-3 bg-paper rounded-xl border border-line text-sm" />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <input name="email" type="email" placeholder="Email" className="p-3 bg-paper rounded-xl border border-line" required />
                      <input name="password" type="password" placeholder="Password" className="p-3 bg-paper rounded-xl border border-line" required />
                   </div>
                   <input name="username" placeholder="Username" className="w-full p-3 bg-paper rounded-xl border border-line" required />
                   
                   <label className="flex items-center gap-2 text-sm text-ink-soft">
                      <input type="checkbox" name="admin" className="accent-accent" />
                      Sign up as Admin (Dev Only)
                   </label>

                                                     {/* Turnstile Widget (수동 렌더링 타겟) */}

                                                     <div className="space-y-2">

                                                        <label className="text-xs font-bold text-ink-muted uppercase">Security Verification</label>

                                                        <div className="flex flex-col items-center gap-3 p-4 bg-paper rounded-2xl border border-dashed border-line">

                                                            <div id="turnstile-container"></div>

                                                            

                                                            {turnstileToken && (

                                                                <div className="w-full">

                                                                    <label className="text-[10px] text-ink-muted font-mono truncate block">Token: {turnstileToken.slice(0, 30)}...</label>

                                                                    <button 

                                                                        type="button" 

                                                                        onClick={handleTurnstileReset}

                                                                        className="text-[10px] text-accent font-bold hover:underline mt-1"

                                                                    >

                                                                        보안 검증 초기화 (Reset)

                                                                    </button>

                                                                </div>

                                                            )}

                                                        </div>

                                                     </div>

                                    

                   

                                    <Button type="submit" disabled={!isTurnstileValid} className="w-full bg-ink hover:bg-ink-soft">

                                       {isTurnstileValid ? "Create Account" : "Please Verify First"}

                                     </Button>

                   
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <h3 className="font-serif text-xl mb-4">Token Status</h3>
              <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-3 bg-paper rounded-xl">
                      <span className="text-ink-muted">Access Token</span>
                      <span className="font-mono text-accent truncate max-w-[150px]">{accessToken || "None"}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-paper rounded-xl">
                      <span className="text-ink-muted">Refresh Token</span>
                      <span className="font-mono text-accent-secondary truncate max-w-[150px]">{"Stored in HttpOnly Cookie"}</span>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button onClick={handleLogoutAll} variant="outline" size="sm" className="text-red-500">
                      Logout All
                  </Button>
                  <Button onClick={handleGetClaims} variant="outline" size="sm">
                      Check Claims
                  </Button>
              </div>
              <Button onClick={logout} variant="outline" className="mt-4 w-full">
                  Clear Session
              </Button>
            </CardContent>
          </Card>

          <div className="bg-ink text-paper p-6 rounded-3xl min-h-[200px] font-mono text-xs overflow-auto shadow-soft">
            <div className="mb-2 text-ink-muted uppercase tracking-wider font-bold">System Log</div>
            <pre className="whitespace-pre-wrap">{log}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

