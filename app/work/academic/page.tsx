'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Board from '@/components/Board';
import { getLoggedInUser, LoggedInUser } from '@/utils/auth';
import { ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export default function AcademicPage() {
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCurrentUser(getLoggedInUser());
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#2C3E35] mb-4">접근 권한이 없습니다</h2>
        <p className="text-sm text-[#2C3E35]/70 mb-8">
          교무(수업계) 게시판은 교사 인증이 완료된 분만 열람 가능합니다.<br/>
          업무 메인 페이지에서 로그인을 먼저 진행해주세요.
        </p>
        <Link href="/work" className="px-6 py-3 rounded-2xl bg-[#5B88B2] text-white font-bold text-sm shadow-md flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> 업무 메인으로 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      {/* 헤더 및 뒤로가기 (필요시) */}
      <div className="bg-white border-b border-[#B8C4A9]/20 p-4 flex items-center sticky top-0 z-10 md:hidden">
        <Link href="/" className="text-[#5B88B2] font-bold text-sm flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> 홈으로
        </Link>
      </div>
      
      <Board 
        category="academic" 
        title="교무(수업계)" 
        description="교무 및 수업 관련 자료, 학사 일정 등을 공유하는 공간입니다."
      />
    </div>
  );
}
