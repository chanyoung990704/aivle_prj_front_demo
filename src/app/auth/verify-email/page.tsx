"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, AlertCircle, LogIn, ArrowRight, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [viewState, setViewState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [subMessage, setSubMessage] = useState("");
  const [errorCode, setErrorCode] = useState("");

  useEffect(() => {
    if (!token) {
      setViewState("error");
      setMessage("인증 토큰이 없습니다.");
      setSubMessage("메일에 포함된 링크를 다시 클릭해 주세요.");
      return;
    }

    const performVerification = async () => {
        try {
            const res = await authService.verifyEmail(token);
            if (res.success) {
                router.push("/auth/signup-complete");
            } else {
                // 이 부분은 sentinelFetch에서 throw하지 않은 경우 (보통은 throw함)
                handleError(res.error);
            }
        } catch (err: any) {
            handleError(err);
        }
    };

    const handleError = (error: any) => {
        setViewState("error");
        
        // 에러 객체에서 메시지 추출 (sentinelFetch에서 던진 Error 또는 직접 받은 객체)
        const code = error?.code || "";
        const originalMessage = error?.message || (typeof error === "string" ? error : "");
        setErrorCode(code);

        const lowerMsg = originalMessage.toLowerCase();

        if (code === "ALREADY_VERIFIED" || lowerMsg.includes("already")) {
            setViewState("success");
            setMessage("이미 인증이 완료되었습니다.");
            setSubMessage("로그인 후 모든 서비스를 이용하실 수 있습니다.");
        } else if (code === "EXPIRED_TOKEN" || lowerMsg.includes("expired")) {
            setMessage("인증 링크가 만료되었습니다.");
            setSubMessage("다시 로그인을 시도하여 인증 메일을 요청해 주세요.");
        } else if (lowerMsg.includes("failed to fetch")) {
            setMessage("서버 연결에 실패했습니다.");
            setSubMessage("네트워크 상태를 확인하거나 잠시 후 다시 시도해 주세요. (경로: /api/auth/verify-email)");
        } else {
            setMessage("이메일 인증에 실패했습니다.");
            setSubMessage(originalMessage || "유효하지 않은 링크이거나 서버 오류가 발생했습니다.");
        }
    };

    performVerification();
  }, [token, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-500 shadow-2xl border-none ring-1 ring-black/5">
        <CardContent className="pt-12 pb-10 text-center space-y-8">
          
          {viewState === "success" && (
            <>
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="h-12 w-12 text-blue-600 drop-shadow-sm" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold text-ink tracking-tight">{message}</h2>
                <p className="text-ink-soft">{subMessage}</p>
              </div>
              <Button onClick={() => router.push("/auth")} size="lg" className="w-full h-12 text-base">
                로그인하러 가기 <ArrowRight size={18} className="ml-2" />
              </Button>
            </>
          )}

          {viewState === "error" && (
            <>
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center shadow-inner">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-ink tracking-tight">{message}</h2>
                <p className="text-ink-soft text-sm">{subMessage}</p>
              </div>
              <div className="grid gap-3 pt-4">
                <Button onClick={() => router.push("/auth")} variant="outline" className="w-full h-11 border-line hover:bg-paper">
                  로그인 화면으로 돌아가기
                </Button>
              </div>
            </>
          )}

          {viewState === "loading" && (
            <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-accent h-10 w-10" />
                <div className="text-ink-muted font-medium">이메일 인증 처리 중...</div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-ink-muted">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}