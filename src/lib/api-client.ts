import { ENV } from "@/config/env";

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
    skipAuth?: boolean;
}

const API_BASE_URL = ENV.API_URL;

/**
 * SENTINEL Fetch Wrapper
 * Automatically injects the JWT token from localStorage into the Authorization header.
 */
export async function sentinelFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
        ...options.headers,
    };

    // Body가 있고 FormData가 아닌 경우에만 JSON Content-Type 설정
    if (options.body) {
        if (options.body instanceof FormData) {
            delete headers["Content-Type"];
        } else if (!headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }
    }

    // Client-side only: Access localStorage
    if (!options.skipAuth && typeof window !== "undefined") {
        const tokensString = localStorage.getItem("auth-console.tokens");
        if (tokensString) {
            try {
                const tokens = JSON.parse(tokensString);
                if (tokens.accessToken) {
                    headers["Authorization"] = `Bearer ${tokens.accessToken}`;
                }
            } catch (e) {
                console.error("Failed to parse auth tokens", e);
            }
        }
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const contentType = response.headers.get("content-type");
    let data: any = null;

    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    if (!response.ok) {
        if (response.status === 401) {
            console.warn("Unauthorized: Token might be expired or invalid");
        }

        let errorMessage = "Unknown Error";
        if (data?.message) {
            errorMessage = typeof data.message === "object" ? (data.message.message || JSON.stringify(data.message)) : data.message;
        } else if (data?.error) {
            errorMessage = typeof data.error === "object" ? (data.error.message || JSON.stringify(data.error)) : data.error;
        } else {
            errorMessage = `Error ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
    }

    return data as T;
}