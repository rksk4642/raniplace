'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, Search, CheckCircle2, School, X } from 'lucide-react';

// 타입 정의
type Task = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color?: string; // e.g., 'bg-[#5B88B2]'
};

type NeisSchool = {
  SD_SCHUL_CODE: string;
  ATPT_OFCDC_SC_CODE: string;
  SCHUL_NM: string;
  ORG_RDNMA: string;
};

type NeisSchedule = {
  AA_YMD: string; // "20260714"
  EVENT_NM: string; // "여름방학식"
};

export default function CalendarGrid() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // 새 일정 추가 폼 상태
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // 🏫 학교 설정 (NEIS 정보공시) 관련 상태
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolSearchResults, setSchoolSearchResults] = useState<NeisSchool[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mySchool, setMySchool] = useState<NeisSchool | null>(null);
  const [schoolSchedules, setSchoolSchedules] = useState<NeisSchedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  // LocalStorage 연동 (최초 로드 시)
  useEffect(() => {
    const savedTasks = localStorage.getItem('raniplace_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    const savedSchool = localStorage.getItem('raniplace_school');
    if (savedSchool) {
      setMySchool(JSON.parse(savedSchool));
    }
  }, []);

  // LocalStorage 저장 (일정 변경 시)
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('raniplace_tasks', JSON.stringify(tasks));
    } else {
      localStorage.removeItem('raniplace_tasks');
    }
  }, [tasks]);

  // 학교 변경 시 LocalStorage 저장 및 학사일정 불러오기
  useEffect(() => {
    if (mySchool) {
      localStorage.setItem('raniplace_school', JSON.stringify(mySchool));
      fetchSchoolSchedule(mySchool, currentDate.getFullYear(), currentDate.getMonth() + 1);
    } else {
      localStorage.removeItem('raniplace_school');
      setSchoolSchedules([]);
    }
  }, [mySchool, currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 이번 달의 첫 날과 마지막 날 계산
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0: 일요일, 6: 토요일

  // 이전/다음 달 이동
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // 오늘 날짜로 이동
  const goToday = () => setCurrentDate(new Date());

  // YYYY-MM-DD 포맷 변환기
  const formatDate = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsTaskModalOpen(true);
  };

  // 새 일정 저장
  const handleSaveTask = () => {
    if (!newTaskTitle.trim() || !selectedDate) return;
    const newTask: Task = {
      id: Date.now().toString(),
      date: selectedDate,
      title: newTaskTitle,
      color: 'bg-[#5B88B2]' // 기본 바다 블루 색상
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsTaskModalOpen(false);
  };

  // 일정 삭제
  const handleDeleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 부모(날짜 칸) 클릭 이벤트 방지
    if(confirm('이 일정을 삭제하시겠습니까?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  // 🏫 NEIS 학교 검색 API 호출
  const searchSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolSearchQuery.trim()) return;
    
    setIsSearching(true);
    setSchoolSearchResults([]);
    
    try {
      const res = await fetch(`https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=20&SCHUL_NM=${encodeURIComponent(schoolSearchQuery)}`);
      const data = await res.json();
      
      if (data.schoolInfo && data.schoolInfo[1].row) {
        setSchoolSearchResults(data.schoolInfo[1].row);
      } else {
        setSchoolSearchResults([]);
        alert('검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('학교 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 📅 NEIS 학사일정 호출
  const fetchSchoolSchedule = async (school: NeisSchool, y: number, m: number) => {
    setIsLoadingSchedules(true);
    try {
      const fromYMD = `${y}${String(m).padStart(2, '0')}01`;
      const toYMD = `${y}${String(m).padStart(2, '0')}31`;
      
      const res = await fetch(
        `https://open.neis.go.kr/hub/SchoolSchedule?Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${school.ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${school.SD_SCHUL_CODE}&AA_FROM_YMD=${fromYMD}&AA_TO_YMD=${toYMD}`
      );
      const data = await res.json();
      
      if (data.SchoolSchedule && data.SchoolSchedule[1].row) {
        setSchoolSchedules(data.SchoolSchedule[1].row);
      } else {
        setSchoolSchedules([]);
      }
    } catch (error) {
      console.error(error);
      setSchoolSchedules([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 달력 헤더 (연월 및 컨트롤) */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-[#2C3E35] tracking-tight">
            {year}년 {month + 1}월
          </h2>
          <button onClick={goToday} className="px-3 py-1.5 text-xs font-semibold bg-[#F8FAF9] text-[#6E815C] rounded-lg hover:bg-[#B8C4A9]/20 transition-colors border border-[#B8C4A9]/30">
            오늘
          </button>
          
          <button 
            onClick={() => setIsSchoolModalOpen(true)}
            className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>학교 설정 (정보공시)</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          {mySchool && (
            <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#5B88B2] bg-[#A0C4E2]/10 px-3 py-1.5 rounded-full">
              <School className="w-3.5 h-3.5" />
              <span>{mySchool.SCHUL_NM}</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-[#F8FAF9] transition-colors text-[#2C3E35]/60">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-[#F8FAF9] transition-colors text-[#2C3E35]/60">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div key={day} className={`text-center py-2 text-sm font-semibold ${idx === 0 ? 'text-red-400' : idx === 6 ? 'text-[#5B88B2]' : 'text-[#2C3E35]/60'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-3 auto-rows-[minmax(120px,auto)] relative">
        {isLoadingSchedules && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <span className="px-4 py-2 bg-[#2C3E35] text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
              나이스 학사일정 동기화 중...
            </span>
          </div>
        )}
      
        {/* 이전 달 빈 칸 */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2 rounded-2xl bg-transparent" />
        ))}
        
        {/* 이번 달 날짜 */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDate(year, month, day);
          const dayTasks = tasks.filter(t => t.date === dateStr);
          
          // NEIS 학사일정 필터링 (AA_YMD 포맷: YYYYMMDD)
          const neisYMD = `${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;
          const daySchoolSchedules = schoolSchedules.filter(s => s.AA_YMD === neisYMD);
          
          const isToday = formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) === dateStr;

          return (
            <div 
              key={day} 
              onClick={() => handleDateClick(dateStr)}
              className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col gap-1
                ${isToday ? 'border-[#5B88B2] bg-[#A0C4E2]/5' : 'border-[#B8C4A9]/20 bg-[#F8FAF9] hover:bg-white hover:shadow-soft hover:border-[#B8C4A9]/40'}
              `}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-bold ${isToday ? 'text-[#5B88B2]' : 'text-[#2C3E35]/80'}`}>
                  {day}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4 text-[#B8C4A9]" />
                </span>
              </div>
              
              {/* 일정 목록 */}
              <div className="flex-1 overflow-y-auto space-y-1.5 mt-2 no-scrollbar">
                {/* NEIS 학사일정 표시 */}
                {daySchoolSchedules.map((sch, idx) => (
                  <div 
                    key={`neis-${idx}`} 
                    className="text-[10px] px-2 py-1 rounded-md text-amber-700 font-bold bg-amber-100 border border-amber-200 shadow-sm truncate"
                    title={sch.EVENT_NM}
                  >
                    🏫 {sch.EVENT_NM}
                  </div>
                ))}
                
                {/* 개인 생성 일정 표시 */}
                {dayTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={(e) => handleDeleteTask(e, task.id)}
                    className={`text-[11px] px-2 py-1.5 rounded-md text-white font-medium ${task.color} shadow-sm truncate hover:opacity-80 transition-opacity`}
                    title="클릭 시 삭제"
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 일정 추가 모달 */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3E35]/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-[#B8C4A9]/30">
            <h3 className="text-lg font-bold text-[#2C3E35] mb-4">
              {selectedDate?.split('-')[1]}월 {selectedDate?.split('-')[2]}일 일정 추가
            </h3>
            <input 
              type="text" 
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
              placeholder="업무 내용을 입력하세요"
              className="w-full px-4 py-3 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/30 outline-none focus:border-[#5B88B2] text-[#2C3E35] mb-6 transition-colors font-medium text-sm"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="flex-1 py-2.5 bg-[#F8FAF9] text-[#2C3E35]/70 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleSaveTask}
                className="flex-1 py-2.5 bg-[#2C3E35] text-white rounded-xl font-bold text-xs hover:bg-[#5B88B2] transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEIS 정보공시 학교 설정 모달 */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3E35]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative border border-[#B8C4A9]/30 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-[#B8C4A9]/20 flex justify-between items-center bg-[#F8FAF9]">
              <h3 className="text-lg font-bold text-[#2C3E35] flex items-center gap-2">
                <School className="w-5 h-5 text-[#5B88B2]" />
                정보공시 학교 설정
              </h3>
              <button onClick={() => setIsSchoolModalOpen(false)} className="text-[#2C3E35]/40 hover:text-[#2C3E35]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-xs font-medium text-[#2C3E35]/70 mb-4 leading-relaxed">
                재직 중인 학교를 설정하면 나이스(NEIS) 학교알리미 정보공시 데이터를 기반으로 <strong>이번 달 학사일정</strong>이 달력에 자동 동기화됩니다.
              </p>
              
              <form onSubmit={searchSchool} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={schoolSearchQuery}
                  onChange={(e) => setSchoolSearchQuery(e.target.value)}
                  placeholder="학교명을 입력하세요 (예: 푸른초)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/30 outline-none focus:border-[#5B88B2] text-[#2C3E35] text-sm font-medium"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2.5 bg-[#5B88B2] text-white rounded-xl font-bold text-xs hover:bg-[#4A7397] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  {isSearching ? '검색 중...' : '검색'}
                </button>
              </form>
              
              <div className="overflow-y-auto max-h-[250px] pr-1 space-y-2 no-scrollbar">
                {schoolSearchResults.map((school, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${mySchool?.SD_SCHUL_CODE === school.SD_SCHUL_CODE ? 'bg-[#A0C4E2]/10 border-[#5B88B2]' : 'bg-white border-[#B8C4A9]/20 hover:border-[#B8C4A9]/60 hover:bg-[#F8FAF9]'}`}
                    onClick={() => {
                      setMySchool(school);
                      setIsSchoolModalOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm text-[#2C3E35]">{school.SCHUL_NM}</div>
                        <div className="text-[11px] text-[#2C3E35]/60 mt-0.5">{school.ORG_RDNMA}</div>
                      </div>
                      {mySchool?.SD_SCHUL_CODE === school.SD_SCHUL_CODE && (
                        <CheckCircle2 className="w-5 h-5 text-[#5B88B2]" />
                      )}
                    </div>
                  </div>
                ))}
                
                {schoolSearchResults.length === 0 && !isSearching && schoolSearchQuery && (
                  <div className="text-center py-8 text-xs font-medium text-[#2C3E35]/40">
                    검색 결과가 표시됩니다.
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-[#B8C4A9]/20 bg-[#F8FAF9] flex justify-between items-center">
              {mySchool ? (
                <div className="text-xs font-bold text-[#5B88B2] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  설정된 학교: {mySchool.SCHUL_NM}
                </div>
              ) : (
                <div className="text-xs font-medium text-[#2C3E35]/50">설정된 학교가 없습니다.</div>
              )}
              
              {mySchool && (
                <button 
                  onClick={() => setMySchool(null)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold text-[11px] hover:bg-red-100"
                >
                  설정 해제
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
