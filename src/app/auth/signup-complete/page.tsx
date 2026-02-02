"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export default function SignupCompletePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/auth");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-500 shadow-2xl border-none ring-1 ring-black/5">
        <CardContent className="pt-12 pb-10 text-center space-y-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="h-12 w-12 text-green-600 drop-shadow-sm" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-serif font-bold text-ink tracking-tight">회원가입이 완료되었습니다.</h2>
            <p className="text-ink-soft">이메일 인증이 성공적으로 완료되었습니다.</p>
          </div>

          <div className="bg-paper/50 rounded-2xl py-4 flex flex-col items-center gap-2 border border-line">
            <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Loader2 size={16} className="animate-spin text-accent" />
                <span>{countdown}초 후 로그인 페이지로 자동 이동합니다...</span>
            </div>
          </div>

          <Button onClick={() => router.push("/auth")} size="lg" className="w-full h-12 text-base">
            지금 바로 로그인하기 <ArrowRight size={18} className="ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
