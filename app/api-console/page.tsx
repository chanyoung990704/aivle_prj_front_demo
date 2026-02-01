"use client";

import { useState, useEffect } from "react";
import { postService } from "@/services/postService";
import { adminService } from "@/services/adminService";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RefreshCw, Plus, Trash2, Edit, Search, Send, FileUp, Building2, CheckCircle2, BarChart3, MessageSquare, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import PredictChart from "@/components/features/dashboard/PredictChart";
import { useAuth } from "@/context/AuthContext";

export default function ApiConsolePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";
  
  const [activeTab, setActiveTab] = useState("posts");
  const [logs, setLogs] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const availableTabs = isAdmin ? ["posts", "comments", "admin"] : ["posts", "comments"];

  // --- 1. Common States ---
  const [categories, setCategories] = useState<any[]>([]);
  const [lastPostId, setLastPostId] = useState<string>("");
  const [lastCommentId, setLastCommentId] = useState<string>("");

  // --- 2. Posts Tab States ---
  const [posts, setPosts] = useState<any[]>([]);
  const [postForm, setPostForm] = useState({ id: "", title: "", content: "", categoryId: "" });

  // --- 3. Comments Tab States ---
  const [comments, setComments] = useState<any[]>([]);
  const [commentPostId, setCommentPostId] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [parentCommentId, setParentCommentId] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: number; content: string } | null>(null);

  // --- 4. Admin Tab States ---
  const [publishForm, setPublishForm] = useState({
    stockCode: "",
    corpName: "",
    quarterKey: "20253",
    valueType: "ACTUAL",
    metrics: '{"ROA":1.23, "OPM":2.34}',
    pdfFile: null as File | null
  });
  const [companySearch, setCompanySearch] = useState("");
  const [companyResults, setCompanyResults] = useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // --- Initial Load ---
  useEffect(() => {
    loadCategories();
    fetchPosts();
  }, []);

  // --- Debounced Search for Admin Tab ---
  useEffect(() => {
    if (companySearch.trim().length < 2) {
      setCompanyResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await adminService.searchCompanies(companySearch);
        setCompanyResults(res || []);
      } catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [companySearch]);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addLog = (msg: any) => {
    setLogs(prev => [msg, ...prev]);
  };

  // --- Post Functions ---
  const loadCategories = async () => {
    try {
      const res = await postService.getCategories();
      setCategories(res || []);
    } catch (e: any) { showNotification(`Categories Error: ${e.message}`, "error"); }
  };

  const fetchPosts = async () => {
    try {
      const res = await postService.getPosts({ page: 1, size: 10 });
      const content = res.content || [];
      setPosts(content);
      if (content.length > 0) setLastPostId(content[0].id.toString());
      addLog({ event: "Fetch Posts", count: content.length });
    } catch (e: any) { addLog({ error: e.message }); }
  };

  const handleCreatePost = async () => {
    try {
      const res = await postService.createPost({
        title: postForm.title,
        content: postForm.content,
        categoryId: Number(postForm.categoryId)
      });
      const newId = (res as any).data?.id || (res as any).id;
      setLastPostId(newId.toString());
      showNotification("Post created!");
      fetchPosts();
    } catch (e: any) { showNotification(e.message, "error"); }
  };

  const handleUpdatePost = async () => {
    if (!postForm.id) return;
    try {
      await postService.updatePost(Number(postForm.id), {
        title: postForm.title,
        content: postForm.content,
        categoryId: Number(postForm.categoryId)
      });
      showNotification("Post updated!");
      fetchPosts();
    } catch (e: any) { showNotification(e.message, "error"); }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete post?")) return;
    try {
      await postService.deletePost(Number(id));
      showNotification("Post deleted!");
      fetchPosts();
    } catch (e: any) { showNotification(e.message, "error"); }
  };

  // --- Comment Functions ---
  const fetchComments = async () => {
    const targetId = commentPostId || lastPostId;
    if (!targetId) return showNotification("Enter Post ID", "error");
        try {
          const res = await postService.getComments(Number(targetId));
          const data = res || [];
          setComments(data);
          if (data.length > 0) setLastCommentId(data[0].id.toString());
          showNotification(`Loaded ${data.length} comments`);
        } catch (e: any) { 
     showNotification(e.message, "error"); }
  };

  const handleCreateComment = async () => {
    const targetId = commentPostId || lastPostId;
    try {
      const res = await postService.createComment(Number(targetId), {
        postId: Number(targetId),
        content: commentContent,
        parentId: parentCommentId
      });
      showNotification("Comment added!");
      setCommentContent("");
      setParentCommentId(null);
      fetchComments();
    } catch (e: any) { showNotification(e.message, "error"); }
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;
    try {
      await postService.updateComment(editingComment.id, { content: editingComment.content });
      showNotification("Comment updated!");
      setEditingComment(null);
      fetchComments();
    } catch (e: any) { showNotification(e.message, "error"); }
  };

  const handleDeleteComment = async (id: number) => {
    if (!confirm("Delete comment?")) return;
    try {
      await postService.deleteComment(id);
      showNotification("Comment deleted!");
      fetchComments();
    } catch (e: any) { showNotification(e.message, "error"); }
  };

  // --- Admin Functions ---
  const handlePublish = async () => {
    if (!publishForm.stockCode || !publishForm.pdfFile) return showNotification("Stock Code & PDF required", "error");
    try {
      const formData = new FormData();
      formData.append("stockCode", publishForm.stockCode);
      formData.append("quarterKey", publishForm.quarterKey);
      formData.append("valueType", publishForm.valueType);
      formData.append("metrics", publishForm.metrics);
      formData.append("file", publishForm.pdfFile);
      const res = await adminService.publishReport(formData);
      addLog({ event: "Report Published", data: res });
      showNotification("Published successfully!");
      setIsPreviewOpen(true);
    } catch (e: any) { showNotification(e.message, "error"); }
  };

  return (
    <div className="space-y-6 relative pb-20">
      {notification && (
        <div className={cn(
          "fixed top-10 right-10 z-[100] px-6 py-3 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-300",
          notification.type === "success" ? "bg-accent-tertiary text-white" : "bg-red-500 text-white"
        )}>
          {notification.message}
        </div>
      )}

      <header className="flex justify-between items-center">
        <div>
            <h1 className="font-serif text-3xl md:text-4xl text-ink font-medium">Dev API Console</h1>
            <p className="text-ink-soft mt-1">Full CRUD & Admin Intelligence Tools</p>
        </div>
        <div className="bg-white border border-line p-1 rounded-xl flex gap-1">
            {availableTabs.map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)} 
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-bold capitalize cursor-pointer transition-all",
                        activeTab === tab ? "bg-paper text-accent shadow-sm" : "text-ink-muted hover:bg-paper/50"
                    )}
                >
                    {tab}
                </button>
            ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            
            {activeTab === "posts" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader><h2 className="font-serif text-xl flex items-center gap-2"><FileText size={20} className="text-accent"/> Post Management</h2></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Post ID (Edit/Delete)" value={postForm.id} onChange={e => setPostForm({...postForm, id: e.target.value})} className="p-3 bg-paper rounded-xl border border-line outline-none" />
                                <select value={postForm.categoryId} onChange={e => setPostForm({...postForm, categoryId: e.target.value})} className="p-3 bg-paper rounded-xl border border-line outline-none">
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <input placeholder="Post Title" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} className="w-full p-3 bg-paper rounded-xl border border-line outline-none" />
                            <textarea placeholder="Post Content" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} className="w-full p-3 bg-paper rounded-xl border border-line min-h-[100px] outline-none" />
                            <div className="flex gap-2">
                                <Button onClick={handleCreatePost} className="flex-1">Create</Button>
                                <Button onClick={handleUpdatePost} variant="secondary" className="flex-1">Update</Button>
                                <Button onClick={() => handleDeletePost(postForm.id)} variant="outline" className="text-red-500"><Trash2 size={18}/></Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-serif text-lg">Recent Posts</h3>
                                <button onClick={fetchPosts} className="p-2 hover:bg-paper rounded-full transition-colors"><RefreshCw size={18}/></button>
                            </div>
                            <div className="space-y-2">
                                {posts.map(p => (
                                    <div key={p.id} onClick={() => setPostForm({id: p.id, title: p.title, content: p.content, categoryId: p.categoryId})} className="p-3 border border-line rounded-xl hover:bg-paper-light cursor-pointer flex justify-between items-center transition-colors">
                                        <div>
                                            <div className="font-bold text-ink">{p.title}</div>
                                            <div className="text-[10px] text-ink-muted">ID: {p.id} • Category: {p.categoryId}</div>
                                        </div>
                                        <Edit size={14} className="text-accent opacity-0 group-hover:opacity-100" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "comments" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader><h2 className="font-serif text-xl flex items-center gap-2"><MessageSquare size={20} className="text-accent-secondary"/> Comment Tree</h2></CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-6">
                                <div className="flex-1 relative">
                                    <input placeholder="Post ID" value={commentPostId || lastPostId} onChange={e => setCommentPostId(e.target.value)} className="w-full p-3 bg-paper rounded-xl border border-line outline-none" />
                                    {lastPostId && !commentPostId && <span className="absolute right-3 top-3 text-[10px] text-accent font-bold">LATEST</span>}
                                </div>
                                <Button onClick={fetchComments} variant="outline">Load Tree</Button>
                            </div>
                            <div className="space-y-4 mb-8 max-h-[400px] overflow-auto p-2 bg-paper/30 rounded-2xl">
                                {comments.length === 0 && <div className="text-center py-10 text-ink-muted border border-dashed border-line rounded-2xl">No comments. Load by Post ID.</div>}
                                {comments.map(c => (
                                    <div key={c.id} style={{ marginLeft: `${Math.min(c.depth * 24, 120)}px` }} className={cn("p-4 rounded-2xl bg-white border border-line shadow-sm", c.depth > 0 && "border-l-4 border-l-accent-secondary")}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2"><span className="text-xs font-bold text-ink">User {c.userId}</span><span className="text-[10px] text-ink-muted bg-paper px-2 py-0.5 rounded-md">ID: {c.id}</span></div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setParentCommentId(c.id)} className="text-[11px] font-bold text-accent-secondary hover:underline">Reply</button>
                                                <button onClick={() => {setEditingComment({ id: c.id, content: c.content }); setLastCommentId(c.id.toString());}} className="text-[11px] font-bold text-ink-muted hover:text-ink">Edit</button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-ink-soft">{c.content}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-paper rounded-2xl border border-dashed border-line">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-sm">{parentCommentId ? `Reply to #${parentCommentId}` : "New Comment"}</h4>
                                    {parentCommentId && <button onClick={() => setParentCommentId(null)} className="text-[11px] text-ink-muted hover:underline">Cancel</button>}
                                </div>
                                <textarea placeholder="Write a comment..." value={commentContent} onChange={e => setCommentContent(e.target.value)} className="w-full p-3 bg-white rounded-xl border border-line outline-none min-h-[80px] text-sm" />
                                <Button onClick={handleCreateComment} className="w-full mt-3">Submit</Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-accent/20">
                        <CardContent>
                            <h2 className="font-serif text-lg mb-4">Edit / Delete Comment</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <input value={editingComment?.id || lastCommentId} onChange={e => setLastCommentId(e.target.value)} className="p-3 bg-paper rounded-xl border border-line outline-none text-sm" placeholder="Comment ID" />
                                <textarea value={editingComment?.content || ""} onChange={e => setEditingComment({id: editingComment?.id || Number(lastCommentId), content: e.target.value})} className="p-3 bg-paper rounded-xl border border-line outline-none min-h-[60px] text-sm" placeholder="Content" />
                                <div className="flex gap-2">
                                    <Button onClick={handleUpdateComment} variant="secondary" className="flex-1">Update</Button>
                                    <Button onClick={() => handleDeleteComment(editingComment?.id || Number(lastCommentId))} variant="outline" className="text-red-500 flex-1">Delete</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "admin" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader><h2 className="font-serif text-xl flex items-center gap-2"><Building2 size={20} className="text-accent-secondary"/> Entity Search</h2></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-3 text-ink-muted" size={18} />
                                        <input placeholder="Search company (Debounced)" value={companySearch} onChange={e => setCompanySearch(e.target.value)} className="w-full pl-10 p-3 bg-paper rounded-xl border border-line outline-none" />
                                    </div>
                                    <Button variant="outline" onClick={() => adminService.syncDart().then(addLog)}><RefreshCw size={16}/> Sync DART</Button>
                                </div>
                                {companyResults.length > 0 && (
                                    <div className="absolute w-full mt-2 bg-white border border-line rounded-2xl shadow-soft z-50 max-h-[200px] overflow-auto">
                                        {companyResults.map((c, idx) => (
                                            <div key={`${c.stockCode || 'no-code'}-${idx}`} onClick={() => {setPublishForm({...publishForm, stockCode: c.stockCode || "", corpName: c.corpName}); setCompanySearch(""); setCompanyResults([]);}} className="p-4 hover:bg-paper cursor-pointer flex justify-between border-b border-line last:border-none">
                                                <span className="font-bold">{c.corpName}</span><span className="text-xs text-accent-secondary font-mono">{c.stockCode || "N/A"}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {publishForm.stockCode && <div className="p-4 bg-accent-tertiary/10 border border-accent-tertiary/20 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3"><CheckCircle2 className="text-accent-tertiary" size={20} /><div><div className="text-[10px] text-ink-muted font-bold uppercase">Target Entity</div><div className="font-bold">{publishForm.corpName} ({publishForm.stockCode})</div></div></div>
                                <button onClick={() => setPublishForm({...publishForm, stockCode: ""})} className="text-xs text-red-500 font-bold">Cancel</button>
                            </div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><h2 className="font-serif text-xl flex items-center gap-2"><Send size={20} className="text-accent"/> Report Publish</h2></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" value={publishForm.quarterKey} onChange={e => setPublishForm({...publishForm, quarterKey: e.target.value})} className="p-3 bg-paper rounded-xl border border-line outline-none" />
                                <select value={publishForm.valueType} onChange={e => setPublishForm({...publishForm, valueType: e.target.value})} className="p-3 bg-paper rounded-xl border border-line outline-none">
                                    <option value="ACTUAL">ACTUAL</option><option value="PREDICTED">PREDICTED</option>
                                </select>
                            </div>
                            <textarea value={publishForm.metrics} onChange={e => setPublishForm({...publishForm, metrics: e.target.value})} className="w-full p-4 bg-paper rounded-xl border border-line outline-none font-mono text-sm min-h-[80px]" />
                            <div className="relative border-2 border-dashed border-line rounded-2xl p-6 text-center hover:bg-paper transition-all group">
                                <input type="file" accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setPublishForm({...publishForm, pdfFile: e.target.files?.[0] || null})} />
                                <FileUp className="mx-auto text-accent mb-2 group-hover:scale-110 transition-transform" size={32} />
                                <p className="text-sm font-bold">{publishForm.pdfFile ? publishForm.pdfFile.name : "Select PDF File"}</p>
                            </div>
                            <Button onClick={handlePublish} className="w-full py-4">Execute Publish</Button>
                        </CardContent>
                    </Card>
                    {isPreviewOpen && (
                        <div className="animate-in slide-in-from-bottom-4">
                            <h3 className="font-serif text-2xl mb-4 flex items-center gap-2"><BarChart3 className="text-accent-secondary"/> Visualization Result</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(JSON.parse(publishForm.metrics)).map(([key, val]: any) => (
                                    <PredictChart key={key} title={key} metricCode={key} metricNameKo={key} data={[{ period: "Published", actualValue: publishForm.valueType === "ACTUAL" ? val : null, predictValue: publishForm.valueType === "PREDICTED" ? val : null }]} unit="%" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="bg-ink text-paper p-6 rounded-3xl h-[800px] flex flex-col shadow-soft sticky top-10">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                <span className="text-ink-muted uppercase tracking-wider font-bold text-xs">System Terminal</span>
                <button onClick={() => setLogs([])} className="text-ink-muted hover:text-white transition-colors cursor-pointer text-xs">Clear</button>
            </div>
            <div className="flex-1 overflow-auto font-mono text-[11px] space-y-2">
                {logs.length === 0 && <span className="text-white/20 italic">Awaiting commands...</span>}
                {logs.map((log, i) => (
                    <div key={i} className="break-all border-b border-white/5 pb-2 mb-2 last:border-0 leading-relaxed text-accent-secondary">
                        <span className="text-white mr-2">➜</span><pre className="inline whitespace-pre-wrap">{JSON.stringify(log, null, 2)}</pre>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}