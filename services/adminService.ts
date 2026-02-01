import { sentinelFetch } from "@/lib/api-client";
import { ApiResponse, ReportMetricGroupedResponse, CompanySearchResponse } from "@/types/api";

export const adminService = {
  // Corporate Management
  syncDart: async (): Promise<any> => {
    const res = await sentinelFetch<ApiResponse<any>>("/admin/dart/corp-sync", { method: "POST" });
    return res.data;
  },

  searchCompanies: async (keyword: string): Promise<CompanySearchResponse[]> => {
    const res = await sentinelFetch<ApiResponse<CompanySearchResponse[]>>(`/admin/companies/search?keyword=${encodeURIComponent(keyword)}`);
    return res.data;
  },

  // Metrics Management
  importMetrics: async (formData: FormData): Promise<any> => {
    const res = await sentinelFetch<ApiResponse<any>>("/admin/reports/metrics/import", {
      method: "POST",
      body: formData,
    });
    return res.data;
  },

  predictMetrics: async (payload: any): Promise<any> => {
    const res = await sentinelFetch<ApiResponse<any>>("/admin/reports/metrics/predict", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  publishReport: async (formData: FormData): Promise<any> => {
    const res = await sentinelFetch<ApiResponse<any>>("/admin/reports/metrics/publish", {
      method: "POST",
      body: formData,
    });
    return res.data;
  },

  getGroupedMetrics: async (stockCode: string, from: number, to: number): Promise<ReportMetricGroupedResponse> => {
    const res = await sentinelFetch<ApiResponse<ReportMetricGroupedResponse>>(`/admin/reports/metrics/grouped?stockCode=${stockCode}&fromQuarterKey=${from}&toQuarterKey=${to}`);
    return res.data;
  },

  getLatestPredict: async (stockCode: string, quarterKey: number): Promise<any> => {
    const res = await sentinelFetch<ApiResponse<any>>(`/admin/reports/metrics/predict-latest?stockCode=${stockCode}&quarterKey=${quarterKey}`);
    return res.data;
  }
};