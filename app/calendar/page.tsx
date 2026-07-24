'use client';
import { useState } from 'react';
import CalendarGrid from '@/components/CalendarGrid';
import { Calendar as CalendarIcon, Settings, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAF9] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/" className="inline-block text-[#5B88B2] text-sm font-medium mb-2 hover:underline">
              &larr; 메인으로 돌아가기
            </Link>
            <h1 className="text-3xl font-bold text-[#2C3E35] flex items-center gap-3 tracking-tight">
              <CalendarIcon className="w-8 h-8 text-[#5B88B2]" />
              나만의 업무 달력
            </h1>
            <p className="text-[#2C3E35]/60 mt-2 font-medium text-sm md:text-base">
              나만 볼 수 있는 프라이빗 업무 달력입니다. 브라우저에 임시 저장되며, 추후 DB 연동 시 바탕화면 위젯으로도 사용할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsWidgetModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#B8C4A9]/30 shadow-soft text-[#5B88B2] hover:bg-[#A0C4E2]/10 transition-colors duration-300 font-medium text-sm"
            >
              <LinkIcon className="w-4 h-4" />
              위젯 연동
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#B8C4A9]/30 shadow-soft text-[#6E815C] hover:bg-[#B8C4A9]/10 transition-colors duration-300 font-medium text-sm">
              <Settings className="w-4 h-4" />
              학교 설정
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3E35]/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
            <h2 className="text-xl font-bold text-[#2C3E35] mb-4">바탕화면 위젯 연동 안내</h2>
            <p className="text-sm text-[#2C3E35]/70 mb-6 leading-relaxed">
              현재는 <strong>브라우저 임시 저장(UI 테스트 모드)</strong>으로 동작 중입니다. 
              추후 Vercel Postgres 등 데이터베이스 연동이 완료되면, 아래의 ICS 구독 링크를 복사하여 <strong>Windows 달력 앱, Apple 캘린더, 구글 캘린더</strong>에 'URL로 구독하기'로 추가하실 수 있습니다.
            </p>
            <div className="flex items-center gap-2 bg-[#F8FAF9] p-3 rounded-xl border border-[#B8C4A9]/30 mb-6">
              <input 
                type="text" 
                readOnly 
                value="https://raniplace.vercel.app/api/calendar/ics" 
                className="bg-transparent flex-1 outline-none text-sm text-[#2C3E35]/80"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("https://raniplace.vercel.app/api/calendar/ics");
                  alert("현재는 테스트용 빈 데이터가 복사됩니다.");
                }}
                className="px-3 py-1.5 bg-[#5B88B2] text-white text-xs font-medium rounded-lg hover:bg-[#A0C4E2] transition-colors whitespace-nowrap"
              >
                복사
              </button>
            </div>
            <button 
              onClick={() => setIsWidgetModalOpen(false)}
              className="w-full py-3 bg-[#F8FAF9] text-[#2C3E35] rounded-xl font-medium hover:bg-[#B8C4A9]/20 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
