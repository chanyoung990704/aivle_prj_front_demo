export interface MetricData {
    period: string;       // e.g., "2023 4Q", "2024 1Q"
    actualValue: number | null;
    predictValue: number | null;
}

export interface DashboardMetricProps {
    title: string;
    metricCode: string;
    metricNameKo: string;
    data: MetricData[];
    unit?: string;
}
