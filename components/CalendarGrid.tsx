'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, Search, CheckCircle2, School, X, Trash2, CalendarCheck, Circle } from 'lucide-react';

// 타입 정의
type Task = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color?: string; // e.g., 'bg-[#5B88B2]'
  completed?: boolean;
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
  
  // 우측 패널 새 일정 추가 폼 상태
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // 🏫 학교 설정 (NEIS 정보공시) 관련 상태
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolSearchResults, setSchoolSearchResults] = useState<NeisSchool[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mySchool, setMySchool] = useState<NeisSchool | null>(null);
  const [schoolSchedules, setSchoolSchedules] = useState<NeisSchedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  // 초기 날짜 선택 (오늘)
  useEffect(() => {
    const today = new Date();
    setSelectedDate(formatDate(today.getFullYear(), today.getMonth(), today.getDate()));
  }, []);

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
  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(formatDate(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  // YYYY-MM-DD 포맷 변환기
  const formatDate = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  // 새 일정 저장
  const handleSaveTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim() || !selectedDate) return;
    const newTask: Task = {
      id: Date.now().toString(),
      date: selectedDate,
      title: newTaskTitle,
      color: 'bg-[#5B88B2]', // 기본 바다 블루 색상
      completed: false
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  // 일정 완료 토글
  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // 일정 삭제
  const handleDeleteTask = (id: string) => {
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

  // 선택된 날짜의 업무와 학사일정 계산
  const selectedDayTasks = selectedDate ? tasks.filter(t => t.date === selectedDate).sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  }) : [];
  
  const selectedNeisSchedules = selectedDate ? schoolSchedules.filter(s => {
    const [y, m, d] = selectedDate.split('-');
    return s.AA_YMD === `${y}${m}${d}`;
  }) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[700px]">
      
      {/* 🟢 좌측 영역: 캘린더 그리드 */}
      <div className="flex-1 flex flex-col">
        {/* 달력 헤더 (연월 및 컨트롤) */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-[#2C3E35] tracking-tight">
              {year}년 {month + 1}월
            </h2>
            <button onClick={goToday} className="px-3 py-1.5 text-xs font-semibold bg-[#F8FAF9] text-[#6E815C] rounded-lg hover:bg-[#B8C4A9]/20 transition-colors border border-[#B8C4A9]/30 shadow-sm">
              오늘
            </button>
            
            <button 
              onClick={() => setIsSchoolModalOpen(true)}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200 shadow-sm"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">학교 설정 (정보공시)</span>
              <span className="sm:hidden">학교 설정</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {mySchool && (
              <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#5B88B2] bg-[#A0C4E2]/10 px-3 py-1.5 rounded-full border border-[#5B88B2]/20">
                <School className="w-3.5 h-3.5" />
                <span>{mySchool.SCHUL_NM}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-[#F8FAF9] transition-colors text-[#2C3E35]/60 border border-transparent hover:border-[#B8C4A9]/30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-[#F8FAF9] transition-colors text-[#2C3E35]/60 border border-transparent hover:border-[#B8C4A9]/30">
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
        <div className="grid grid-cols-7 gap-3 auto-rows-[minmax(120px,1fr)] flex-1 relative">
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
            const isToday = formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) === dateStr;
            const isSelected = selectedDate === dateStr;
            
            // 업무 목록 및 정렬 (미완료 먼저, 완료 나중)
            const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => {
              if (a.completed === b.completed) return 0;
              return a.completed ? 1 : -1;
            });
            
            // NEIS 학사일정 필터링
            const neisYMD = `${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;
            const daySchoolSchedules = schoolSchedules.filter(s => s.AA_YMD === neisYMD);
            
            return (
              <div 
                key={day} 
                onClick={() => handleDateClick(dateStr)}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-1 overflow-hidden
                  ${isSelected ? 'ring-2 ring-[#5B88B2] ring-offset-2 border-transparent' : ''}
                  ${isToday && !isSelected ? 'border-[#5B88B2] bg-[#A0C4E2]/5' : 'border-[#B8C4A9]/30 bg-[#F8FAF9] hover:bg-white hover:shadow-soft hover:border-[#B8C4A9]/60'}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-bold ${isToday ? 'text-[#5B88B2]' : 'text-[#2C3E35]/80'}`}>
                    {day}
                  </span>
                </div>
                
                {/* 일정 목록 (스크롤 가능하도록 처리) */}
                <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 custom-scrollbar">
                  {/* NEIS 학사일정 표시 */}
                  {daySchoolSchedules.map((sch, idx) => (
                    <div 
                      key={`neis-${idx}`} 
                      className="text-[10px] px-1.5 py-1 rounded text-amber-700 font-bold bg-amber-100/70 border border-amber-200/50 truncate"
                      title={sch.EVENT_NM}
                    >
                      🏫 {sch.EVENT_NM}
                    </div>
                  ))}
                  
                  {/* 개인 생성 일정 표시 */}
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-1 rounded text-white font-medium shadow-sm truncate transition-all
                        ${task.completed ? 'bg-gray-400 opacity-60 line-through' : task.color || 'bg-[#5B88B2]'}
                      `}
                      title={task.title}
                    >
                      {task.completed && <CheckCircle2 className="inline-block w-3 h-3 mr-1 opacity-70" />}
                      {!task.completed && <Circle className="inline-block w-2 h-2 mr-1 opacity-70" />}
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔵 우측 영역: 일일 업무 상세 패널 (Split View) */}
      <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-3xl border border-[#B8C4A9]/30 flex flex-col shadow-soft overflow-hidden">
        {selectedDate ? (
          <>
            <div className="p-6 border-b border-[#B8C4A9]/20 bg-[#F8FAF9]">
              <div className="flex items-center gap-2 text-[#5B88B2] mb-1">
                <CalendarCheck className="w-5 h-5" />
                <span className="font-bold text-sm">일일 업무 관리</span>
              </div>
              <h3 className="text-2xl font-black text-[#2C3E35]">
                {selectedDate.split('-')[1]}월 {selectedDate.split('-')[2]}일
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white custom-scrollbar">
              {selectedNeisSchedules.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-bold text-[#2C3E35]/50 mb-2">🏫 학교 학사일정</div>
                  <div className="space-y-2">
                    {selectedNeisSchedules.map((sch, idx) => (
                      <div key={idx} className="px-3 py-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 font-bold text-sm flex items-center gap-2">
                        <School className="w-4 h-4" />
                        {sch.EVENT_NM}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs font-bold text-[#2C3E35]/50 mb-2">📋 나의 업무 목록</div>
              
              {selectedDayTasks.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-full bg-[#F8FAF9] flex items-center justify-center mx-auto mb-3 text-[#B8C4A9]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#2C3E35]/60">등록된 업무가 없습니다.</p>
                  <p className="text-xs text-[#2C3E35]/40 mt-1">하단에서 새 업무를 추가해보세요.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`group flex items-center justify-between p-3 rounded-xl border transition-all
                        ${task.completed ? 'bg-[#F8FAF9] border-[#B8C4A9]/20 opacity-70' : 'bg-white border-[#B8C4A9]/40 shadow-sm hover:border-[#5B88B2]/50'}
                      `}
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <button 
                          onClick={() => toggleTaskCompletion(task.id)}
                          className={`flex-shrink-0 transition-colors ${task.completed ? 'text-[#6E815C]' : 'text-[#B8C4A9] hover:text-[#5B88B2]'}`}
                        >
                          {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        <span className={`text-sm font-bold truncate transition-all ${task.completed ? 'text-[#2C3E35]/50 line-through' : 'text-[#2C3E35]'}`}>
                          {task.title}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-2"
                        title="업무 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#B8C4A9]/20 bg-[#F8FAF9]">
              <form onSubmit={handleSaveTask} className="relative">
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="새로운 업무를 입력하세요..."
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white border border-[#B8C4A9]/40 outline-none focus:border-[#5B88B2] focus:ring-2 focus:ring-[#5B88B2]/20 text-[#2C3E35] text-sm font-medium transition-all shadow-sm"
                />
                <button 
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#5B88B2] text-white rounded-lg disabled:opacity-50 disabled:bg-[#B8C4A9] hover:bg-[#4A7397] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8FAF9]">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-[#B8C4A9]">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#2C3E35] mb-2">날짜를 선택해주세요</h3>
            <p className="text-xs text-[#2C3E35]/60 font-medium">달력에서 날짜를 클릭하면<br />해당 일의 상세 업무를 관리할 수 있습니다.</p>
          </div>
        )}
      </div>

      {/* NEIS 정보공시 학교 설정 모달 */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3E35]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative border border-[#B8C4A9]/30 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-[#B8C4A9]/20 flex justify-between items-center bg-[#F8FAF9]">
              <h3 className="text-lg font-bold text-[#2C3E35] flex items-center gap-2">
                <School className="w-5 h-5 text-[#5B88B2]" />
                정보공시 학교 설정
              </h3>
              <button onClick={() => setIsSchoolModalOpen(false)} className="text-[#2C3E35]/40 hover:text-[#2C3E35] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col min-h-0">
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
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
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
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold text-[11px] hover:bg-red-100 transition-colors"
                >
                  설정 해제
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 스크롤바 디자인 (global.css에 넣을 수 있지만 컴포넌트 종속성을 위해 style 태그 사용) */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #B8C4A9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6E815C;
        }
      `}} />
    </div>
  );
}
