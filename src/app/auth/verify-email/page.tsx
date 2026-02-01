"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, AlertCircle, LogIn, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 백엔드 리다이렉트로 전달된 파라미터
  const statusParam = searchParams.get("status"); // success | fail
  const reasonParam = searchParams.get("reason"); // expired | already | invalid
  
  const [viewState, setViewState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [subMessage, setSubMessage] = useState("");

  useEffect(() => {
    if (!statusParam) {
      setViewState("error");
      setMessage("잘못된 접근입니다.");
      setSubMessage("인증 결과 정보가 없습니다.");
      return;
    }

    if (statusParam === "success") {
      setViewState("success");
      setMessage("이메일 인증 완료!");
      setSubMessage("이제 로그인하여 모든 서비스를 이용하실 수 있습니다.");
    } else {
      setViewState("error");
      switch (reasonParam) {
        case "expired":
          setMessage("인증 링크가 만료되었습니다.");
          setSubMessage("로그인 페이지에서 인증 메일을 다시 요청해 주세요.");
          break;
        case "already":
          setViewState("success"); // 이미 인증된 경우 성공으로 처리
          setMessage("이미 인증된 계정입니다.");
          setSubMessage("바로 로그인하실 수 있습니다.");
          break;
        default:
          setMessage("유효하지 않은 인증입니다.");
          setSubMessage("링크가 잘못되었거나 이미 사용되었습니다.");
      }
    }
  }, [statusParam, reasonParam]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-500 shadow-2xl border-none ring-1 ring-black/5">
        <CardContent className="pt-12 pb-10 text-center space-y-8">
          
          {viewState === "success" && (
            <>
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="h-12 w-12 text-green-600 drop-shadow-sm" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold text-ink tracking-tight">{message}</h2>
                <p className="text-ink-soft">{subMessage}</p>
              </div>
              <Button onClick={() => router.push("/auth")} size="lg" className="w-full h-12 text-base shadow-green-200 shadow-lg">
                로그인 페이지로 이동 <ArrowRight size={18} className="ml-2" />
              </Button>
            </>
          )}

          {viewState === "error" && (
            <>
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center shadow-inner">
                {reasonParam === "expired" ? (
                    <AlertCircle className="h-12 w-12 text-red-500" />
                ) : (
                    <XCircle className="h-12 w-12 text-red-500" />
                )}
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-ink tracking-tight">{message}</h2>
                <p className="text-ink-soft text-sm">{subMessage}</p>
              </div>
              <div className="grid gap-3">
                <Button onClick={() => router.push("/auth")} variant="outline" className="w-full h-11 border-line hover:bg-paper">
                  로그인 화면으로 돌아가기
                </Button>
              </div>
            </>
          )}

          {viewState === "loading" && (
            <div className="py-10">
                <div className="animate-pulse text-ink-muted font-medium">결과 확인 중...</div>
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