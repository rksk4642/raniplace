'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  getPosts, getPostById, createPost, deletePost, 
  getCommentsByPostId, createComment, deleteComment,
  Post, Comment, Attachment
} from '@/utils/board';
import { getLoggedInUser, LoggedInUser } from '@/utils/auth';
import { 
  FileText, MessageSquare, Paperclip, ChevronLeft, 
  Plus, Trash2, FileImage, Lock, Upload
} from 'lucide-react';

interface BoardProps {
  category: 'research' | 'academic';
  title: string;
  description: string;
}

export default function Board({ category, title, description }: BoardProps) {
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'write'>('list');
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // 글쓰기 폼
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAttachments, setNewAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 댓글 폼
  const [newComment, setNewComment] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  useEffect(() => {
    setCurrentUser(getLoggedInUser());
    loadPosts();

    const handleUpdate = () => loadPosts();
    window.addEventListener('board_posts_updated', handleUpdate);
    return () => window.removeEventListener('board_posts_updated', handleUpdate);
  }, [category]);

  const loadPosts = () => {
    setPosts(getPosts(category));
  };

  const handlePostClick = (post: Post) => {
    setCurrentPost(post);
    loadComments(post.id);
    setView('detail');
  };

  const loadComments = (postId: string) => {
    setComments(getCommentsByPostId(postId));
  };

  useEffect(() => {
    const handleUpdate = () => {
      if (currentPost) loadComments(currentPost.id);
    };
    window.addEventListener('board_comments_updated', handleUpdate);
    return () => window.removeEventListener('board_comments_updated', handleUpdate);
  }, [currentPost]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    Array.from(e.target.files).forEach(file => {
      // 파일 크기 제한 (임시로 2MB로 제한하여 localStorage 보호)
      if (file.size > 2 * 1024 * 1024) {
        alert('로컬 테스트 환경에서는 2MB 이하의 파일만 첨부 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewAttachments(prev => [...prev, {
            id: 'file-' + Date.now() + Math.random().toString(36).substring(2,5),
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: event.target!.result as string
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setNewAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    createPost({
      category,
      title: newTitle,
      content: newContent,
      attachments: newAttachments,
      authorName: currentUser?.name || '관리자(나)'
    });
    setNewTitle('');
    setNewContent('');
    setNewAttachments([]);
    setView('list');
  };

  const handleDeletePost = (id: string) => {
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      deletePost(id);
      setView('list');
    }
  };

  const handleCreateComment = () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!newComment.trim()) return;

    createComment({
      postId: currentPost!.id,
      authorName: currentUser.name,
      content: newComment,
      isSecret
    });
    setNewComment('');
    setIsSecret(false);
  };

  const handleDeleteComment = (id: string) => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      deleteComment(id);
    }
  };

  // 포맷 헬퍼
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  // --- 렌더링 영역 --- //

  if (view === 'write') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-[#5B88B2] font-bold text-sm hover:underline mb-6">
          <ChevronLeft className="w-4 h-4" /> 목록으로 돌아가기
        </button>
        <div className="bg-white rounded-3xl p-8 border border-[#B8C4A9]/30 shadow-soft">
          <h2 className="text-2xl font-black text-[#2C3E35] mb-6">새 글 작성</h2>
          <div className="space-y-4">
            <input 
              type="text" placeholder="게시글 제목" 
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#F8FAF9] border border-[#B8C4A9]/40 focus:border-[#5B88B2] outline-none text-[#2C3E35] font-bold"
            />
            <textarea 
              placeholder="내용을 입력하세요..." rows={10}
              value={newContent} onChange={e => setNewContent(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#F8FAF9] border border-[#B8C4A9]/40 focus:border-[#5B88B2] outline-none text-[#2C3E35] resize-none"
            />
            
            <div className="p-4 rounded-2xl border border-[#B8C4A9]/40 bg-[#F8FAF9]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-[#2C3E35]">첨부파일 (최대 2MB 제한)</span>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#5B88B2] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" /> 파일 선택
                </button>
                <input 
                  type="file" ref={fileInputRef} className="hidden" multiple
                  onChange={handleFileChange}
                />
              </div>
              {newAttachments.length > 0 && (
                <ul className="space-y-2">
                  {newAttachments.map(file => (
                    <li key={file.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#B8C4A9]/20 text-xs">
                      <div className="flex items-center gap-2">
                        {file.type.includes('image') ? <FileImage className="w-4 h-4 text-amber-500" /> : <FileIcon className="w-4 h-4 text-[#5B88B2]" />}
                        <span className="font-medium text-[#2C3E35] truncate max-w-[200px]">{file.name}</span>
                        <span className="text-gray-400">({(file.size / 1024).toFixed(1)}KB)</span>
                      </div>
                      <button onClick={() => removeAttachment(file.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button onClick={() => setView('list')} className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-500">취소</button>
              <button onClick={handleCreatePost} className="px-6 py-3 rounded-xl font-bold text-sm bg-[#2C3E35] text-white">등록하기</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'detail' && currentPost) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-[#5B88B2] font-bold text-sm hover:underline mb-6">
          <ChevronLeft className="w-4 h-4" /> 목록으로 돌아가기
        </button>

        <div className="bg-white rounded-3xl p-8 border border-[#B8C4A9]/30 shadow-soft mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-[#2C3E35] mb-2">{currentPost.title}</h1>
              <div className="text-xs font-medium text-[#2C3E35]/60 flex items-center gap-3">
                <span>{currentPost.authorName}</span>
                <span>{formatDate(currentPost.createdAt)}</span>
              </div>
            </div>
            {currentUser?.isAdmin && (
              <button onClick={() => handleDeletePost(currentPost.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="prose prose-sm max-w-none text-[#2C3E35] mb-8 whitespace-pre-wrap">
            {currentPost.content}
          </div>

          {currentPost.attachments.length > 0 && (
            <div className="border-t border-[#B8C4A9]/20 pt-6">
              <h3 className="text-sm font-bold text-[#2C3E35] mb-4 flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> 첨부파일
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentPost.attachments.map(file => (
                  <div key={file.id} className="p-3 rounded-2xl border border-[#B8C4A9]/30 bg-[#F8FAF9] flex flex-col gap-2">
                    <a href={file.dataUrl} download={file.name} className="flex items-center gap-2 text-sm font-bold text-[#5B88B2] hover:underline">
                      {file.type.includes('image') ? <FileImage className="w-4 h-4" /> : <FileIcon className="w-4 h-4" />}
                      <span className="truncate">{file.name}</span>
                    </a>
                    {file.type.includes('image') && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-[#B8C4A9]/20">
                        <img src={file.dataUrl} alt={file.name} className="w-full h-auto object-cover max-h-40" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-3xl p-8 border border-[#B8C4A9]/30 shadow-soft">
          <h3 className="text-lg font-bold text-[#2C3E35] mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> 댓글 ({comments.length})
          </h3>

          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <p className="text-xs text-[#2C3E35]/50 text-center py-4">등록된 댓글이 없습니다.</p>
            ) : (
              comments.map(comment => {
                const isAuthorOrAdmin = currentUser?.isAdmin || (currentUser && currentUser.name === comment.authorName);
                const canSee = !comment.isSecret || isAuthorOrAdmin;

                return (
                  <div key={comment.id} className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#B8C4A9]/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2C3E35]">{comment.authorName}</span>
                        {comment.isSecret && <Lock className="w-3 h-3 text-amber-500" />}
                        <span className="text-[10px] text-[#2C3E35]/40">{formatDate(comment.createdAt)}</span>
                      </div>
                      {(currentUser?.isAdmin || (currentUser && currentUser.name === comment.authorName)) && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {canSee ? (
                      <p className="text-sm text-[#2C3E35]/80 whitespace-pre-wrap">{comment.content}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">비밀글입니다.</p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 댓글 작성 폼 */}
          {currentUser ? (
            <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-[#B8C4A9]/40">
              <textarea 
                placeholder="댓글을 남겨주세요..." rows={3}
                value={newComment} onChange={e => setNewComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#B8C4A9]/20 focus:border-[#5B88B2] outline-none text-sm text-[#2C3E35] resize-none mb-3"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-[#2C3E35]/70 cursor-pointer">
                  <input type="checkbox" checked={isSecret} onChange={e => setIsSecret(e.target.checked)} className="accent-[#5B88B2]" />
                  비밀글
                </label>
                <button onClick={handleCreateComment} className="px-5 py-2 rounded-xl bg-[#5B88B2] hover:bg-[#4A7397] text-white text-xs font-bold transition-colors">
                  댓글 등록
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 font-bold border border-gray-200">
              인증된 선생님만 댓글을 작성할 수 있습니다. (업무 탭 초기 화면에서 로그인 가능)
            </div>
          )}
        </div>
      </div>
    );
  }

  // 목록 뷰
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#2C3E35] mb-2">{title}</h1>
          <p className="text-sm font-medium text-[#2C3E35]/60">{description}</p>
        </div>
        {currentUser?.isAdmin && (
          <button 
            onClick={() => setView('write')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2C3E35] hover:bg-[#1A251F] text-white font-bold text-sm transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" /> 글쓰기
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <div 
            key={post.id} onClick={() => handlePostClick(post)}
            className="group bg-white rounded-3xl p-6 border border-[#B8C4A9]/30 shadow-sm hover:shadow-lg hover:border-[#5B88B2]/40 transition-all cursor-pointer flex flex-col h-[200px]"
          >
            <div className="flex-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5B88B2]/10 to-[#A0C4E2]/10 text-[#5B88B2] flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2C3E35] mb-2 line-clamp-1 group-hover:text-[#5B88B2] transition-colors">
                {post.title}
              </h3>
              <p className="text-xs text-[#2C3E35]/60 line-clamp-2 leading-relaxed">
                {post.content}
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#B8C4A9]/10 flex items-center justify-between text-[10px] font-bold text-[#2C3E35]/40">
              <span>{formatDate(post.createdAt)}</span>
              <div className="flex items-center gap-3">
                {post.attachments.length > 0 && (
                  <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> {post.attachments.length}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-[#B8C4A9]/50">
            <div className="w-16 h-16 mx-auto bg-[#F8FAF9] rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[#2C3E35]/20" />
            </div>
            <p className="text-sm font-bold text-[#2C3E35]/40">아직 등록된 게시글이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
