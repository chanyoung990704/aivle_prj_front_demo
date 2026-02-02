"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PredictChart from "@/components/features/dashboard/PredictChart";
import { Search, Calendar, Building2, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function Home() {
  // 1. 상태 정의
  const [stockCode, setStockCode] = useState("");
  const [corpName, setCorpName] = useState("");
  const [fromQuarter, setFromQuarter] = useState("20241");
  const [toQuarter, setToQuarter] = useState("20254");
  
  const [companySearch, setCompanySearch] = useState("");
  const [companyResults, setCompanyResults] = useState<any[]>([]);
  const [groupedData, setGroupedData] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // 2. 기업 검색 디바운싱 (Debouncing)
  useEffect(() => {
    if (companySearch.trim().length < 2) {
      setCompanyResults([]);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await adminService.searchCompanies(companySearch);
        setCompanyResults(res || []);
      } catch (e) {
        console.error("Company search error:", e);
      } finally {
        setSearchLoading(false);
      }
    }, 400); // 400ms 디바운싱
    
    return () => clearTimeout(timer);
  }, [companySearch]);

  // 3. 그룹 지표 조회 실행
  const handleQuery = async () => {
    if (!stockCode) return alert("기업을 먼저 선택해주세요.");
    setLoading(true);
    try {
      const res = await adminService.getGroupedMetrics(stockCode, Number(fromQuarter), Number(toQuarter));
      setGroupedData(res);
    } catch (e: any) {
      alert(`조회 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. API 데이터를 차트용 포맷으로 변환 로직 (제공된 JSON 구조 반영)
  const renderCharts = () => {
    if (!groupedData || !groupedData.quarters) return null;

    // 지표별로 시계열 데이터 수집: { "ROA": { nameKo: "총자산이익률", points: [...] } }
    const metricsMap: Record<string, { nameKo: string; points: any[] }> = {};
    
    // 분기별 데이터 순회
    const sortedQuarters = [...groupedData.quarters].sort((a, b) => a.quarterKey - b.quarterKey);
    
    sortedQuarters.forEach((q: any) => {
      q.metrics.forEach((m: any) => {
        if (!metricsMap[m.metricCode]) {
          metricsMap[m.metricCode] = { 
            nameKo: m.metricNameKo, 
            points: [] 
          };
        }
        
        // 차트 포인트 추가
        metricsMap[m.metricCode].points.push({
          period: q.quarterKey.toString().replace(/(\d{4})(\d)/, "$1.$2Q"), // 20253 -> 2025.3Q
          actualValue: m.valueType === "ACTUAL" ? m.metricValue : null,
          predictValue: m.valueType === "PREDICTED" ? m.metricValue : null
        });
      });
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {Object.entries(metricsMap).map(([mCode, info]) => (
          <PredictChart
            key={mCode}
            title={mCode}
            metricCode={mCode}
            metricNameKo={info.nameKo}
            data={info.points}
            unit={mCode.toLowerCase().includes('ratio') || mCode.toLowerCase().includes('margin') ? "%" : ""}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="space-y-8 pb-20">
      <header>
        <h1 className="font-serif text-4xl md:text-5xl text-ink font-medium tracking-tight">Financial Intelligence</h1>
        <p className="text-ink-soft mt-2 text-lg">기업별 분기 지표 추이 분석 및 데이터 시각화</p>
      </header>

      {/* 검색 및 필터 섹션 */}
      <Card className="overflow-visible">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            {/* 기업 검색 (디바운싱 적용) */}
            <div className="lg:col-span-2 relative z-20">
              <label className="text-[10px] font-bold text-ink-muted uppercase mb-1 block">Company Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-ink-muted" size={18} />
                <input 
                  placeholder="기업명 입력 (예: 동화, 삼성...)" 
                  value={companySearch}
                  onChange={e => setCompanySearch(e.target.value)}
                  className="w-full pl-10 p-3 bg-paper rounded-xl border border-paper-border text-ink placeholder:text-ink-muted outline-none focus:border-accent transition-all"
                />
                {searchLoading && <Loader2 className="absolute right-3 top-3 animate-spin text-accent" size={18} />}
              </div>
              
              {companyResults.length > 0 && (
                <div className="absolute w-full mt-2 bg-paper border border-paper-border rounded-2xl shadow-soft z-50 max-h-[250px] overflow-auto animate-in fade-in duration-200">
                  {companyResults.map((c, idx) => (
                    <div 
                      key={`${c.stockCode}-${idx}`}
                      onClick={() => {
                        setStockCode(c.stockCode);
                        setCorpName(c.corpName);
                        setCompanySearch("");
                        setCompanyResults([]);
                      }}
                      className="p-4 hover:bg-paper-light cursor-pointer flex justify-between border-b border-paper-border last:border-none"
                    >
                      <span className="font-bold text-ink">{c.corpName}</span>
                      <span className="text-xs text-accent-secondary font-mono bg-accent-secondary/10 px-2 py-1 rounded-md">{c.stockCode}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 기간 설정 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-ink-muted uppercase">From</label>
                <input type="number" value={fromQuarter} onChange={e => setFromQuarter(e.target.value)} className="w-full p-2.5 bg-paper rounded-xl border border-paper-border text-ink text-sm outline-none focus:border-accent" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-ink-muted uppercase">To</label>
                <input type="number" value={toQuarter} onChange={e => setToQuarter(e.target.value)} className="w-full p-2.5 bg-paper rounded-xl border border-paper-border text-ink text-sm outline-none focus:border-accent" />
              </div>
            </div>

            {/* 실행 버튼 */}
            <Button onClick={handleQuery} disabled={loading} className="w-full h-[46px] shadow-accent/30">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <BarChart3 size={18} />}
              조회 실행
            </Button>
          </div>

          {/* 선택된 기업 표시 */}
          {stockCode && (
            <div className="mt-4 p-3 bg-accent-tertiary/10 border border-accent-tertiary/20 rounded-xl flex items-center gap-3 animate-in zoom-in-95">
              <Building2 className="text-accent-tertiary" size={18} />
              <span className="text-sm font-bold text-ink">선택됨: {corpName} ({stockCode})</span>
              <button onClick={() => setStockCode("")} className="ml-auto text-[10px] text-red-500 font-bold hover:underline">선택 취소</button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 결과 차트 영역 */}
      {!groupedData && !loading && (
        <div className="py-20 text-center border-2 border-dashed border-line rounded-3xl opacity-40">
          <TrendingUp size={48} className="mx-auto mb-4" />
          <p className="font-medium">기업을 검색하고 기간을 설정하여 지표 추이를 확인하세요.</p>
        </div>
      )}

      {renderCharts()}
    </main>
  );
}
