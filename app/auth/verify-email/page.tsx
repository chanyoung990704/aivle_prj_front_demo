"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("인증 토큰이 누락되었습니다.");
      return;
    }

    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token);
        setStatus("success");
        setMessage(res || "이메일 인증이 완료되었습니다.");
      } catch (e: any) {
        setStatus("error");
        setMessage(e.message);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <CardContent className="pt-10 pb-10 text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-16 w-16 text-accent animate-spin" />
              <h2 className="text-2xl font-serif font-medium">이메일 인증 중...</h2>
              <p className="text-ink-soft">잠시만 기다려 주세요.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto h-20 w-20 bg-accent-tertiary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-accent-tertiary" />
              </div>
              <h2 className="text-2xl font-serif font-medium">인증 완료!</h2>
              <p className="text-ink-soft">{message}</p>
              <Button onClick={() => router.push("/auth")} className="w-full">
                로그인하러 가기
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-serif font-medium">인증 실패</h2>
              <p className="text-ink-soft">{message}</p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push("/auth")} variant="outline" className="w-full">
                  홈으로 이동
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
