'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

// 타입 정의
type Task = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color?: string; // e.g., 'bg-[#5B88B2]'
};

export default function CalendarGrid() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // 새 일정 추가 폼 상태
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // LocalStorage 연동 (최초 로드 시)
  useEffect(() => {
    const saved = localStorage.getItem('raniplace_tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // LocalStorage 저장 (일정 변경 시)
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('raniplace_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

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
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-[#F8FAF9] transition-colors text-[#2C3E35]/60">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-[#F8FAF9] transition-colors text-[#2C3E35]/60">
            <ChevronRight className="w-5 h-5" />
          </button>
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
      <div className="grid grid-cols-7 gap-3 auto-rows-[minmax(120px,auto)]">
        {/* 이전 달 빈 칸 */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2 rounded-2xl bg-transparent" />
        ))}
        
        {/* 이번 달 날짜 */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDate(year, month, day);
          const dayTasks = tasks.filter(t => t.date === dateStr);
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
                {dayTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={(e) => handleDeleteTask(e, task.id)}
                    className={`text-xs px-2 py-1.5 rounded-lg text-white font-medium ${task.color} shadow-sm truncate hover:opacity-80 transition-opacity`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3E35]/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
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
              className="w-full px-4 py-3 rounded-xl bg-[#F8FAF9] border border-[#B8C4A9]/30 outline-none focus:border-[#5B88B2] text-[#2C3E35] mb-6 transition-colors"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="flex-1 py-2.5 bg-[#F8FAF9] text-[#2C3E35]/70 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleSaveTask}
                className="flex-1 py-2.5 bg-[#2C3E35] text-white rounded-xl font-medium hover:bg-[#5B88B2] transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
