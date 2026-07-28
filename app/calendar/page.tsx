'use client';
import { useState, useEffect } from 'react';
import CalendarGrid from '@/components/CalendarGrid';
import { 
  Calendar as CalendarIcon, Settings, Link as LinkIcon, 
  Lock, AlertCircle, ArrowLeft, ShieldCheck, KeyRound, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { 
  isAdminUnlocked as checkAdminUnlocked, 
  setAdminUnlocked, 
  verifyAdminPassword 
} from '@/utils/auth';

export default function CalendarPage() {
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlockedState] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setIsAdminUnlockedState(checkAdminUnlocked());
    const handleUpdate = () => {
      setIsAdminUnlockedState(checkAdminUnlocked());
    };
    window.addEventListener('admin_unlocked_updated', handleUpdate);
    return () => window.removeEventListener('admin_unlocked_updated', handleUpdate);
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

  // 1. 미인증 시 비밀번호 검증 화면
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
              <CalendarIcon className="w-8 h-8 text-amber-300" />
            </div>

            <h1 className="text-2xl font-bold text-[#2C3E35] mb-2">
              나만의 업무 달력 비공개 보호
            </h1>
            <p className="text-xs text-[#2C3E35]/70 leading-relaxed mb-6">
              본 페이지는 <strong>3. 개인</strong> 영역의 하위 비공개 달력입니다.<br />
              설정하신 비밀번호(<code className="bg-[#F8FAF9] px-1.5 py-0.5 rounded text-[#5B88B2] font-mono font-bold">dlswo12*</code>)를 입력해주세요.
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
                  placeholder="비밀번호를 입력하세요"
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
                <span>잠금 해제 및 달력 열기</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. 인증 완료 상태: 나만의 업무 달력
  return (
    <div className="min-h-screen bg-[#F8FAF9] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#B8C4A9]/20 shadow-soft">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/" className="inline-flex items-center gap-1.5 text-[#5B88B2] font-bold text-xs hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>메인 내비게이션</span>
              </Link>
              <span className="text-[#B8C4A9]">|</span>
              <Link href="/admin/approvals" className="inline-flex items-center gap-1.5 text-[#6E815C] font-bold text-xs hover:underline">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>교사 인증 승인 관리 바로가기</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-[#2C3E35] flex items-center gap-3 tracking-tight">
                <CalendarIcon className="w-8 h-8 text-[#5B88B2]" />
                나만의 업무 달력
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-extrabold text-xs flex items-center gap-1">
                <span>🔓 프라이빗 보호 중</span>
              </span>
            </div>
            <p className="text-[#2C3E35]/60 mt-2 font-medium text-xs md:text-sm">
              나만 볼 수 있는 <strong>3. 개인</strong> 하위의 프라이빗 업무 달력입니다. 브라우저에 일정 정보가 안전하게 저장됩니다.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button 
              onClick={() => setIsWidgetModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-[#B8C4A9]/30 shadow-soft text-[#5B88B2] hover:bg-[#A0C4E2]/10 transition-colors duration-300 font-bold text-xs"
            >
              <LinkIcon className="w-4 h-4" />
              <span>위젯 연동</span>
            </button>
            <button 
              onClick={() => setAdminUnlocked(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2C3E35] text-white rounded-2xl shadow-soft hover:bg-[#3A5246] transition-colors duration-300 font-bold text-xs"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>달력 잠그기</span>
            </button>
          </div>
        </header>

        {/* Main Calendar Area */}
        <main className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(160,196,226,0.1)] border border-[#B8C4A9]/20 p-6 md:p-8 overflow-hidden">
          <CalendarGrid />
        </main>
      </div>

      {/* 위젯 연동 모달 */}
      {isWidgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3E35]/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-[#B8C4A9]/30">
            <h2 className="text-xl font-bold text-[#2C3E35] mb-4">바탕화면 위젯 연동 안내</h2>
            <p className="text-xs text-[#2C3E35]/70 mb-6 leading-relaxed font-medium">
              현재는 <strong>브라우저 로컬 저장(UI 테스트 모드)</strong>으로 동작 중입니다. 
              추후 데이터베이스 연동이 완료되면, 아래의 ICS 구독 링크를 복사하여 <strong>Windows 달력 앱, Apple 캘린더, 구글 캘린더</strong>에 'URL로 구독하기'로 추가하실 수 있습니다.
            </p>
            <div className="flex items-center gap-2 bg-[#F8FAF9] p-3 rounded-2xl border border-[#B8C4A9]/30 mb-6">
              <input 
                type="text" 
                readOnly 
                value="https://raniplace.vercel.app/api/calendar/ics" 
                className="bg-transparent flex-1 outline-none text-xs font-mono font-bold text-[#2C3E35]/80"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("https://raniplace.vercel.app/api/calendar/ics");
                  alert("현재는 테스트용 캘린더 주소가 복사됩니다.");
                }}
                className="px-3.5 py-2 bg-[#5B88B2] text-white text-xs font-bold rounded-xl hover:bg-[#4A7397] transition-colors whitespace-nowrap shadow-sm"
              >
                복사
              </button>
            </div>
            <button 
              onClick={() => setIsWidgetModalOpen(false)}
              className="w-full py-3.5 bg-[#F8FAF9] text-[#2C3E35] rounded-2xl font-bold text-xs hover:bg-[#B8C4A9]/20 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
