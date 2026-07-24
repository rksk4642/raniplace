import { MountainSnow, Waves } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* 상단 헤더: 서비스 로고와 네비게이션 바 */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#F8FAF9]/80 border-b border-[#B8C4A9]/20 transition-all duration-500 ease-out">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#2C3E35] font-semibold text-xl tracking-tight cursor-pointer hover:text-[#5B88B2] transition-colors duration-300">
            <MountainSnow className="w-6 h-6 text-[#6E815C]" />
            <span>raniplace</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/calendar" className="text-sm font-medium text-[#2C3E35]/80 hover:text-[#5B88B2] transition-colors duration-300">나만의 달력</Link>
            <Link href="/observation" className="text-sm font-medium text-[#2C3E35]/80 hover:text-[#5B88B2] transition-colors duration-300">관찰 기록장</Link>
            <Link href="#" className="text-sm font-medium text-[#2C3E35]/80 hover:text-[#5B88B2] transition-colors duration-300">업무 팁</Link>
          </nav>
        </div>
      </header>

      {/* 메인 화면 (Hero Section) */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 overflow-hidden relative">
        {/* 부드럽게 퍼지는 배경 장식 요소 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-r from-[#A0C4E2]/20 to-[#B8C4A9]/20 blur-3xl -z-10 rounded-full" />
        
        <div className="max-w-3xl w-full flex flex-col items-center text-center gap-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-[#B8C4A9]/30 shadow-soft backdrop-blur-sm">
            <Waves className="w-4 h-4 text-[#5B88B2]" />
            <span className="text-xs font-medium text-[#5B88B2]">자연을 닮은 교육 플랫폼</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#2C3E35] leading-tight">
              업무, 수업 관련 <br className="hidden md:block" /> 이모저모
            </h1>
            <p className="text-base md:text-lg text-[#2C3E35]/70 max-w-xl mx-auto leading-relaxed font-medium">
              산처럼 든든하고 바다처럼 넓은 마음으로,<br />
              매일의 교육 현장에서 필요한 모든 것을 한곳에 모았습니다.<br />
              당신의 교육 여정이 더욱 평온해지기를 바랍니다.
            </p>
          </div>

          {/* 주요 기능 버튼들 */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calendar" className="group inline-flex justify-center relative px-8 py-4 bg-[#2C3E35] text-white rounded-2xl font-medium tracking-tight overflow-hidden shadow-soft hover:shadow-[0_12px_40px_rgba(44,62,53,0.2)] transition-all duration-500 ease-out hover:-translate-y-1">
              <span className="relative z-10 flex items-center gap-2">
                나만의 업무 달력
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#5B88B2] to-[#6E815C] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
            </Link>
            
            <Link href="/observation" className="group inline-flex justify-center relative px-8 py-4 bg-white text-[#2C3E35] border border-[#B8C4A9]/30 rounded-2xl font-medium tracking-tight overflow-hidden shadow-soft hover:shadow-[0_12px_40px_rgba(160,196,226,0.2)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#5B88B2]/50">
              <span className="relative z-10 flex items-center gap-2">
                학생 관찰 기록장
              </span>
            </Link>
          </div>
        </div>
      </main>

      {/* 하단 푸터 */}
      <footer className="mt-auto border-t border-[#B8C4A9]/20 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-[#2C3E35]/60">
            © {new Date().getFullYear()} raniplace. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm font-medium text-[#2C3E35]/60">
            <Link href="#" className="hover:text-[#5B88B2] transition-colors duration-300">개인정보처리방침</Link>
            <Link href="#" className="hover:text-[#5B88B2] transition-colors duration-300">이용약관</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
