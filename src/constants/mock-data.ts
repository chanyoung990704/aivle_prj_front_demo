import { MetricData } from "@/types/dashboard";

export const OPM_MOCK_DATA: MetricData[] = [
    { period: "23.1Q", actualValue: 4.2, predictValue: null },
    { period: "23.2Q", actualValue: 3.8, predictValue: null },
    { period: "23.3Q", actualValue: 4.5, predictValue: null },
    { period: "23.4Q", actualValue: 5.1, predictValue: 5.1 },
    { period: "24.1Q", actualValue: null, predictValue: 5.8 },
    { period: "24.2Q", actualValue: null, predictValue: 6.2 },
];

export const ROA_MOCK_DATA: MetricData[] = [
    { period: "23.1Q", actualValue: 2.1, predictValue: null },
    { period: "23.2Q", actualValue: 2.4, predictValue: null },
    { period: "23.3Q", actualValue: 2.3, predictValue: 2.3 },
    { period: "23.4Q", actualValue: null, predictValue: 2.8 },
    { period: "24.1Q", actualValue: null, predictValue: 3.1 },
];
