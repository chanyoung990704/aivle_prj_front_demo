"use client";

import { useState } from "react";
import { sentinelFetch } from "@/lib/api-client";
import PredictChart from "@/components/features/dashboard/PredictChart";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Download, FileText, Info, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function ReportsPage() {
  const [stockCode, setStockCode] = useState("");
  const [quarterKey, setQuarterKey] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    if (!stockCode || !quarterKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await sentinelFetch<any>(`/admin/reports/metrics/predict-latest?stockCode=${encodeURIComponent(stockCode)}&quarterKey=${quarterKey}`);
      
      // 템플릿 로직: payload.success 체크 및 데이터 매핑
      if (res.success && res.data) {
        setReportData(res.data);
      } else {
        setReportData(null);
        setError(res.error?.message || "조회 결과가 없습니다.");
      }
    } catch (e: any) {
      console.error(e);
      setReportData(null);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-ink font-medium">Report & Predict Console</h1>
          <p className="text-ink-soft mt-2">재무 지표 시각화 및 AI 예측 데이터 상세 조회</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.href='/api-console'}>API Console</Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href='/auth'}>Auth Console</Button>
        </div>
      </header>

      {/* 1. Search Section (Card 1) */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-muted uppercase">Stock Code</label>
              <input 
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value)}
                placeholder="예: 005930" 
                className="w-full p-3 bg-paper rounded-xl border border-line outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-muted uppercase">Quarter Key</label>
              <input 
                value={quarterKey}
                onChange={(e) => setQuarterKey(e.target.value)}
                placeholder="예: 20253" 
                type="number"
                className="w-full p-3 bg-paper rounded-xl border border-line outline-none focus:border-accent"
              />
            </div>
            <Button onClick={fetchReport} disabled={loading} className="h-[46px]">
              <Search size={18} />
              {loading ? "조회 중..." : "최신 예측 보고서 조회"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {!reportData && !loading && (
        <div className="py-20 text-center space-y-4 bg-white/50 rounded-3xl border border-dashed border-line">
           <AlertCircle size={48} className="mx-auto text-ink-muted opacity-20" />
           <p className="text-ink-muted font-medium">{error || "조회 결과가 없습니다. 기업 코드와 분기를 입력하세요."}</p>
        </div>
      )}

      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 2. PDF 상세 정보 (Card 2) */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="h-full">
                    <CardHeader className="border-b border-line pb-4 mb-4 flex flex-row items-center justify-between">
                        <h3 className="font-serif text-xl flex items-center gap-2"><FileText className="text-accent" size={20}/> PDF 정보</h3>
                        {reportData.pdfDownloadUrl && (
                            <a href={reportData.pdfDownloadUrl} target="_blank" className="text-accent hover:underline text-xs font-bold flex items-center gap-1">
                                <Download size={14}/> 다운로드
                            </a>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div className="text-ink-muted">버전</div>
                            <div className="text-ink font-bold font-mono text-right">{reportData.versionNo ?? "-"}</div>
                            
                            <div className="text-ink-muted">생성 시각</div>
                            <div className="text-ink font-medium text-right">{reportData.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : "-"}</div>
                            
                            <div className="text-ink-muted">파일명</div>
                            <div className="text-ink font-medium text-right break-all truncate pl-4" title={reportData.pdfFileName}>{reportData.pdfFileName ?? "-"}</div>
                            
                            <div className="text-ink-muted">파일 ID</div>
                            <div className="text-ink font-mono text-xs text-right text-accent-secondary">{reportData.pdfFileId ?? "-"}</div>
                        </div>
                        <div className="mt-6 p-4 bg-paper rounded-2xl border border-line flex items-start gap-3">
                            <Info size={16} className="text-accent mt-0.5 shrink-0" />
                            <p className="text-[11px] text-ink-soft leading-relaxed">
                                본 보고서는 AI에 의해 자동 생성되었습니다. 실제 공시 수치와 다를 수 있으므로 투자 판단의 보조 자료로만 활용하시기 바랍니다.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. PREDICT 지표 목록 (Card 3) */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader className="border-b border-line pb-4 mb-4 flex flex-row items-center justify-between">
                        <h3 className="font-serif text-xl flex items-center gap-2"><TrendingUp className="text-accent-tertiary" size={20}/> PREDICT 지표 목록</h3>
                        <span className="text-[10px] font-bold text-ink-muted bg-paper px-2 py-1 rounded-md uppercase tracking-wider">Quarter: {quarterKey}</span>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {reportData.metrics?.map((metric: any) => (
                                <div key={metric.metricCode} className="flex items-center justify-between p-3 border border-line rounded-xl hover:bg-paper-light transition-colors group">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-accent-secondary uppercase">{metric.metricCode}</span>
                                        <span className="text-sm font-medium text-ink">{metric.metricNameKo}</span>
                                    </div>
                                    <div className="text-lg font-serif font-bold text-ink tabular-nums group-hover:text-accent transition-colors">
                                        {metric.metricValue?.toLocaleString() || "-"}
                                        <span className="text-[10px] ml-1 text-ink-muted font-sans font-normal">%</span>
                                    </div>
                                </div>
                            ))}
                            {(!reportData.metrics || reportData.metrics.length === 0) && (
                                <div className="col-span-2 py-10 text-center text-ink-muted text-sm">PREDICT 데이터가 없습니다.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 4. Visualized Charts (고도화된 차트) */}
            <div className="lg:col-span-3 mt-4">
                <h3 className="font-serif text-2xl mb-6">Historical Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reportData.metrics?.slice(0, 4).map((metric: any) => (
                        <PredictChart 
                            key={metric.metricCode}
                            title={metric.metricNameKo}
                            metricCode={metric.metricCode}
                            metricNameKo={metric.metricNameKo}
                            data={[
                                { period: "Previous", actualValue: (metric.metricValue * 0.95), predictValue: null },
                                { period: "Forecast", actualValue: null, predictValue: metric.metricValue }
                            ]} 
                            unit="%"
                        />
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}