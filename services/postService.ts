import { sentinelFetch } from "@/lib/api-client";

export const postService = {
    // 카테고리
    getCategories: () => sentinelFetch<any>("/dev/categories"),

    // 게시글
    getPosts: (params: any) => {
        const query = new URLSearchParams(params).toString();
        return sentinelFetch<any>(`/posts?${query}`);
    },
    getPost: (id: number) => sentinelFetch<any>(`/posts/${id}`),
    createPost: (payload: any) => sentinelFetch("/posts", {
        method: "POST",
        body: JSON.stringify(payload),
    }),
    updatePost: (id: number, payload: any) => sentinelFetch(`/posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    }),
    deletePost: (id: number) => sentinelFetch(`/posts/${id}`, { method: "DELETE" }),

    // 댓글
    getComments: (postId: number) => sentinelFetch<any>(`/posts/${postId}/comments`),
    createComment: (postId: number, payload: any) => sentinelFetch(`/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify(payload),
    }),
    updateComment: (id: number, payload: any) => sentinelFetch(`/comments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    }),
    deleteComment: (id: number) => sentinelFetch(`/comments/${id}`, { method: "DELETE" }),
};