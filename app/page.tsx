'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calculator, Briefcase, BookOpen, Lock, Unlock, 
  Calendar as CalendarIcon, ShieldCheck, LogOut, ChevronRight, 
  ChevronDown, CheckCircle2, AlertCircle, ArrowRight, Sparkles, 
  Menu, X, KeyRound
} from 'lucide-react';
import { 
  isAdminUnlocked as checkAdminUnlocked, 
  setAdminUnlocked, 
  verifyAdminPassword, 
  getAuthRequests,
  getLoggedInUser,
  LoggedInUser
} from '@/utils/auth';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlockedState] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);

  // 초기 상태 및 이벤트 핸들러 등록
  useEffect(() => {
    const updateState = () => {
      setIsAdminUnlockedState(checkAdminUnlocked());
      setCurrentUser(getLoggedInUser());
      const requests = getAuthRequests();
      setPendingCount(requests.filter((r) => r.status === 'pending').length);
    };

    updateState();
    window.addEventListener('admin_unlocked_updated', updateState);
    window.addEventListener('auth_requests_updated', updateState);
    window.addEventListener('user_login_updated', updateState);

    return () => {
      window.removeEventListener('admin_unlocked_updated', updateState);
      window.removeEventListener('auth_requests_updated', updateState);
      window.removeEventListener('user_login_updated', updateState);
    };
  }, []);

  // 비밀번호 제출 핸들러
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setAdminUnlocked(true);
      setIsPasswordModalOpen(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('비밀번호가 일치하지 않습니다. 다시 입력해주세요.');
    }
  };

  // 잠금 (로그아웃) 핸들러
  const handleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdminUnlocked(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAF9] text-[#2C3E35]">
      
      {/* 모바일 상단 헤더 */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#B8C4A9]/20 sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-lg text-[#2C3E35]">
          <Calculator className="w-6 h-6 text-[#6E815C]" />
          <span>raniplace</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-[#2C3E35] hover:bg-[#F8FAF9] rounded-xl transition-colors"
          aria-label="메뉴 열기"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* 모바일 오버레이 배경 */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-[#2C3E35]/30 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 좌측 사이드바 내비게이션 (첫페이지 왼쪽 항목 분류) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 bg-white border-r border-[#B8C4A9]/20 flex flex-col
        transition-transform duration-300 ease-out shadow-lg md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* 사이드바 상단 로고 */}
        <div className="p-6 border-b border-[#B8C4A9]/20 hidden md:flex flex-col gap-1">
          <div className="flex items-center gap-2.5 font-bold text-2xl tracking-tight text-[#2C3E35]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6E815C] to-[#2C3E35] flex items-center justify-center text-white shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <span>raniplace</span>
          </div>
          <span className="text-xs font-medium text-[#5B88B2] pl-1 tracking-wide">
            수학교사를 위한 스마트 업무 플랫폼
          </span>
        </div>

        {/* 내비게이션 메뉴 목록 */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold text-[#2C3E35]/40 uppercase tracking-wider">
            메인 내비게이션
          </div>

          {/* 1. 업무 */}
          <div className="flex flex-col gap-1">
            <Link 
              href="/work"
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9]/80 hover:bg-[#5B88B2]/10 border border-transparent hover:border-[#5B88B2]/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-soft flex items-center justify-center text-[#5B88B2] group-hover:scale-105 transition-transform duration-200">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#2C3E35] group-hover:text-[#5B88B2] transition-colors flex items-center gap-1.5">
                    1. 업무
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#5B88B2]/10 text-[#5B88B2]">
                      인증필요
                    </span>
                  </div>
                  <div className="text-xs text-[#2C3E35]/60 mt-0.5">
                    행정 공문 및 주간 업무
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#2C3E35]/40 transition-all" />
            </Link>

            {/* 1. 업무 - 하위 메뉴 */}
            <div className="ml-12 pl-3 border-l-2 border-[#B8C4A9]/20 flex flex-col gap-1 py-1">
              <Link 
                href="/work/research" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-bold text-[#2C3E35]/70 hover:text-[#5B88B2] px-3 py-2 rounded-xl hover:bg-[#5B88B2]/5 transition-colors flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#B8C4A9]" />
                연구부
              </Link>
              <Link 
                href="/work/academic" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-bold text-[#2C3E35]/70 hover:text-[#5B88B2] px-3 py-2 rounded-xl hover:bg-[#5B88B2]/5 transition-colors flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#B8C4A9]" />
                교무(수업계)
              </Link>
            </div>
          </div>

          {/* 2. 수업 */}
          <div className="flex flex-col gap-1">
            <Link 
              href="/class/tools"
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9]/80 hover:bg-[#6E815C]/10 border border-transparent hover:border-[#6E815C]/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-soft flex items-center justify-center text-[#6E815C] group-hover:scale-105 transition-transform duration-200">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#2C3E35] group-hover:text-[#6E815C] transition-colors">
                    2. 수업
                  </div>
                  <div className="text-xs text-[#2C3E35]/60 mt-0.5">
                    도구 모음 및 유용한 링크
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#2C3E35]/40 transition-all" />
            </Link>

            {/* 2. 수업 - 하위 메뉴 */}
            <div className="ml-12 pl-3 border-l-2 border-[#B8C4A9]/20 flex flex-col gap-1 py-1">
              <Link 
                href="/class/math" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-bold text-[#2C3E35]/70 hover:text-[#6E815C] px-3 py-2 rounded-xl hover:bg-[#6E815C]/5 transition-colors flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#B8C4A9]" />
                직무수학
              </Link>
              <Link 
                href="/class/tools" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-bold text-[#2C3E35]/70 hover:text-[#6E815C] px-3 py-2 rounded-xl hover:bg-[#6E815C]/5 transition-colors flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#B8C4A9]" />
                수업 도구모음
              </Link>
              <Link 
                href="/class/links" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-bold text-[#2C3E35]/70 hover:text-[#6E815C] px-3 py-2 rounded-xl hover:bg-[#6E815C]/5 transition-colors flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#B8C4A9]" />
                사이트 링크
              </Link>
            </div>
          </div>

          {/* 3. 개인 (비밀번호 설정 및 하위 메뉴) */}
          <div className="pt-2">
            <div 
              onClick={() => {
                if (!isAdminUnlocked) {
                  setIsPasswordModalOpen(true);
                  setPasswordError('');
                }
              }}
              className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                isAdminUnlocked 
                  ? 'bg-gradient-to-r from-[#2C3E35] to-[#3A5246] text-white border-[#2C3E35] shadow-md' 
                  : 'bg-[#F8FAF9]/80 hover:bg-[#2C3E35]/5 border-transparent hover:border-[#2C3E35]/20 text-[#2C3E35]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 ${
                  isAdminUnlocked 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white shadow-soft text-[#2C3E35]/70 group-hover:text-[#2C3E35]'
                }`}>
                  {isAdminUnlocked ? <Unlock className="w-5 h-5 text-amber-300 animate-pulse" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    3. 개인
                    {!isAdminUnlocked ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#2C3E35]/10 text-[#2C3E35]/70">
                        🔒 비공개
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-300/20 text-amber-300">
                        🔓 해제됨
                      </span>
                    )}
                  </div>
                  <div className={`text-xs mt-0.5 ${isAdminUnlocked ? 'text-white/80' : 'text-[#2C3E35]/60'}`}>
                    {isAdminUnlocked ? '나만의 프라이빗 공간' : '비밀번호 입력 시 열림'}
                  </div>
                </div>
              </div>

              {isAdminUnlocked ? (
                <button 
                  onClick={handleLock}
                  title="잠그기"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <KeyRound className="w-4 h-4 text-[#2C3E35]/40 group-hover:text-[#2C3E35] transition-colors" />
              )}
            </div>

            {/* 3. 개인 하위 메뉴 (비밀번호 인증 성공 시에만 표시) */}
            {isAdminUnlocked && (
              <div className="mt-2 ml-4 pl-3 border-l-2 border-[#5B88B2]/40 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                
                {/* 하위 1: 나만의 업무 달력 */}
                <Link
                  href="/calendar"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#5B88B2]/10 border border-[#B8C4A9]/30 shadow-sm transition-all group/sub"
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarIcon className="w-4 h-4 text-[#5B88B2] group-hover/sub:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-[#2C3E35] group-hover/sub:text-[#5B88B2]">
                      나만의 업무 달력
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#5B88B2]/10 text-[#5B88B2]">
                    프라이빗
                  </span>
                </Link>

                {/* 하위 2: 교사 인증 승인 관리 */}
                <Link
                  href="/admin/approvals"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#6E815C]/10 border border-[#B8C4A9]/30 shadow-sm transition-all group/sub"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#6E815C] group-hover/sub:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-[#2C3E35] group-hover/sub:text-[#6E815C]">
                      교사 인증 승인 관리
                    </span>
                  </div>
                  {pendingCount > 0 ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-red-500 text-white animate-bounce">
                      {pendingCount}건 대기
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F8FAF9] text-[#2C3E35]/60">
                      승인관리
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* 사이드바 하단 프로필 상태 바 */}
        <div className="p-4 border-t border-[#B8C4A9]/20 bg-[#F8FAF9]/50">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#B8C4A9]/30 shadow-soft">
            <div className="w-9 h-9 rounded-full bg-[#5B88B2]/20 flex items-center justify-center text-[#5B88B2] font-bold text-sm">
              {currentUser ? (currentUser.isAdmin ? '👑' : '👩‍🏫') : '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#2C3E35] truncate">
                {currentUser ? currentUser.name : '손님 (미인증)'}
              </div>
              <div className="text-[11px] text-[#2C3E35]/60 flex items-center gap-1">
                {currentUser ? (
                  <span className="text-[#6E815C] font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> 인증 완료
                  </span>
                ) : (
                  <span>업무 페이지 인증 필요</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 메인 화면 영역 (Hero & Category Cards) */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto relative">
        {/* 부드러운 장식 그라데이션 배경 */}
        <div className="absolute top-0 right-0 w-full max-w-3xl h-[450px] bg-gradient-to-bl from-[#A0C4E2]/20 via-[#B8C4A9]/10 to-transparent blur-3xl -z-10 pointer-events-none" />
        
        {/* 콘텐츠 헤더 배너 */}
        <div className="p-6 md:p-12 pb-6 max-w-5xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#B8C4A9]/40 shadow-soft text-xs font-bold text-[#5B88B2] mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>선생님들을 위한 평온한 교육 플랫폼</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#2C3E35] leading-tight mb-4">
            업무, 수업 관련 <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B88B2] to-[#6E815C]">
              이모저모를 한곳에
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-[#2C3E35]/70 max-w-2xl leading-relaxed font-medium">
            좌측 내비게이션 메뉴를 통해 체계적으로 나누어진 <strong>업무</strong>, <strong>수업</strong>, 그리고 나만의 프라이빗 <strong>개인</strong> 공간에 접근해보세요.
          </p>

          {/* 관리자 승인 대기 알림 배너 (관리자 모드 시) */}
          {isAdminUnlocked && pendingCount > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
                  🔔
                </div>
                <div>
                  <div className="font-bold text-sm text-[#2C3E35]">
                    신규 교사 인증 요청이 <span className="text-red-600 font-extrabold">{pendingCount}건</span> 대기 중입니다.
                  </div>
                  <div className="text-xs text-[#2C3E35]/70">
                    선생님의 승인을 기다리고 있습니다. 승인 관리 페이지에서 확인해주세요.
                  </div>
                </div>
              </div>
              <Link
                href="/admin/approvals"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-soft transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <span>승인 관리 바로가기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* 3대 핵심 카테고리 카드 섹션 */}
        <div className="p-6 md:p-12 pt-0 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 카드 1: 업무 */}
          <div className="group relative bg-white rounded-3xl p-7 border border-[#B8C4A9]/30 shadow-soft hover:shadow-[0_12px_40px_rgba(91,136,178,0.15)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#5B88B2]/10 text-[#5B88B2] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-[#2C3E35]">1. 업무 공간</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#5B88B2]/10 text-[#5B88B2]">
                  인증 보호
                </span>
              </div>
              <p className="text-sm text-[#2C3E35]/70 leading-relaxed font-medium">
                학교 행정 공문 안내, 학사 일정 체크리스트, 주간 업무 일지 등 교사 인증이 완료된 분만 열람 가능한 전용 페이지입니다.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#B8C4A9]/20 flex items-center justify-between">
              <span className="text-xs font-bold text-[#5B88B2]">인증 요청 및 입장</span>
              <Link 
                href="/work" 
                className="w-8 h-8 rounded-full bg-[#F8FAF9] group-hover:bg-[#5B88B2] text-[#2C3E35] group-hover:text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 카드 2: 수업 */}
          <div className="group relative bg-white rounded-3xl p-7 border border-[#B8C4A9]/30 shadow-soft hover:shadow-[0_12px_40px_rgba(110,129,92,0.15)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#6E815C]/10 text-[#6E815C] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-[#2C3E35]">2. 수업 도구</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#6E815C]/10 text-[#6E815C]">
                  자유 이용
                </span>
              </div>
              <p className="text-sm text-[#2C3E35]/70 leading-relaxed font-medium">
                수업 타이머, 학생 랜덤 뽑기, 모둠 구성기 및 교과 수업 참고 자료 등 수업 현장에서 바로 활용할 수 있는 유익한 도구 모음입니다.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#B8C4A9]/20 flex items-center justify-between">
              <span className="text-xs font-bold text-[#6E815C]">수업 도구 살펴보기</span>
              <Link 
                href="/class" 
                className="w-8 h-8 rounded-full bg-[#F8FAF9] group-hover:bg-[#6E815C] text-[#2C3E35] group-hover:text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 카드 3: 개인 (비밀번호 보호) */}
          <div className={`group relative rounded-3xl p-7 border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${
            isAdminUnlocked 
              ? 'bg-gradient-to-br from-[#2C3E35] to-[#3A5246] text-white border-[#2C3E35] shadow-lg' 
              : 'bg-white border-[#B8C4A9]/30 shadow-soft hover:shadow-[0_12px_40px_rgba(44,62,53,0.15)]'
          }`}>
            <div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${
                isAdminUnlocked ? 'bg-white/20 text-white' : 'bg-[#2C3E35]/10 text-[#2C3E35]'
              }`}>
                {isAdminUnlocked ? <Unlock className="w-6 h-6 text-amber-300" /> : <Lock className="w-6 h-6" />}
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-xl font-bold ${isAdminUnlocked ? 'text-white' : 'text-[#2C3E35]'}`}>
                  3. 개인 공간
                </h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  isAdminUnlocked ? 'bg-amber-300/20 text-amber-300' : 'bg-red-500/10 text-red-600'
                }`}>
                  {isAdminUnlocked ? '🔓 접근 허용' : '🔒 비밀번호 보호'}
                </span>
              </div>

              <p className={`text-sm leading-relaxed font-medium ${isAdminUnlocked ? 'text-white/80' : 'text-[#2C3E35]/70'}`}>
                {isAdminUnlocked 
                  ? '현재 나만의 프라이빗 공간이 열려 있습니다. 하위 메뉴인 [나만의 업무 달력]과 [교사 인증 승인 관리]를 자유롭게 이용하세요.' 
                  : '다른 사람에게는 보이지 않는 선생님만의 비밀 공간입니다. 비밀번호를 입력해야 하위 업무 달력에 입장할 수 있습니다.'}
              </p>
            </div>

            <div className={`mt-8 pt-4 border-t flex items-center justify-between ${
              isAdminUnlocked ? 'border-white/20' : 'border-[#B8C4A9]/20'
            }`}>
              {isAdminUnlocked ? (
                <>
                  <span className="text-xs font-bold text-amber-300">나만의 업무 달력 입장</span>
                  <Link 
                    href="/calendar" 
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#2C3E35] flex items-center justify-center transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold text-[#2C3E35]">비밀번호 입력 후 열기</span>
                  <button 
                    onClick={() => {
                      setIsPasswordModalOpen(true);
                      setPasswordError('');
                    }}
                    className="w-8 h-8 rounded-full bg-[#2C3E35] text-white flex items-center justify-center transition-transform hover:scale-105"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 하단 푸터 */}
        <footer className="mt-auto border-t border-[#B8C4A9]/20 bg-white/60 p-6 max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#2C3E35]/60">
          <p>© {new Date().getFullYear()} raniplace. 선생님들을 위한 든든하고 평온한 업무 지원 플랫폼.</p>
          <div className="flex gap-4">
            <span>개인정보처리방침</span>
            <span>이용약관</span>
          </div>
        </footer>
      </main>

      {/* 비밀번호 입력 모달 (3. 개인 공간 접근용) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3E35]/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#B8C4A9]/40 relative transform transition-all animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-6 right-6 text-[#2C3E35]/40 hover:text-[#2C3E35] p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#2C3E35] text-white flex items-center justify-center mb-6 shadow-md">
              <Lock className="w-7 h-7 text-amber-300" />
            </div>

            <h2 className="text-2xl font-bold text-[#2C3E35] mb-2">
              개인 공간 비밀번호 입력
            </h2>
            
            <p className="text-sm text-[#2C3E35]/70 mb-6 leading-relaxed">
              <strong>3. 개인</strong> 영역과 하위 항목인 <strong>나만의 업무 달력</strong>은 본인만 볼 수 있는 비공개 페이지입니다.<br />
              설정하신 비밀번호를 입력해주세요.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3E35]/80 uppercase tracking-wider mb-2">
                  비밀번호
                </label>
                <input 
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="비밀번호를 입력하세요"
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#F8FAF9] border border-[#B8C4A9]/40 focus:border-[#5B88B2] focus:bg-white outline-none transition-all text-sm font-medium text-[#2C3E35]"
                />
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-3.5 bg-[#F8FAF9] hover:bg-[#B8C4A9]/20 text-[#2C3E35] rounded-2xl font-bold text-sm transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 bg-[#2C3E35] hover:bg-[#3A5246] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  잠금 해제하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
