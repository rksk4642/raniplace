'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { BookOpen, User, Tag, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type StudentLog = {
  id: string;
  created_at: string;
  student_name: string;
  category: string;
  content: string;
};

export default function ObservationPage() {
  const [logs, setLogs] = useState<StudentLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 폼 상태
  const [studentName, setStudentName] = useState('');
  const [category, setCategory] = useState('칭찬');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 알림 메시지 상태
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  // Supabase에서 데이터 불러오기
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching logs:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Supabase에 데이터 저장하기
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !content.trim()) {
      setMessage({ type: 'error', text: '학생 이름과 내용을 모두 입력해주세요.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);
      
      const { data, error } = await supabase
        .from('student_logs')
        .insert([
          { student_name: studentName, category, content }
        ])
        .select();

      if (error) throw error;

      setMessage({ type: 'success', text: '기록이 성공적으로 저장되었습니다!' });
      setStudentName('');
      setContent('');
      
      // 방금 추가된 데이터를 목록 맨 앞에 추가
      if (data) {
        setLogs([data[0], ...logs]);
      }
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving log:', error.message);
      setMessage({ type: 'error', text: '저장에 실패했습니다. 설정을 확인해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case '칭찬': return 'bg-[#5B88B2]/10 text-[#5B88B2] border-[#5B88B2]/20';
      case '태도': return 'bg-[#6E815C]/10 text-[#6E815C] border-[#6E815C]/20';
      case '학습': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

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
              <BookOpen className="w-8 h-8 text-[#6E815C]" />
              학생 관찰 기록장
            </h1>
            <p className="text-[#2C3E35]/60 mt-2 font-medium">
              수업 중 발견한 학생의 특징을 기록하고 Supabase에 안전하게 보관하세요.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 입력 폼 (왼쪽) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-soft border border-[#B8C4A9]/20 p-6 md:p-8 sticky top-8">
              <h2 className="text-xl font-bold text-[#2C3E35] mb-6">새로운 기록 작성</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3E35]/80 mb-2">
                    <User className="w-4 h-4" /> 학생 이름
                  </label>
                  <input 
                    type="text" 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/30 focus:border-[#6E815C] focus:ring-1 focus:ring-[#6E815C] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3E35]/80 mb-2">
                    <Tag className="w-4 h-4" /> 분류
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/30 focus:border-[#6E815C] focus:ring-1 focus:ring-[#6E815C] outline-none transition-all appearance-none"
                  >
                    <option value="칭찬">칭찬</option>
                    <option value="태도">태도</option>
                    <option value="학습">학습</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3E35]/80 mb-2">
                    <FileText className="w-4 h-4" /> 관찰 내용
                  </label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="관찰한 내용을 자유롭게 적어주세요."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/30 focus:border-[#6E815C] focus:ring-1 focus:ring-[#6E815C] outline-none transition-all resize-none"
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#2C3E35] text-white rounded-xl font-medium tracking-tight hover:bg-[#6E815C] transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? '저장 중...' : '기록 저장하기'}
                </button>
              </form>
            </div>
          </div>

          {/* 기록 목록 (오른쪽) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-soft border border-[#B8C4A9]/20 p-6 md:p-8 min-h-[500px]">
              <h2 className="text-xl font-bold text-[#2C3E35] mb-6 flex justify-between items-center">
                <span>최근 기록</span>
                <span className="text-sm font-medium text-[#5B88B2] bg-[#A0C4E2]/10 px-3 py-1 rounded-full">
                  총 {logs.length}건
                </span>
              </h2>

              {loading ? (
                <div className="flex justify-center items-center h-40 text-[#2C3E35]/50 font-medium">
                  데이터를 불러오는 중입니다...
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-[#2C3E35]/50 space-y-2">
                  <BookOpen className="w-8 h-8 opacity-20" />
                  <p>아직 기록된 관찰 내용이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#B8C4A9]/20 hover:shadow-sm transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#2C3E35] text-lg">{log.student_name}</span>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getCategoryColor(log.category)}`}>
                            {log.category}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-[#2C3E35]/40">
                          {new Date(log.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-[#2C3E35]/80 text-sm leading-relaxed whitespace-pre-wrap">
                        {log.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
