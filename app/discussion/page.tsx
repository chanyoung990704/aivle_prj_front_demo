"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { postService } from "@/services/postService";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  MessageSquare, 
  Plus, 
  ChevronRight, 
  User, 
  Clock, 
  Trash2, 
  Edit3, 
  CornerDownRight, 
  Send,
  Loader2,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PostResponse, CommentResponse } from "@/types/api";
import { useAuth } from "@/context/AuthContext";

export default function DiscussionPage() {
  const { isAuthenticated, user } = useAuth();
  
  // States
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [isCreating, setIsCreating] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", content: "", categoryId: "" });
  const [commentContent, setCommentContent] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [postRes, catRes] = await Promise.all([
        postService.getPosts({ page: 1, size: 20, sortBy: "createdAt", direction: "DESC" }),
        postService.getCategories()
      ]);
      setPosts(postRes.content);
      setCategories(catRes || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getCategoryName = (id: number) => {
    return categories.find(c => c.id === id)?.name || `Category ${id}`;
  };

  const handlePostClick = async (post: PostResponse) => {
    setSelectedPost(post);
    setIsCreating(false);
    try {
      const res = await postService.getComments(post.id);
      setComments(res);
    } catch (e) { console.error(e); }
  };

  const handleCreatePost = async () => {
    try {
      await postService.createPost({
        ...postForm,
        categoryId: Number(postForm.categoryId)
      });
      setIsCreating(false);
      setPostForm({ title: "", content: "", categoryId: "" });
      loadInitialData();
    } catch (e: any) { alert(e.message); }
  };

  const handleCreateComment = async () => {
    if (!selectedPost) return;
    try {
      await postService.createComment(selectedPost.id, {
        content: commentContent,
        parentId: replyTo || undefined
      });
      setCommentContent("");
      setReplyTo(null);
      // Reload comments
      const res = await postService.getComments(selectedPost.id);
      setComments(res);
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      
      {/* 1. Post List (Left Column) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="text-accent" /> Discussion
            </h2>
            <Button size="sm" onClick={() => {setIsCreating(true); setSelectedPost(null);}} disabled={!isAuthenticated}>
                <Plus size={16} /> New Post
            </Button>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center py-20 opacity-20"><Loader2 className="animate-spin mb-2" /> Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-line rounded-3xl text-ink-muted">No discussions yet.</div>
          ) : posts.map(post => (
            <div 
                key={post.id} 
                onClick={() => handlePostClick(post)}
                className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer group",
                    selectedPost?.id === post.id 
                        ? "bg-white border-accent shadow-card ring-1 ring-accent/20" 
                        : "bg-white/50 border-line hover:border-ink-soft hover:bg-white"
                )}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider bg-accent/10 text-accent"
                    )}>
                        {getCategoryName(post.categoryId)}
                    </span>
                    <span className="text-[10px] text-ink-muted font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-ink group-hover:text-accent transition-colors truncate">{post.title}</h3>
                <p className="text-xs text-ink-soft mt-1 line-clamp-1">{post.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Detail & Editor (Right Column) */}
      <div className="lg:col-span-8">
        {isCreating ? (
            <Card className="border-accent/30 shadow-soft animate-in slide-in-from-right-4 duration-500">
                <CardHeader className="border-b border-line pb-4 mb-6">
                    <h3 className="text-xl font-serif font-bold">Create New Discussion</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select 
                            className="p-4 bg-paper rounded-2xl border border-line outline-none focus:border-accent text-sm font-bold"
                            value={postForm.categoryId}
                            onChange={e => setPostForm({...postForm, categoryId: e.target.value})}
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input 
                            placeholder="Thread Title" 
                            className="md:col-span-2 w-full p-4 bg-paper rounded-2xl border border-line outline-none focus:border-accent text-lg font-bold"
                            value={postForm.title}
                            onChange={e => setPostForm({...postForm, title: e.target.value})}
                        />
                    </div>
                    <textarea 
                        placeholder="What's on your mind? Share financial insights or ask questions..." 
                        className="w-full p-4 bg-paper rounded-2xl border border-line outline-none focus:border-accent min-h-[300px] text-sm leading-relaxed"
                        value={postForm.content}
                        onChange={e => setPostForm({...postForm, content: e.target.value})}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button onClick={handleCreatePost} className="px-10">Publish Post</Button>
                    </div>
                </CardContent>
            </Card>
        ) : selectedPost ? (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Card>
                    <CardContent className="p-8">
                        <header className="mb-8 border-b border-line pb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-accent"><User size={20}/></div>
                                <div>
                                    <p className="text-sm font-bold text-ink">Author ID: {selectedPost.userId.slice(0, 8)}...</p>
                                    <div className="flex items-center gap-2 text-[10px] text-ink-muted">
                                        <Clock size={12} /> {new Date(selectedPost.createdAt).toLocaleString()}
                                        <span>•</span>
                                        <span>Views: {selectedPost.viewCount}</span>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-ink leading-tight">{selectedPost.title}</h2>
                        </header>
                        <div className="prose prose-slate max-w-none">
                            <p className="text-ink-soft leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Comment Section */}
                <section className="space-y-4">
                    <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                        <MessageSquare size={18} className="text-accent-secondary" /> Comments ({comments.length})
                    </h3>
                    
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <div 
                                key={comment.id} 
                                style={{ marginLeft: `${Math.min(comment.depth * 32, 128)}px` }}
                                className={cn(
                                    "p-4 rounded-2xl bg-white border border-line shadow-sm relative group transition-all",
                                    comment.depth > 0 && "border-l-4 border-l-accent-secondary"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-ink">User {comment.userId.slice(0,6)}</span>
                                        <span className="text-[10px] text-ink-muted font-mono">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <button 
                                        onClick={() => setReplyTo(comment.id)}
                                        className="text-[10px] font-bold text-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                    >
                                        <ChevronRight size={12} /> Reply
                                    </button>
                                </div>
                                <p className="text-sm text-ink-soft leading-relaxed">{comment.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Comment Input */}
                    {isAuthenticated ? (
                        <Card className="bg-paper/50 border-dashed">
                            <CardContent className="p-4">
                                {replyTo && (
                                    <div className="flex items-center justify-between mb-2 px-2">
                                        <span className="text-[10px] font-bold text-accent flex items-center gap-1">
                                            <CornerDownRight size={12} /> Replying to #{replyTo}
                                        </span>
                                        <button onClick={() => setReplyTo(null)} className="text-[10px] text-ink-muted hover:underline">Cancel</button>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <textarea 
                                        placeholder="Add a comment..." 
                                        className="flex-1 p-3 bg-white rounded-xl border border-line outline-none text-sm min-h-[80px]"
                                        value={commentContent}
                                        onChange={e => setCommentContent(e.target.value)}
                                    />
                                    <Button onClick={handleCreateComment} className="self-end h-[80px] w-20 flex flex-col gap-1">
                                        <Send size={18} />
                                        <span className="text-[10px]">Post</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="p-6 bg-paper/30 border border-dashed border-line rounded-2xl text-center">
                            <p className="text-sm text-ink-muted">Please <Link href="/auth" className="text-accent font-bold hover:underline">Sign In</Link> to participate in the discussion.</p>
                        </div>
                    )}
                </section>
            </div>
        ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center opacity-30">
                <div className="p-10 bg-paper rounded-full mb-6">
                    <MessageSquare size={64} className="text-ink-muted" />
                </div>
                <h3 className="text-2xl font-serif font-medium text-ink">Select a discussion thread</h3>
                <p className="max-w-xs mt-2 text-sm">Click on a post from the list to view its full content and join the conversation.</p>
            </div>
        )}
      </div>
    </div>
  );
}
