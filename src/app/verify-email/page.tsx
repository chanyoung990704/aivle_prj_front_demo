"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "expired" | "already" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const verifiedRef = useRef(false);

  const performVerification = async () => {
    if (!token) {
      setStatus("error");
      setErrorMessage("인증 토큰이 유효하지 않습니다.");
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    setStatus("loading");
    try {
      const res = await authService.verifyEmail(token);
      if (res.success) {
        setStatus("success");
      }
    } catch (err: any) {
      // sentinelFetch에서 에러 객체(Error)를 던지므로 메시지나 상태코드로 분기
      const msg = err.message || "";
      
      // 상태 코드 기반 처리 (sentinelFetch가 상태 코드를 에러 메시지에 포함하는 경우 등 고려)
      if (msg.includes("401") || msg.includes("400") || msg.toLowerCase().includes("expired")) {
        setStatus("expired");
      } else if (msg.includes("409") || msg.toLowerCase().includes("already")) {
        setStatus("already");
      } else {
        setStatus("error");
        setErrorMessage(msg || "일시적인 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    performVerification();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-paper/30">
      <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-black/5 animate-in fade-in zoom-in duration-500">
        <CardContent className="pt-12 pb-10 text-center space-y-8">
          
          {status === "success" && (
            <>
              <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold text-ink">이메일 인증 완료</h2>
                <p className="text-ink-soft">회원가입이 성공적으로 완료되었습니다.<br/>이제 모든 서비스를 이용하실 수 있습니다.</p>
              </div>
              <Button onClick={() => router.push("/auth")} size="lg" className="w-full">
                로그인하러 가기 <ArrowRight size={18} className="ml-2" />
              </Button>
            </>
          )}

          {status === "expired" && (
            <>
              <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-ink">인증 링크 만료</h2>
                <p className="text-ink-soft text-sm">인증 링크가 만료되었거나 유효하지 않습니다.<br/>인증 메일을 다시 요청해 주세요.</p>
              </div>
              <Button onClick={() => router.push("/auth")} variant="outline" className="w-full">
                인증 메일 다시 받기
              </Button>
            </>
          )}

          {status === "already" && (
            <>
              <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-ink">이미 인증됨</h2>
                <p className="text-ink-soft text-sm">이미 인증이 완료된 계정입니다.<br/>바로 로그인이 가능합니다.</p>
              </div>
              <Button onClick={() => router.push("/auth")} size="lg" className="w-full">
                로그인 페이지로 이동
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <XCircle className="h-12 w-12 text-gray-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-ink">일시적 오류</h2>
                <p className="text-ink-soft text-sm">{errorMessage}</p>
              </div>
              <Button onClick={() => performVerification()} variant="secondary" className="w-full">
                <RefreshCw size={18} className="mr-2" /> 다시 시도
              </Button>
            </>
          )}

          {status === "loading" && (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-accent h-12 w-12" />
              <div className="text-ink-muted font-medium">이메일 인증을 검증하고 있습니다...</div>
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
