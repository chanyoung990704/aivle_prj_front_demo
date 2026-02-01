// --- Common ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ErrorResponse;
  timestamp: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  timestamp: string;
  path?: string;
  errors?: any[];
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// --- Auth Domain ---
export type UserRole = "ROLE_USER" | "ROLE_ADMIN";
export type UserStatus = "ACTIVE" | "PENDING" | "DELETED";

export interface UserSummaryDto {
  userId: string; // UUID
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthLoginResponse {
  accessToken: string;
  expiresIn: number;
  passwordExpired: boolean;
  user: UserSummaryDto;
}

export interface SignupResponse {
  id: number;
  uuid: string;
  email: string;
  status: UserStatus;
  role: UserRole;
}

// --- Post Domain ---
export interface PostResponse {
  id: number;
  userId: string;
  categoryId: number;
  title: string;
  content: string;
  viewCount: number;
  isPinned: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// --- Comment Domain ---
export interface CommentResponse {
  id: number;
  userId: string;
  postId: number;
  parentId?: number;
  content: string;
  depth: number;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

// --- File Domain ---
export interface FileResponse {
  id: number;
  postId: number;
  storageUrl: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}

// --- Admin & Reports ---
export interface ReportMetricItemDto {
  metricCode: string;
  metricNameKo: string;
  metricValue: number;
  valueType: "ACTUAL" | "PREDICTED";
}

export interface ReportMetricQuarterGroupDto {
  quarterKey: number;
  versionNo: number;
  generatedAt: string;
  metrics: ReportMetricItemDto[];
}

export interface ReportMetricGroupedResponse {
  corpName: string;
  stockCode: string;
  fromQuarterKey: number;
  toQuarterKey: number;
  quarters: ReportMetricQuarterGroupDto[];
}

export interface CompanySearchResponse {
  companyId: number;
  corpName: string;
  corpEngName: string;
  stockCode: string;
}
