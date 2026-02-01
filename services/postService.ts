import { sentinelFetch } from "@/lib/api-client";
import { ApiResponse, PageResponse, PostResponse, CommentResponse } from "@/types/api";

export const postService = {
  // Categories
  getCategories: async (): Promise<any[]> => {
    const res = await sentinelFetch<any>("/dev/categories");
    return res.data ?? res;
  },

  // Posts
  getPosts: async (params: any): Promise<PageResponse<PostResponse>> => {
    const query = new URLSearchParams(params).toString();
    const res = await sentinelFetch<any>(`/posts?${query}`);
    return res.data ?? res;
  },

  getPost: async (id: number): Promise<PostResponse> => {
    const res = await sentinelFetch<any>(`/posts/${id}`);
    return res.data ?? res;
  },

  createPost: async (payload: any): Promise<PostResponse> => {
    const res = await sentinelFetch<any>("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data ?? res;
  },

  updatePost: async (id: number, payload: any): Promise<PostResponse> => {
    const res = await sentinelFetch<any>(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data ?? res;
  },

  deletePost: async (id: number): Promise<void> => {
    const res = await sentinelFetch<any>(`/posts/${id}`, { method: "DELETE" });
    return res.data ?? res;
  },

  // Comments
  getComments: async (postId: number): Promise<CommentResponse[]> => {
    const res = await sentinelFetch<any>(`/posts/${postId}/comments`);
    return res.data ?? res;
  },

  createComment: async (postId: number, payload: any): Promise<CommentResponse> => {
    const res = await sentinelFetch<any>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data ?? res;
  },

  updateComment: async (id: number, payload: any): Promise<CommentResponse> => {
    const res = await sentinelFetch<any>(`/comments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data ?? res;
  },

  deleteComment: async (id: number): Promise<void> => {
    const res = await sentinelFetch<any>(`/comments/${id}`, { method: "DELETE" });
    return res.data ?? res;
  }
};
