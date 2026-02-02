"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

function VerifyEmailResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 백엔드 리다이렉트 시 전달되는 status 파라미터
  const status = searchParams.get("status");
  
  const [viewState, setViewState] = useState<"loading" | "success" | "expired" | "error">("loading");
  const [message, setMessage] = useState("");
  const [subMessage, setSubMessage] = useState("");

  useEffect(() => {
    // 5초 후에도 status가 없으면 에러로 간주
    const timer = setTimeout(() => {
        if (!status) {
            setViewState("error");
            setMessage("잘못된 접근입니다.");
            setSubMessage("인증 결과 정보를 확인할 수 없습니다.");
        }
    }, 5000);

    if (!status) {
      setViewState("loading");
      return () => clearTimeout(timer);
    }

    clearTimeout(timer);
    switch (status) {
      case "success":
        setViewState("success");
        setMessage("회원가입이 완료되었습니다.");
        setSubMessage("이제 로그인하여 모든 서비스를 이용하실 수 있습니다.");
        break;
      case "already_verified":
        setViewState("success");
        setMessage("이미 인증된 계정입니다.");
        setSubMessage("바로 로그인하실 수 있습니다.");
        break;
      case "expired":
      case "invalid":
        setViewState("expired");
        setMessage("인증 링크가 만료되었거나 유효하지 않습니다.");
        setSubMessage("로그인 페이지에서 인증 메일을 다시 요청해 주세요.");
        break;
      case "error":
      default:
        setViewState("error");
        setMessage("일시적 오류가 발생했습니다.");
        setSubMessage("잠시 후 다시 시도하거나 관리자에게 문의해 주세요.");
    }
  }, [status]);

  if (viewState === "loading" && !status) {
      return (
        <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-accent h-12 w-12" />
            <div className="text-ink-muted font-medium">인증 결과를 확인하고 있습니다...</div>
        </div>
      );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-500 shadow-2xl border-none ring-1 ring-black/5">
        <CardContent className="pt-12 pb-10 text-center space-y-8">
          
          {viewState === "success" && (
            <>
              <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold text-ink tracking-tight">{message}</h2>
                <p className="text-ink-soft">{subMessage}</p>
              </div>
              <Button onClick={() => router.push("/auth")} size="lg" className="w-full">
                로그인하러 가기 <ArrowRight size={18} className="ml-2" />
              </Button>
            </>
          )}

          {viewState === "expired" && (
            <>
              <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-ink tracking-tight">{message}</h2>
                <p className="text-ink-soft text-sm">{subMessage}</p>
              </div>
              <Button onClick={() => router.push("/auth")} variant="outline" className="w-full">
                인증 메일 다시 받기
              </Button>
            </>
          )}

          {viewState === "error" && (
            <>
              <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <XCircle className="h-12 w-12 text-gray-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-ink tracking-tight">{message}</h2>
                <p className="text-ink-soft text-sm">{subMessage}</p>
              </div>
              <Button onClick={() => router.push("/auth")} variant="secondary" className="w-full">
                로그인 화면으로 돌아가기
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailResultPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-ink-muted">Loading...</div>}>
      <VerifyEmailResultContent />
    </Suspense>
  );
}
