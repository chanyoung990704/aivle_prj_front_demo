import { sentinelFetch } from "@/lib/api-client";

export const adminService = {
    // DART & 기업 관리
    syncDart: () => sentinelFetch("/admin/dart/corp-sync", { method: "POST" }),
    searchCompanies: (keyword: string) => sentinelFetch<any>(`/admin/companies/search?keyword=${encodeURIComponent(keyword)}`),

    // 리포트 지표 관리
    importMetrics: (formData: FormData) => sentinelFetch("/admin/reports/metrics/import", {
        method: "POST",
        body: formData, // Multipart
    }),
    predictMetrics: (payload: any) => sentinelFetch("/admin/reports/metrics/predict", {
        method: "POST",
        body: JSON.stringify(payload),
    }),
    publishReport: (formData: FormData) => sentinelFetch("/admin/reports/metrics/publish", {
        method: "POST",
        body: formData, // Multipart (JSON + PDF)
    }),
    getGroupedMetrics: (stockCode: string, from: number, to: number) => 
        sentinelFetch<any>(`/admin/reports/metrics/grouped?stockCode=${stockCode}&fromQuarterKey=${from}&toQuarterKey=${to}`),
};
