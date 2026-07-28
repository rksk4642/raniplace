// raniplace 인증 및 교사 승인 시스템 유틸리티

export const ADMIN_PASSWORD = 'dlswo12*';
export const AUTH_REQUESTS_KEY = 'raniplace_auth_requests';
export const ADMIN_UNLOCKED_KEY = 'raniplace_admin_unlocked';
export const TEACHER_LOGGED_IN_KEY = 'raniplace_teacher_logged_in';

export interface AuthRequest {
  id: string;
  name: string;
  school: string;
  email: string; // 아이디 또는 이메일
  password?: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface LoggedInUser {
  name: string;
  email?: string;
  isAdmin: boolean;
}

// 초기 샘플 요청 데이터 생성
const getInitialSampleRequests = (): AuthRequest[] => [
  {
    id: 'sample-1',
    name: '김서연 선생님',
    school: '서울푸른초등학교',
    email: 'sykim_teacher',
    password: 'password123!',
    message: '5학년 담임입니다. 업무 페이지 및 자료 열람 권한 승인 요청드립니다!',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'sample-2',
    name: '이준호 선생님',
    school: '경기하늘중학교',
    email: 'lee_jh',
    password: 'password123!',
    message: '교과 연구 모임 회원입니다. 잘 부탁드립니다.',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

// 인증 요청 목록 가져오기
export function getAuthRequests(): AuthRequest[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(AUTH_REQUESTS_KEY);
  if (!stored) {
    const initial = getInitialSampleRequests();
    localStorage.setItem(AUTH_REQUESTS_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse auth requests:', e);
    return [];
  }
}

// 인증 요청 목록 저장하기
export function saveAuthRequests(requests: AuthRequest[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_REQUESTS_KEY, JSON.stringify(requests));
  // 변경 사항 이벤트 전파
  window.dispatchEvent(new Event('auth_requests_updated'));
}

// 신규 인증 요청 제출
export function submitAuthRequest(data: Omit<AuthRequest, 'id' | 'status' | 'createdAt'>): AuthRequest {
  const requests = getAuthRequests();
  const newRequest: AuthRequest = {
    ...data,
    id: 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  requests.unshift(newRequest); // 최신 요청이 상단에 오도록 추가
  saveAuthRequests(requests);
  return newRequest;
}

// 인증 요청 상태 업데이트 (승인/거절)
export function updateAuthRequestStatus(id: string, status: 'approved' | 'rejected'): void {
  const requests = getAuthRequests();
  const updated = requests.map((req) => (req.id === id ? { ...req, status } : req));
  saveAuthRequests(updated);
}

// 테스트용 샘플 데이터 추가
export function addTestAuthRequest(): void {
  const sampleNames = ['박지영 선생님', '최우진 선생님', '정하늘 선생님', '강민수 선생님'];
  const sampleSchools = ['인천해돋이초등학교', '부산가람중학교', '대구다솔고등학교', '광주빛고을초등학교'];
  const idx = Math.floor(Math.random() * sampleNames.length);
  
  submitAuthRequest({
    name: sampleNames[idx],
    school: sampleSchools[idx],
    email: `teacher_${Math.floor(Math.random() * 1000)}`,
    password: 'testpassword123',
    message: '새로운 학기를 맞이하여 업무 페이지 접근을 신청합니다!',
  });
}

// 목록 초기화
export function resetAuthRequests(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_REQUESTS_KEY);
  getAuthRequests(); // 초기 샘플로 재생성
  window.dispatchEvent(new Event('auth_requests_updated'));
}

// 관리자 비밀번호 검증
export function verifyAdminPassword(password: string): boolean {
  return password.trim() === ADMIN_PASSWORD;
}

// 개인(관리자) 영역 잠금 해제 여부 확인
export function isAdminUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ADMIN_UNLOCKED_KEY) === 'true';
}

// 개인(관리자) 영역 잠금/해제 설정
export function setAdminUnlocked(unlocked: boolean): void {
  if (typeof window === 'undefined') return;
  if (unlocked) {
    localStorage.setItem(ADMIN_UNLOCKED_KEY, 'true');
    // 관리자로 로그인 상태도 동시 부여
    setLoggedInUser({ name: '관리자 (나)', isAdmin: true });
  } else {
    localStorage.removeItem(ADMIN_UNLOCKED_KEY);
    // 일반 계정이 아니면 로그아웃
    const current = getLoggedInUser();
    if (current?.isAdmin) {
      setLoggedInUser(null);
    }
  }
  window.dispatchEvent(new Event('admin_unlocked_updated'));
}

// 현재 로그인한 사용자 가져오기
export function getLoggedInUser(): LoggedInUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(TEACHER_LOGGED_IN_KEY);
  if (!stored) {
    if (isAdminUnlocked()) {
      return { name: '관리자 (나)', isAdmin: true };
    }
    return null;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// 사용자 로그인 상태 저장
export function setLoggedInUser(user: LoggedInUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(TEACHER_LOGGED_IN_KEY, JSON.stringify(user));
    if (user.isAdmin) {
      localStorage.setItem(ADMIN_UNLOCKED_KEY, 'true');
    }
  } else {
    localStorage.removeItem(TEACHER_LOGGED_IN_KEY);
  }
  window.dispatchEvent(new Event('user_login_updated'));
}

// 교사 로그인 시증 및 승인 여부 검증
export function verifyTeacherLogin(emailOrName: string, pass: string): {
  success: boolean;
  message?: string;
  user?: LoggedInUser;
} {
  const input = emailOrName.trim();
  const password = pass.trim();

  // 1. 관리자 비밀번호 직접 입력 확인
  if (verifyAdminPassword(password)) {
    const user: LoggedInUser = { name: input || '관리자 (나)', isAdmin: true };
    setLoggedInUser(user);
    setAdminUnlocked(true);
    return { success: true, user };
  }

  // 2. 인증 요청 목록(교사 DB)에서 확인
  const requests = getAuthRequests();
  const found = requests.find(
    (req) => (req.email === input || req.name === input) && req.password === password
  );

  if (!found) {
    return {
      success: false,
      message: '아이디(또는 이름)와 비밀번호가 일치하지 않습니다. 신규 선생님이시라면 [교사 인증 요청]을 먼저 진행해주세요.',
    };
  }

  if (found.status === 'pending') {
    return {
      success: false,
      message: '아직 관리자의 승인이 대기 중입니다. 관리자 승인 완료 후 이용하실 수 있습니다.',
    };
  }

  if (found.status === 'rejected') {
    return {
      success: false,
      message: '요청하신 인증이 반려되었습니다. 관리자에게 문의해주시기 바랍니다.',
    };
  }

  // 승인된 교사
  const user: LoggedInUser = { name: found.name, email: found.email, isAdmin: false };
  setLoggedInUser(user);
  return { success: true, user };
}
