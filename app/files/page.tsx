"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { sentinelFetch } from "@/lib/api-client";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UploadCloud, File, Eye, Download, Trash2, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function FileConsolePage() {
  const { accessToken } = useAuth();
  const [postId, setPostId] = useState("");
  const [listPostId, setListPostId] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [log, setLog] = useState<any>("Ready for actions...");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // 1. 선택된 파일 정보 요약 (Template updateFileHint 로직)
  const getFileHint = () => {
    if (!selectedFiles || selectedFiles.length === 0) return "선택된 파일이 없습니다.";
    return Array.from(selectedFiles)
      .map(f => `${f.name} (${Math.round(f.size / 1024)} KB)`)
      .join(", ");
  };

  const addLog = (payload: any) => {
    setLog(payload);
  };

  // 2. 파일 업로드 (Template uploadFiles 로직)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId) return addLog("postId를 입력하세요.");
    if (!selectedFiles || selectedFiles.length === 0) return addLog("업로드할 파일을 선택하세요.");
    if (!accessToken) return addLog("Access Token이 없습니다. 로그인을 먼저 진행하세요.");

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append("files", file);
    });

    addLog("업로드 요청 중...");
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/posts/${postId}/files`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: formData
        });
        const data = await res.json();
        addLog({ status: res.status, body: data });
        if (res.ok) {
            setListPostId(postId);
            fetchFiles(postId);
        }
    } catch (err: any) {
        addLog(`Upload Failed: ${err.message}`);
    }
  };

  // 3. 파일 목록 조회 (Template fetchFileList 로직)
  const fetchFiles = async (targetId?: string) => {
    const id = targetId || listPostId;
    if (!id) return addLog("조회할 postId를 입력하세요.");
    
    addLog("파일 목록 조회 중...");
    try {
        const res = await sentinelFetch<any>(`/posts/${id}/files`);
        // res가 { success: true, data: [] } 구조인 경우와 직접 배열인 경우 모두 대응
        const fileList = res.data || res || [];
        setFiles(fileList);
        addLog({ status: "SUCCESS", count: fileList.length, data: fileList });
    } catch (err: any) {
        addLog(`Fetch Failed: ${err.message}`);
    }
  };

  // 4. [고도화] fetch 대신 브라우저 네이티브 다운로드 사용 (CORS 원천 차단)
  // 분석 내용에 따라 fetch() + res.blob() 로직을 제거하고 직접 이동 방식을 채택합니다.
  
  const handleView = async (fileId: number) => {
    if (!accessToken) return addLog("로그인이 필요합니다.");
    addLog(`Fetching file ${fileId} with Authorization header...`);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${fileId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: Access Denied`);
        
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        addLog("File opened successfully.");
    } catch (err: any) {
        addLog(`View Error: ${err.message}. (Note: S3 CORS might still block fetch if not configured)`);
    }
  };

  const handleDownload = async (fileId: number, filename: string) => {
    if (!accessToken) return addLog("로그인이 필요합니다.");
    addLog(`Downloading ${filename} via fetch...`);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${fileId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: Download failed`);
        
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        addLog("Download started.");
    } catch (err: any) {
        addLog(`Download Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="font-serif text-3xl md:text-4xl text-ink font-medium">File Upload Console</h1>
        <p className="text-ink-soft mt-2">개발 환경 파일 업로드 및 Blob 기반 보안 핸들링 검증</p>
      </header>

      {/* 1. 토큰 상태 (Template Token Preview 카드) */}
      <Card className="bg-accent/5 border-accent/10">
        <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <ShieldCheck className="text-accent" size={20} />
                <div className="text-sm">
                    <span className="text-ink-muted font-bold mr-2 uppercase text-[10px]">Access Token:</span>
                    <code className="text-ink font-mono bg-white px-2 py-1 rounded border border-line">
                        {accessToken ? `${accessToken.slice(0, 40)}...` : "None"}
                    </code>
                </div>
            </div>
            <div className="text-[10px] font-bold text-accent bg-white px-3 py-1 rounded-full shadow-sm border border-line">
                SECURE SESSION ACTIVE
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            {/* 2. 파일 업로드 카드 (Template File Upload 카드) */}
            <Card>
                <CardHeader>
                    <h2 className="font-serif text-xl">파일 업로드</h2>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-ink-muted uppercase block mb-2">Target Post ID</label>
                            <input 
                                value={postId}
                                onChange={(e) => setPostId(e.target.value)}
                                type="number" 
                                placeholder="업로드할 게시글 ID 입력" 
                                className="w-full p-3 bg-paper rounded-xl border border-line focus:border-accent outline-none" 
                                required 
                            />
                        </div>
                        <div className="border-2 border-dashed border-line rounded-2xl p-8 text-center hover:bg-paper transition-all group relative">
                            <input 
                                type="file" 
                                multiple 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                onChange={(e) => setSelectedFiles(e.target.files)}
                            />
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                    <UploadCloud size={32} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-ink">파일을 클릭하거나 드래그하세요</p>
                                    <p className="text-xs text-ink-muted mt-1">{getFileHint()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit" className="flex-1">업로드 시작</Button>
                            <Button type="button" variant="outline" onClick={() => {setLog("Ready..."); setSelectedFiles(null);}}>로그 초기화</Button>
                        </div>
                    </form>
                    <ul className="mt-6 space-y-2">
                        <li className="text-[11px] text-ink-soft flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-accent" /> 요청 경로: <code className="bg-paper px-1 rounded">/posts/&#123;postId&#125;/files</code>
                        </li>
                        <li className="text-[11px] text-ink-soft flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-accent" /> 파일은 <code className="bg-paper px-1 rounded">multipart/form-data</code>로 전송됩니다.
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {/* 3. 업로드 파일 조회 (Template Uploaded Files 카드) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b border-line pb-4 mb-4">
                    <h2 className="font-serif text-xl">업로드 파일 조회</h2>
                    <div className="flex gap-2">
                        <input 
                            value={listPostId}
                            onChange={(e) => setListPostId(e.target.value)}
                            type="number" 
                            placeholder="Post ID" 
                            className="w-24 p-2 text-xs bg-paper rounded-lg border border-line outline-none" 
                        />
                        <Button size="sm" variant="secondary" onClick={() => fetchFiles()}>목록 조회</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {files.length === 0 && (
                            <div className="py-10 text-center text-ink-muted text-sm border border-dashed border-line rounded-2xl bg-paper/30">
                                조회된 파일이 없습니다.
                            </div>
                        )}
                        {files.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-4 border border-line rounded-2xl bg-white shadow-sm hover:border-accent/30 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-paper rounded-xl text-ink-muted group-hover:text-accent transition-colors">
                                        <File size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-ink">{file.originalFilename}</div>
                                        <div className="text-[10px] text-ink-muted flex gap-2 mt-0.5 uppercase tracking-wider">
                                            <span>{file.contentType}</span>
                                            <span>•</span>
                                            <span>{Math.round(file.fileSize / 1024)} KB</span>
                                            <span>•</span>
                                            <span className="text-accent-secondary">ID: {file.id}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleView(file.id)} 
                                        className="p-2 hover:bg-paper rounded-full text-ink-soft transition-colors" 
                                        title="미리보기"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDownload(file.id, file.originalFilename)} 
                                        className="p-2 hover:bg-paper rounded-full text-accent transition-colors" 
                                        title="다운로드"
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* 4. 로그 뷰어 (Template Response Log) */}
        <div className="flex flex-col h-full">
            <div className="bg-ink text-paper p-6 rounded-3xl flex-1 shadow-soft font-mono text-xs overflow-auto min-h-[500px]">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-ink-muted uppercase tracking-wider font-bold">Terminal Output</span>
                    </div>
                    <button onClick={() => setLog("Ready...")} className="text-ink-muted hover:text-white transition-colors">Clear</button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed">
                    {typeof log === "string" ? log : JSON.stringify(log, null, 2)}
                </pre>
            </div>
            <div className="mt-4 p-4 bg-white rounded-2xl border border-line flex items-start gap-3">
                <Info size={16} className="text-accent-secondary shrink-0 mt-0.5" />
                <p className="text-[11px] text-ink-soft leading-relaxed italic">
                    모든 파일 작업은 브라우저의 Blob URL 객체를 사용하여 보안 처리됩니다. 
                    미리보기 시 팝업 차단 설정을 확인해 주세요.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}