// 3. Integration & Auth Helper

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * SENTINEL Fetch Wrapper
 * Automatically injects the JWT token from localStorage into the Authorization header.
 */
export async function sentinelFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
        ...options.headers,
    };

    // Body가 FormData가 아닐 때만 기본 Content-Type 설정
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    // Client-side only: Access localStorage
    if (typeof window !== "undefined") {
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

            credentials: "include",

        });

    

        // 응답이 JSON인지 확인

        const contentType = response.headers.get("content-type");

        let data: any = null;

        

        if (contentType && contentType.includes("application/json")) {

            data = await response.json();

        } else {

            data = { message: await response.text() };

        }

    

        if (!response.ok) {

            // 401 Unauthorized 처리 (액세스 토큰 만료 등)

            if (response.status === 401) {

                console.warn("Unauthorized: Token might be expired or invalid");

            }

            

            // 상세 에러 메시지 구성

            const errorMessage = data?.message || data?.error || `Error ${response.status}: ${response.statusText}`;

            throw new Error(errorMessage);

        }

    

        return data as T;

    }

    