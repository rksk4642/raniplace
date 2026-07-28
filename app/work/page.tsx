'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, ShieldCheck, KeyRound, UserPlus, LogIn, CheckCircle2, 
  AlertCircle, ArrowLeft, ArrowRight, LogOut, FileText, CheckSquare, 
  PhoneCall, ExternalLink, Sparkles, Building2, Mail, MessageSquare, Lock 
} from 'lucide-react';
import { 
  getLoggedInUser, 
  setLoggedInUser, 
  verifyTeacherLogin, 
  submitAuthRequest, 
  getAuthRequests, 
  LoggedInUser 
} from '@/utils/auth';

export default function WorkPage() {
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // 로그인 폼 상태
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // 인증 요청 폼 상태
  const [reqName, setReqName] = useState('');
  const [reqSchool, setReqSchool] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPass, setReqPass] = useState('');
  const [reqMsg, setReqMsg] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [reqError, setReqError] = useState('');

  // 관리자 대기 요청 카운트
  const [pendingCount, setPendingCount] = useState(0);

  // 체크리스트 (업무 도구 시연용)
  const [todos, setTodos] = useState([
    { id: 1, text: '주간 행정 공문 열람 및 기안 완료하기', done: true },
    { id: 2, text: '학부모 안내장 가정통신문 검토 및 발송', done: false },
    { id: 3, text: '나이스(NEIS) 출결 마무리 및 확인', done: false },
    { id: 4, text: '다음 주 교과 연구회 제출 자료 준비', done: false },
  ]);

  useEffect(() => {
    const updateState = () => {
      const user = getLoggedInUser();
      setCurrentUser(user);
      const reqs = getAuthRequests();
      setPendingCount(reqs.filter((r) => r.status === 'pending').length);
    };

    updateState();
    window.addEventListener('user_login_updated', updateState);
    window.addEventListener('auth_requests_updated', updateState);
    window.addEventListener('admin_unlocked_updated', updateState);

    return () => {
      window.removeEventListener('user_login_updated', updateState);
      window.removeEventListener('auth_requests_updated', updateState);
      window.removeEventListener('admin_unlocked_updated', updateState);
    };
  }, []);

  // 로그인 처리
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginPass) {
      setLoginError('비밀번호를 입력해주세요.');
      return;
    }
    const res = verifyTeacherLogin(loginId, loginPass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    } else {
      setLoginError(res.message || '인증에 실패했습니다.');
    }
  };

  // 인증 요청 처리
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReqError('');

    if (!reqName.trim() || !reqSchool.trim() || !reqEmail.trim() || !reqPass.trim()) {
      setReqError('이름, 학교, 아이디, 비밀번호는 필수 입력 항목입니다.');
      return;
    }

    submitAuthRequest({
      name: reqName.trim(),
      school: reqSchool.trim(),
      email: reqEmail.trim(),
      password: reqPass.trim(),
      message: reqMsg.trim() || '업무 페이지 열람 권한 승인을 부탁드립니다.',
    });

    setRegisterSuccess(true);
  };

  // 로그아웃
  const handleLogout = () => {
    setLoggedInUser(null);
  };

  // 투두 토글
  const toggleTodo = (id: number) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  // -------------------------------------------------------------
  // 1. 비인증 상태: 교사 로그인 / 인증 요청 포털
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] text-[#2C3E35] p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
        {/* 장식 배경 */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[450px] bg-gradient-to-r from-[#A0C4E2]/25 via-[#B8C4A9]/20 to-[#5B88B2]/15 blur-3xl -z-10 rounded-full" />
        
        <div className="max-w-md w-full">
          <Link href="/" className="inline-flex items-center gap-2 text-[#5B88B2] hover:underline font-bold text-sm mb-6 transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span>메인 내비게이션으로 돌아가기</span>
          </Link>

          <div className="bg-white rounded-3xl shadow-[0_16px_50px_rgba(44,62,53,0.1)] border border-[#B8C4A9]/30 overflow-hidden">
            
            {/* 상단 타이틀 헤더 */}
            <div className="bg-[#2C3E35] p-8 text-white text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-white/10 mx-auto flex items-center justify-center mb-4 shadow-inner">
                <Briefcase className="w-7 h-7 text-[#A0C4E2]" />
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-2">
                업무 페이지 교사 인증
              </h1>
              <p className="text-xs text-white/80 leading-relaxed max-w-xs mx-auto">
                본 페이지는 교사 인증이 완료된 분만 열람 가능합니다.<br />
                로그인하시거나 신규 교사 인증을 요청해주세요.
              </p>
            </div>

            {/* 탭 버튼 */}
            <div className="flex border-b border-[#B8C4A9]/20 bg-[#F8FAF9]">
              <button
                onClick={() => { setActiveTab('login'); setRegisterSuccess(false); }}
                className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-[#2C3E35] border-b-2 border-[#5B88B2] shadow-sm'
                    : 'text-[#2C3E35]/50 hover:text-[#2C3E35]'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>교사 로그인 / 입장</span>
              </button>
              <button
                onClick={() => { setActiveTab('register'); setRegisterSuccess(false); }}
                className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'register'
                    ? 'bg-white text-[#6E815C] border-b-2 border-[#6E815C] shadow-sm'
                    : 'text-[#2C3E35]/50 hover:text-[#2C3E35]'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>신규 인증 요청</span>
              </button>
            </div>

            {/* 탭 1: 교사 로그인 / 비밀번호 직접 입력 */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#2C3E35]/80 uppercase tracking-wider mb-2">
                    아이디 (또는 교사 이름)
                  </label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="예: sykim_teacher (관리자는 비워도 무방)"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F8FAF9] border border-[#B8C4A9]/40 focus:border-[#5B88B2] focus:bg-white outline-none transition-all text-sm font-medium text-[#2C3E35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3E35]/80 uppercase tracking-wider mb-2 flex justify-between">
                    <span>비밀번호</span>
                    <span className="text-[11px] text-[#5B88B2] font-normal">관리자 비밀번호(dlswo12*) 호환</span>
                  </label>
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F8FAF9] border border-[#B8C4A9]/40 focus:border-[#5B88B2] focus:bg-white outline-none transition-all text-sm font-medium text-[#2C3E35]"
                  />
                </div>

                {loginError && (
                  <div className="flex items-start gap-2.5 text-xs font-bold text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-[#2C3E35] hover:bg-[#3A5246] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>업무 페이지 입장하기</span>
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-[#2C3E35]/60">
                    아직 승인받은 계정이 없으신가요?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-[#6E815C] font-bold hover:underline"
                    >
                      교사 인증 요청하기 &rarr;
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* 탭 2: 신규 교사 인증 요청 폼 */}
            {activeTab === 'register' && (
              <div className="p-8">
                {registerSuccess ? (
                  <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-[#6E815C]/20 text-[#6E815C] flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#2C3E35]">인증 요청 제출 완료!</h3>
                    <p className="text-xs text-[#2C3E35]/70 leading-relaxed max-w-xs mx-auto">
                      선생님의 인증 요청이 관리자에게 전송되었습니다.<br />
                      관리자(<code className="font-mono bg-[#F8FAF9] px-1 rounded">3. 개인</code> 영역)의 확인 및 승인 이후, 설정하신 아이디와 비밀번호로 로그인하실 수 있습니다.
                    </p>
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="w-full py-3.5 bg-[#2C3E35] text-white rounded-2xl font-bold text-sm shadow-md hover:bg-[#3A5246] transition-all"
                      >
                        로그인 화면으로 이동
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#2C3E35]/80 uppercase mb-1">이름 (직함)</label>
                        <input
                          type="text"
                          value={reqName}
                          onChange={(e) => setReqName(e.target.value)}
                          placeholder="홍길동 선생님"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/40 text-xs font-medium focus:bg-white focus:border-[#6E815C] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#2C3E35]/80 uppercase mb-1">소속 학교</label>
                        <input
                          type="text"
                          value={reqSchool}
                          onChange={(e) => setReqSchool(e.target.value)}
                          placeholder="서울푸른초등학교"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/40 text-xs font-medium focus:bg-white focus:border-[#6E815C] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#2C3E35]/80 uppercase mb-1">아이디 (또는 이메일)</label>
                        <input
                          type="text"
                          value={reqEmail}
                          onChange={(e) => setReqEmail(e.target.value)}
                          placeholder="hong_teacher"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/40 text-xs font-medium focus:bg-white focus:border-[#6E815C] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#2C3E35]/80 uppercase mb-1">사용할 비밀번호</label>
                        <input
                          type="password"
                          value={reqPass}
                          onChange={(e) => setReqPass(e.target.value)}
                          placeholder="비밀번호 설정"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/40 text-xs font-medium focus:bg-white focus:border-[#6E815C] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#2C3E35]/80 uppercase mb-1">요청 메시지 (선택)</label>
                      <textarea
                        value={reqMsg}
                        onChange={(e) => setReqMsg(e.target.value)}
                        placeholder="예: 6학년 담임입니다. 행정 공문 및 주간 일지 확인을 위해 업무 페이지 사용 승인 요청합니다."
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/40 text-xs font-medium focus:bg-white focus:border-[#6E815C] outline-none resize-none"
                      />
                    </div>

                    {reqError && (
                      <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                        {reqError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-4 bg-[#6E815C] hover:bg-[#59694A] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>교사 인증 요청 제출하기</span>
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. 인증 완료 상태: 행정 업무 지원 대시보드
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#2C3E35] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 상단 네비게이션 및 로그인 상태 바 */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#B8C4A9]/20 shadow-soft">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-[#5B88B2] font-bold text-xs mb-2 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>메인 내비게이션으로 돌아가기</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-[#2C3E35] flex items-center gap-3 tracking-tight">
              <Briefcase className="w-8 h-8 text-[#5B88B2]" />
              교사 행정 업무 지원 공간
            </h1>
            <p className="text-xs md:text-sm text-[#2C3E35]/60 mt-1 font-medium">
              교사 인증이 완료된 선생님을 위한 행정 공문 가이드, 주간 업무 일지 및 교육청 연락망입니다.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F8FAF9] border border-[#B8C4A9]/30">
              <div className="w-7 h-7 rounded-full bg-[#5B88B2]/20 text-[#5B88B2] flex items-center justify-center font-bold text-xs">
                {currentUser.isAdmin ? '👑' : '👩‍🏫'}
              </div>
              <div>
                <div className="text-xs font-bold text-[#2C3E35]">{currentUser.name}</div>
                <div className="text-[10px] text-[#6E815C] font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> 인증 완료
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </header>

        {/* 관리자(나) 전용 교사 인증 승인 관리 배너 */}
        {currentUser.isAdmin && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#2C3E35] to-[#3A5246] text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg">
                🛡️
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-2">
                  관리자 권한 활성화
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                      신규 요청 {pendingCount}건 대기
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/75 mt-0.5">
                  선생님들이 신청한 업무 페이지 권한 요청을 확인하고 승인하거나 거절할 수 있습니다.
                </div>
              </div>
            </div>
            <Link
              href="/admin/approvals"
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-[#2C3E35] font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center"
            >
              <span>교사 인증 승인 관리</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 메인 콘텐츠 그리드 (3대 행정 업무 도구 모음) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. 공문서 작성 및 요약 가이드 */}
          <div className="bg-white rounded-3xl p-6 border border-[#B8C4A9]/30 shadow-soft flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#5B88B2]/10 text-[#5B88B2] flex items-center justify-center mb-4 font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2C3E35] mb-2">공문서 작성 기안 가이드</h3>
              <p className="text-xs text-[#2C3E35]/70 leading-relaxed mb-4">
                기안문 작성 시 필수 필수 항목(제목, 목적, 계획, 예산) 작성 요령과 자주 쓰는 공문구 표준 템플릿입니다.
              </p>
              <div className="space-y-2 bg-[#F8FAF9] p-3.5 rounded-2xl border border-[#B8C4A9]/20 text-xs text-[#2C3E35]/80 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B88B2]" />
                  <span>문서 제목은 명확하고 직관적인 구와 절로 작성</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B88B2]" />
                  <span>붙임 자료는 파일명과 부수를 본문 하단에 명시</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B88B2]" />
                  <span>개인정보 포함 문서 기안 시 부분공개 설정 필수</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert("표준 기안문 양식이 클립보드에 복사되었습니다.")}
              className="mt-6 w-full py-3 rounded-xl bg-[#5B88B2]/10 hover:bg-[#5B88B2] text-[#5B88B2] hover:text-white font-bold text-xs transition-colors"
            >
              표준 공문 템플릿 복사
            </button>
          </div>

          {/* 2. 주간 행정 업무 체크리스트 */}
          <div className="bg-white rounded-3xl p-6 border border-[#B8C4A9]/30 shadow-soft flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#6E815C]/10 text-[#6E815C] flex items-center justify-center mb-4 font-bold">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-[#2C3E35]">주간 행정 체크리스트</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#6E815C]/10 text-[#6E815C]">
                  {todos.filter(t => t.done).length}/{todos.length} 완료
                </span>
              </div>
              <p className="text-xs text-[#2C3E35]/70 leading-relaxed mb-4">
                이번 주 처리해야 할 학교 교무 및 학급 행정 일정입니다. 클릭하여 완료 처리하세요.
              </p>
              
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => toggleTodo(todo.id)}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      todo.done 
                        ? 'bg-[#F8FAF9] border-transparent text-[#2C3E35]/40 line-through' 
                        : 'bg-white border-[#B8C4A9]/30 text-[#2C3E35] font-semibold hover:border-[#6E815C]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-white transition-colors ${
                      todo.done ? 'bg-[#6E815C] border-[#6E815C]' : 'border-[#B8C4A9]'
                    }`}>
                      {todo.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs flex-1">{todo.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const text = prompt("새로운 업무 항목을 입력하세요:");
                if (text?.trim()) {
                  setTodos([...todos, { id: Date.now(), text: text.trim(), done: false }]);
                }
              }}
              className="mt-6 w-full py-3 rounded-xl bg-[#6E815C]/10 hover:bg-[#6E815C] text-[#6E815C] hover:text-white font-bold text-xs transition-colors"
            >
              + 항목 추가하기
            </button>
          </div>

          {/* 3. 학교 부서 및 비상 연락망 */}
          <div className="bg-white rounded-3xl p-6 border border-[#B8C4A9]/30 shadow-soft flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 font-bold">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2C3E35] mb-2">교무 행정 연락망 안내</h3>
              <p className="text-xs text-[#2C3E35]/70 leading-relaxed mb-4">
                교내 주요 부서 내선번호 및 교육지원청 행정 담당 부서 신속 연락처입니다.
              </p>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/20 text-xs">
                  <span className="font-bold text-[#2C3E35]">교무기획부 (교무실)</span>
                  <span className="font-mono text-[#5B88B2] font-bold">내선 101</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/20 text-xs">
                  <span className="font-bold text-[#2C3E35]">학생생활안전부</span>
                  <span className="font-mono text-[#5B88B2] font-bold">내선 105</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/20 text-xs">
                  <span className="font-bold text-[#2C3E35]">행정실 (예산/회계)</span>
                  <span className="font-mono text-[#5B88B2] font-bold">내선 201</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/20 text-xs">
                  <span className="font-bold text-[#2C3E35]">전산정보 지원팀</span>
                  <span className="font-mono text-[#5B88B2] font-bold">내선 301</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert("비상연락망 전체 인쇄 양식이 다운로드되었습니다.")}
              className="mt-6 w-full py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white font-bold text-xs transition-colors"
            >
              전체 연락망 PDF 인쇄
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
