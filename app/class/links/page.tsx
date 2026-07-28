'use client';

import { useState, useEffect } from 'react';
import { LinkIcon, Plus, QrCode, Search, Trash2, ExternalLink, X } from 'lucide-react';

type SiteLink = {
  id: string;
  keyword: string; // 한글 단축어
  url: string; // 실제 사이트 주소
};

export default function LinksPage() {
  const [links, setLinks] = useState<SiteLink[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 새 링크 추가 폼 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // QR 코드 모달 상태
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('raniplace_class_links');
    if (saved) {
      setLinks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (links.length > 0) {
      localStorage.setItem('raniplace_class_links', JSON.stringify(links));
    } else {
      localStorage.removeItem('raniplace_class_links');
    }
  }, [links]);

  // 한글 단축키 검색 및 이동
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;

    const found = links.find(l => l.keyword === searchKeyword.trim());
    if (found) {
      window.open(found.url, '_blank');
      setSearchKeyword(''); // 이동 후 초기화
    } else {
      alert(`'${searchKeyword}'에 해당하는 링크를 찾을 수 없습니다. 등록 먼저 해주세요.`);
    }
  };

  // 링크 저장
  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newUrl.trim()) {
      alert('단축어와 URL을 모두 입력해주세요.');
      return;
    }
    
    // URL 형식 기본 검사 및 보정
    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    // 중복 체크
    if (links.some(l => l.keyword === newKeyword.trim())) {
      alert('이미 등록된 단축어입니다. 다른 단축어를 사용해주세요.');
      return;
    }

    const newLink: SiteLink = {
      id: Date.now().toString(),
      keyword: newKeyword.trim(),
      url: formattedUrl
    };

    setLinks([...links, newLink]);
    setNewKeyword('');
    setNewUrl('');
    setIsAddModalOpen(false);
  };

  // 링크 삭제
  const handleDelete = (id: string) => {
    if (confirm('이 링크를 삭제하시겠습니까?')) {
      setLinks(links.filter(l => l.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#2C3E35]">사이트 링크 및 단축어 관리</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B88B2] text-white font-bold text-xs hover:bg-[#4A7397] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>새 링크 추가</span>
        </button>
      </div>

      {/* 🚀 한글 단축어 검색 퀵 이동 창 */}
      <div className="bg-white p-6 rounded-3xl border border-[#B8C4A9]/30 shadow-soft">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B88B2]">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="여기에 한글 단축어(예: 구글)를 입력하고 엔터를 치면 바로 이동합니다."
              className="w-full pl-12 pr-4 py-4 bg-[#F8FAF9] border border-[#B8C4A9]/40 rounded-2xl outline-none focus:border-[#5B88B2] focus:ring-2 focus:ring-[#5B88B2]/20 font-bold text-[#2C3E35] transition-all"
            />
          </div>
          <button 
            type="submit"
            className="w-full sm:w-auto px-8 py-4 bg-[#2C3E35] text-white rounded-2xl font-bold hover:bg-[#1A2620] transition-colors shadow-sm whitespace-nowrap"
          >
            이동하기
          </button>
        </form>
      </div>

      {/* 링크 목록 그리드 */}
      {links.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#B8C4A9]/20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#F8FAF9] rounded-2xl flex items-center justify-center mb-4 text-[#B8C4A9]">
            <LinkIcon className="w-8 h-8" />
          </div>
          <p className="font-bold text-[#2C3E35] mb-2">등록된 링크가 없습니다.</p>
          <p className="text-sm text-[#2C3E35]/60">우측 상단의 '새 링크 추가' 버튼을 눌러 나만의 사이트를 등록해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <div key={link.id} className="bg-white rounded-2xl p-5 border border-[#B8C4A9]/30 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-[#2C3E35] flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#5B88B2]/10 text-[#5B88B2] rounded-md text-xs font-black">
                      {link.keyword}
                    </span>
                  </h3>
                  <button 
                    onClick={() => handleDelete(link.id)}
                    className="text-[#2C3E35]/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-[#2C3E35]/60 truncate font-mono">
                  {link.url}
                </p>
              </div>
              
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#B8C4A9]/10">
                <a 
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-[#F8FAF9] hover:bg-gray-100 rounded-xl text-xs font-bold text-[#2C3E35]/80 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  새 창 열기
                </a>
                <button 
                  onClick={() => setQrUrl(link.url)}
                  className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-[#6E815C]/10 hover:bg-[#6E815C]/20 rounded-xl text-xs font-bold text-[#6E815C] transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QR 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 새 링크 추가 모달 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3E35]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-[#B8C4A9]/30">
            <h3 className="text-lg font-bold text-[#2C3E35] mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[#5B88B2]" />
              새 사이트 링크 추가
            </h3>
            
            <form onSubmit={handleSaveLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3E35]/70 mb-1.5">
                  한글 단축어 (검색 키워드)
                </label>
                <input 
                  type="text" 
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="예: 구글, 나이스, 업무포털"
                  className="w-full px-4 py-3 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/30 outline-none focus:border-[#5B88B2] text-[#2C3E35] text-sm font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#2C3E35]/70 mb-1.5">
                  실제 접속 URL
                </label>
                <input 
                  type="text" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="예: google.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/30 outline-none focus:border-[#5B88B2] text-[#2C3E35] text-sm font-medium"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#F8FAF9] text-[#2C3E35]/70 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#5B88B2] text-white rounded-xl font-bold text-xs hover:bg-[#4A7397] transition-colors"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR 코드 모달 */}
      {qrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3E35]/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl relative border border-[#B8C4A9]/30 flex flex-col items-center text-center">
            <button 
              onClick={() => setQrUrl(null)}
              className="absolute top-4 right-4 text-[#2C3E35]/40 hover:text-[#2C3E35] bg-[#F8FAF9] rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-[#5B88B2]/10 text-[#5B88B2] rounded-2xl flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-black text-[#2C3E35] mb-2">QR 코드 스캔</h3>
            <p className="text-xs font-medium text-[#2C3E35]/60 mb-6 break-all max-w-[250px]">
              {qrUrl}
            </p>
            
            <div className="bg-white p-2 rounded-2xl border-2 border-[#5B88B2]/20 shadow-sm">
              {/* 외부 API를 통해 QR 코드를 즉석 렌더링 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}&margin=10`} 
                alt="QR Code"
                className="w-[200px] h-[200px] object-contain"
              />
            </div>
            
            <p className="text-[11px] font-bold text-[#5B88B2] mt-6 bg-[#5B88B2]/10 px-4 py-2 rounded-full">
              스마트폰 카메라로 화면을 스캔하세요
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
