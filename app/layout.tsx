import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSansKr = Noto_Sans_KR({ 
  subsets: ['latin'], 
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
});

export const metadata: Metadata = {
  title: 'raniplace | 업무, 수업 관련 이모저모',
  description: '선생님들을 위한 교육용 웹 서비스 뼈대 코드입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* 폰트 변수를 적용하고 산과 바다 느낌의 기본 배경색과 텍스트 색상을 설정합니다. */}
      <body className={`${notoSansKr.variable} font-sans tracking-tight bg-[#F8FAF9] text-[#2C3E35]`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
