'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, CheckCircle2, XCircle, Clock, ArrowLeft, ArrowRight, 
  UserPlus, RefreshCw, AlertCircle, Building2, Mail, MessageSquare, 
  Lock, Filter 
} from 'lucide-react';
import { 
  getAuthRequests, 
  updateAuthRequestStatus, 
  addTestAuthRequest, 
  resetAuthRequests, 
  isAdminUnlocked as checkAdminUnlocked, 
  setAdminUnlocked, 
  verifyAdminPassword, 
  AuthRequest,
  subscribeToAuthRequests
} from '@/utils/auth';

export default function AdminApprovalsPage() {
  const [isAdminUnlocked, setIsAdminUnlockedState] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [requests, setRequests] = useState<AuthRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const loadRequests = async () => {
    const data = await getAuthRequests();
    setRequests(data);
    setIsAdminUnlockedState(checkAdminUnlocked());
  };

  useEffect(() => {
    loadRequests();
    
    const sub = subscribeToAuthRequests(() => {
      loadRequests();
    });
    
    window.addEventListener('admin_unlocked_updated', loadRequests);

    return () => {
      sub.unsubscribe();
      window.removeEventListener('admin_unlocked_updated', loadRequests);
    };
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setAdminUnlocked(true);
      setPasswordError('');
    } else {
      setPasswordError('비밀번호가 일치하지 않습니다. 다시 입력해주세요.');
    }
  };

  // 필터링된 목록
  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  // 1. 미인증 시 비밀번호 입력 화면
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] text-[#2C3E35] p-6 md:p-12 flex flex-col items-center justify-center relative">
        <div className="max-w-md w-full">
          <Link href="/" className="inline-flex items-center gap-2 text-[#5B88B2] hover:underline font-bold text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>메인 내비게이션으로 돌아가기</span>
          </Link>

          <div className="bg-white rounded-3xl p-8 shadow-[0_16px_50px_rgba(44,62,53,0.1)] border border-[#B8C4A9]/30 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#2C3E35] text-white flex items-center justify-center mx-auto mb-6 shadow-md">
              <ShieldCheck className="w-8 h-8 text-amber-300" />
            </div>

            <h1 className="text-2xl font-bold text-[#2C3E35] mb-2">
              교사 인증 승인 관리자 접속
            </h1>
            <p className="text-xs text-[#2C3E35]/70 leading-relaxed mb-6">
              본 페이지는 <strong>3. 개인</strong> 영역 관리자 전용입니다.<br />
              관리자 비밀번호를 입력해주세요.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#2C3E35]/80 uppercase mb-1">비밀번호</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="비밀번호 입력"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#F8FAF9] border border-[#B8C4A9]/40 focus:bg-white focus:border-[#5B88B2] outline-none text-sm font-medium"
                  autoFocus
                />
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-[#2C3E35] hover:bg-[#3A5246] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>잠금 해제 및 관리 페이지 입장</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. 관리자 인증 완료 화면
  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#2C3E35] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 상단 네비게이션 헤더 */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#B8C4A9]/20 shadow-soft">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/" className="inline-flex items-center gap-1.5 text-[#5B88B2] font-bold text-xs hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>메인 내비게이션</span>
              </Link>
              <span className="text-[#B8C4A9]">|</span>
              <Link href="/work" className="inline-flex items-center gap-1.5 text-[#6E815C] font-bold text-xs hover:underline">
                <span>업무 페이지 바로가기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[#2C3E35] flex items-center gap-3 tracking-tight">
              <ShieldCheck className="w-8 h-8 text-[#6E815C]" />
              교사 인증 요청 승인 관리
            </h1>
            <p className="text-xs md:text-sm text-[#2C3E35]/60 mt-1 font-medium">
              업무 페이지 열람 권한을 신청한 선생님들의 내역을 심사하고 승인하거나 거절할 수 있습니다.
            </p>
          </div>

          {/* 테스트 도구 및 상태 */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={async () => { await addTestAuthRequest(); }}
              className="px-3.5 py-2 rounded-xl bg-[#5B88B2]/10 hover:bg-[#5B88B2] text-[#5B88B2] hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ 테스트 신청 추가</span>
            </button>
            <button
              onClick={async () => { 
                if (confirm('모든 요청 데이터를 초기 샘플 상태로 리셋하시겠습니까?')) {
                  await resetAuthRequests();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-[#F8FAF9] hover:bg-red-50 text-[#2C3E35]/60 hover:text-red-600 border border-[#B8C4A9]/30 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>목록 초기화</span>
            </button>
          </div>
        </header>

        {/* 상태별 필터 바 */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#B8C4A9]/20 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                filter === 'pending'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-[#F8FAF9] text-[#2C3E35]/70 hover:bg-[#B8C4A9]/20'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>대기 중</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-500/10 text-amber-600'}`}>
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                filter === 'approved'
                  ? 'bg-[#6E815C] text-white shadow-md'
                  : 'bg-[#F8FAF9] text-[#2C3E35]/70 hover:bg-[#B8C4A9]/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>승인됨</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === 'approved' ? 'bg-white/20 text-white' : 'bg-[#6E815C]/10 text-[#6E815C]'}`}>
                {approvedCount}
              </span>
            </button>

            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-[#F8FAF9] text-[#2C3E35]/70 hover:bg-[#B8C4A9]/20'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>거절됨</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === 'rejected' ? 'bg-white/20 text-white' : 'bg-red-500/10 text-red-600'}`}>
                {rejectedCount}
              </span>
            </button>

            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                filter === 'all'
                  ? 'bg-[#2C3E35] text-white shadow-md'
                  : 'bg-[#F8FAF9] text-[#2C3E35]/70 hover:bg-[#B8C4A9]/20'
              }`}
            >
              <span>전체 보기</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === 'all' ? 'bg-white/20 text-white' : 'bg-[#2C3E35]/10 text-[#2C3E35]'}`}>
                {requests.length}
              </span>
            </button>
          </div>

          <div className="text-xs text-[#2C3E35]/60 font-medium px-2">
            현재 <strong>{filteredRequests.length}건</strong>의 요청을 보고 있습니다.
          </div>
        </div>

        {/* 요청 목록 카드 그리드 */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#B8C4A9]/20 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-[#F8FAF9] text-[#2C3E35]/40 flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#2C3E35] mb-1">해당하는 요청 내역이 없습니다.</h3>
            <p className="text-xs text-[#2C3E35]/60 mb-6">
              상단 메뉴에서 다른 필터를 선택하거나 <strong>+ 테스트 신청 추가</strong> 버튼으로 가상의 교사 신청 내역을 생성해보세요.
            </p>
            <button
              onClick={async () => await addTestAuthRequest()}
              className="px-5 py-3 rounded-2xl bg-[#2C3E35] text-white font-bold text-xs shadow-md hover:bg-[#3A5246] transition-all"
            >
              + 테스트 교사 신청 생성하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 shadow-soft flex flex-col justify-between ${
                  req.status === 'pending'
                    ? 'border-amber-400/60 shadow-[0_8px_30px_rgba(245,158,11,0.1)]'
                    : req.status === 'approved'
                    ? 'border-[#6E815C]/40'
                    : 'border-red-300/40 opacity-75'
                }`}
              >
                <div>
                  {/* 카드 상단 상태 배지 및 신청 시간 */}
                  <div className="flex items-center justify-between mb-4">
                    {req.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 font-extrabold text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>승인 대기 중</span>
                      </span>
                    )}
                    {req.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6E815C]/15 text-[#6E815C] font-extrabold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>승인 완료됨</span>
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 font-extrabold text-xs">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>거절됨 (반려)</span>
                      </span>
                    )}
                    
                    <span className="text-[11px] text-[#2C3E35]/50 font-medium">
                      {new Date(req.created_at).toLocaleString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* 교사 기본 정보 */}
                  <div className="space-y-1 mb-4">
                    <h3 className="text-xl font-black text-[#2C3E35] flex items-center gap-2">
                      <span>{req.name}</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#2C3E35]/70">
                      <span className="flex items-center gap-1 text-[#5B88B2]">
                        <Building2 className="w-3.5 h-3.5" />
                        {req.school}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#2C3E35]/40" />
                        아이디: <code className="font-mono bg-[#F8FAF9] px-1.5 py-0.5 rounded text-[#2C3E35] font-bold">{req.email}</code>
                      </span>
                    </div>
                  </div>

                  {/* 요청 메시지 */}
                  <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-[#B8C4A9]/20 mb-6 text-xs text-[#2C3E35]/80 leading-relaxed font-medium relative">
                    <MessageSquare className="w-4 h-4 text-[#B8C4A9] absolute top-3.5 left-3.5" />
                    <p className="pl-6 italic">"{req.message}"</p>
                  </div>
                </div>

                {/* 관리자 승인/거절 액션 버튼 */}
                <div className="pt-4 border-t border-[#B8C4A9]/20 flex items-center gap-3">
                  {req.status === 'pending' ? (
                    <>
                      <button
                        onClick={async () => await updateAuthRequestStatus(req.id, 'rejected')}
                        className="flex-1 py-3 rounded-xl bg-[#F8FAF9] hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>거절하기</span>
                      </button>
                      <button
                        onClick={async () => await updateAuthRequestStatus(req.id, 'approved')}
                        className="flex-1 py-3 rounded-xl bg-[#6E815C] hover:bg-[#59694A] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>승인하기</span>
                      </button>
                    </>
                  ) : req.status === 'approved' ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#6E815C]">✅ 현재 업무 페이지 열람이 허용된 교사입니다.</span>
                      <button
                        onClick={async () => await updateAuthRequestStatus(req.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg bg-[#F8FAF9] hover:bg-red-50 text-[#2C3E35]/60 hover:text-red-600 text-[11px] font-bold transition-colors"
                      >
                        권한 취소
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs font-semibold text-red-500">❌ 현재 권한이 거절된 상태입니다.</span>
                      <button
                        onClick={async () => await updateAuthRequestStatus(req.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-[#6E815C]/10 hover:bg-[#6E815C] text-[#6E815C] hover:text-white text-[11px] font-bold transition-colors"
                      >
                        다시 승인하기
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
