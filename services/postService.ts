import { sentinelFetch } from "@/lib/api-client";
import { ApiResponse, PageResponse, PostResponse, CommentResponse } from "@/types/api";

export const postService = {
  // Categories
  getCategories: async (): Promise<any[]> => {
    const res = await sentinelFetch<ApiResponse<any[]>>("/dev/categories");
    return res.data;
  },

  // Posts
  getPosts: async (params: any): Promise<PageResponse<PostResponse>> => {
    const query = new URLSearchParams(params).toString();
    const res = await sentinelFetch<ApiResponse<PageResponse<PostResponse>>>(`/posts?${query}`);
    return res.data;
  },

  getPost: async (id: number): Promise<PostResponse> => {
    const res = await sentinelFetch<ApiResponse<PostResponse>>(`/posts/${id}`);
    return res.data;
  },

  createPost: async (payload: any): Promise<PostResponse> => {
    const res = await sentinelFetch<ApiResponse<PostResponse>>("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  updatePost: async (id: number, payload: any): Promise<PostResponse> => {
    const res = await sentinelFetch<ApiResponse<PostResponse>>(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  deletePost: async (id: number): Promise<void> => {
    await sentinelFetch<ApiResponse<void>>(`/posts/${id}`, { method: "DELETE" });
  },

  // Comments
  getComments: async (postId: number): Promise<CommentResponse[]> => {
    const res = await sentinelFetch<ApiResponse<CommentResponse[]>>(`/posts/${postId}/comments`);
    return res.data;
  },

  createComment: async (postId: number, payload: any): Promise<CommentResponse> => {
    const res = await sentinelFetch<ApiResponse<CommentResponse>>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  updateComment: async (id: number, payload: any): Promise<CommentResponse> => {
    const res = await sentinelFetch<ApiResponse<CommentResponse>>(`/comments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  deleteComment: async (id: number): Promise<void> => {
    await sentinelFetch<ApiResponse<void>>(`/comments/${id}`, { method: "DELETE" });
  }
};
