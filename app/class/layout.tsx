'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BookOpen, Link as LinkIcon, Calculator, Wrench } from 'lucide-react';

export default function ClassLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    {
      name: '직무수학',
      href: '/class/math',
      icon: <Calculator className="w-4 h-4" />
    },
    {
      name: '수업 도구모음',
      href: '/class/tools',
      icon: <Wrench className="w-4 h-4" />
    },
    {
      name: '사이트 링크',
      href: '/class/links',
      icon: <LinkIcon className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#2C3E35] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 상단 네비게이션 헤더 */}
        <header className="bg-white p-6 rounded-3xl border border-[#B8C4A9]/20 shadow-soft flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-1.5 text-[#5B88B2] font-bold text-xs mb-2 hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>메인 내비게이션으로 돌아가기</span>
              </Link>
              <h1 className="text-2xl md:text-3xl font-black text-[#2C3E35] flex items-center gap-3 tracking-tight">
                <BookOpen className="w-8 h-8 text-[#6E815C]" />
                수업 메뉴
              </h1>
            </div>
          </div>

          {/* 서브 탭 네비게이션 */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#B8C4A9]/20 pb-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm font-bold ${
                    isActive 
                      ? 'border-[#6E815C] text-[#6E815C]' 
                      : 'border-transparent text-[#2C3E35]/50 hover:text-[#2C3E35]/80 hover:border-[#B8C4A9]/50'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </header>

        {/* 하위 페이지 렌더링 영역 */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
