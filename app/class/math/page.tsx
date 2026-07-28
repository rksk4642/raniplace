'use client';

import { Calculator } from 'lucide-react';

export default function MathPage() {
  return (
    <div className="bg-white rounded-3xl p-12 border border-[#B8C4A9]/20 shadow-soft flex flex-col items-center justify-center min-h-[400px] text-center animate-in fade-in duration-300">
      <div className="w-20 h-20 rounded-full bg-[#6E815C]/10 flex items-center justify-center mb-6 text-[#6E815C]">
        <Calculator className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-[#2C3E35] mb-2">직무수학 도구 (준비 중)</h2>
      <p className="text-sm text-[#2C3E35]/60 max-w-md mx-auto">
        직무와 관련된 수학 계산 및 교육 도구가 이곳에 추가될 예정입니다. 필요한 기능이 있으시면 건의해주세요!
      </p>
    </div>
  );
}
