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

    // FormData인 경우 브라우저가 직접 Content-Type(boundary 포함)을 설정해야 하므로 제거
    if (options.body instanceof FormData) {
        delete headers["Content-Type"];
    } else if (!headers["Content-Type"]) {
        // 그 외의 경우에만 기본값으로 JSON 설정
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

    