// raniplace 게시판 (연구부, 교무) 데이터 관리 유틸리티 (로컬스토리지 기반)

export const BOARD_POSTS_KEY = 'raniplace_board_posts';
export const BOARD_COMMENTS_KEY = 'raniplace_board_comments';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  dataUrl: string; // base64 인코딩 데이터 또는 blob URL (미리보기를 위해 사용)
  size: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string; // 작성자 실명
  content: string;
  isSecret: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  category: 'research' | 'academic';
  title: string;
  content: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  authorName: string; // 글쓴이
}

// ---------------------------------------------------------
// 게시글(Post) 함수
// ---------------------------------------------------------

// 게시글 목록 조회
export function getPosts(category?: 'research' | 'academic'): Post[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(BOARD_POSTS_KEY);
  let posts: Post[] = [];
  if (stored) {
    try {
      posts = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse board posts:', e);
    }
  }
  
  if (category) {
    return posts.filter(p => p.category === category).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// 특정 게시글 조회
export function getPostById(id: string): Post | null {
  const posts = getPosts();
  return posts.find(p => p.id === id) || null;
}

// 새 게시글 작성
export function createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post {
  const posts = getPosts();
  const newPost: Post = {
    ...data,
    id: 'post-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  posts.unshift(newPost);
  localStorage.setItem(BOARD_POSTS_KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event('board_posts_updated'));
  return newPost;
}

// 게시글 수정
export function updatePost(id: string, data: Partial<Omit<Post, 'id' | 'createdAt' | 'authorName'>>): Post | null {
  const posts = getPosts();
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return null;
  
  const updatedPost = { ...posts[idx], ...data, updatedAt: new Date().toISOString() };
  posts[idx] = updatedPost;
  localStorage.setItem(BOARD_POSTS_KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event('board_posts_updated'));
  return updatedPost;
}

// 게시글 삭제 (게시글의 댓글도 함께 삭제)
export function deletePost(id: string): void {
  const posts = getPosts();
  const updatedPosts = posts.filter(p => p.id !== id);
  localStorage.setItem(BOARD_POSTS_KEY, JSON.stringify(updatedPosts));
  
  const comments = getAllComments();
  const updatedComments = comments.filter(c => c.postId !== id);
  localStorage.setItem(BOARD_COMMENTS_KEY, JSON.stringify(updatedComments));
  
  window.dispatchEvent(new Event('board_posts_updated'));
  window.dispatchEvent(new Event('board_comments_updated'));
}

// ---------------------------------------------------------
// 댓글(Comment) 함수
// ---------------------------------------------------------

// 전체 댓글 조회 (내부용)
function getAllComments(): Comment[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(BOARD_COMMENTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse board comments:', e);
    return [];
  }
}

// 특정 게시글의 댓글 조회
export function getCommentsByPostId(postId: string): Comment[] {
  const comments = getAllComments();
  return comments
    .filter(c => c.postId === postId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // 과거순 배열
}

// 새 댓글 작성
export function createComment(data: Omit<Comment, 'id' | 'createdAt'>): Comment {
  const comments = getAllComments();
  const newComment: Comment = {
    ...data,
    id: 'comment-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
  };
  comments.push(newComment);
  localStorage.setItem(BOARD_COMMENTS_KEY, JSON.stringify(comments));
  window.dispatchEvent(new Event('board_comments_updated'));
  return newComment;
}

// 댓글 삭제
export function deleteComment(id: string): void {
  const comments = getAllComments();
  const updated = comments.filter(c => c.id !== id);
  localStorage.setItem(BOARD_COMMENTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('board_comments_updated'));
}
