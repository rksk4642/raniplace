'use client';

import { useState, useEffect } from 'react';
import { 
  Timer, Users, Shuffle, Play, Pause, 
  RotateCcw, Sparkles, Award 
} from 'lucide-react';

export default function ClassPage() {
  // 1. 타이머 상태
  const [secondsLeft, setSecondsLeft] = useState(300); // 기본 5분
  const [isRunning, setIsRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(300);

  // 2. 랜덤 뽑기 상태
  const [totalStudents, setTotalStudents] = useState(25);
  const [pickedStudent, setPickedStudent] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // 3. 모둠 편성 상태
  const [groupCount, setGroupCount] = useState(5);
  const [groups, setGroups] = useState<number[][]>([]);

  // 타이머 효과
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      alert('⏰ 설정한 수업 활동 시간이 종료되었습니다!');
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const setTimerPreset = (secs: number) => {
    setIsRunning(false);
    setInitialSeconds(secs);
    setSecondsLeft(secs);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 학생 랜덤 뽑기
  const pickRandomStudent = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setPickedStudent(null);
    
    let counter = 0;
    const interval = setInterval(() => {
      setPickedStudent(Math.floor(Math.random() * totalStudents) + 1);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        const finalPick = Math.floor(Math.random() * totalStudents) + 1;
        setPickedStudent(finalPick);
        setIsSpinning(false);
      }
    }, 50);
  };

  // 모둠 랜덤 편성
  const generateGroups = () => {
    const students = Array.from({ length: totalStudents }, (_, i) => i + 1);
    // 셔플
    for (let i = students.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [students[i], students[j]] = [students[j], students[i]];
    }

    const result: number[][] = Array.from({ length: groupCount }, () => []);
    students.forEach((student, index) => {
      result[index % groupCount].push(student);
    });

    setGroups(result);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#2C3E35]">수업 도구 모음</h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#6E815C]/10 text-[#6E815C] font-bold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>자유 열람 및 즉시 사용 가능</span>
        </div>
      </div>

        {/* 3대 교실 수업 도구 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 도구 1: 수업 활동 타이머 */}
          <div className="bg-white rounded-3xl p-7 border border-[#B8C4A9]/30 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6E815C]/10 text-[#6E815C] flex items-center justify-center font-bold">
                  <Timer className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-[#6E815C] bg-[#6E815C]/10 px-2.5 py-1 rounded-full">
                  활동 타이머
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#2C3E35] mb-2">수업 활동 타이머</h3>
              <p className="text-xs text-[#2C3E35]/70 leading-relaxed mb-6">
                모둠 활동, 발표 준비, 문제 풀이 시간을 화면에 직관적으로 띄워 학생들의 시간 관리 역량을 키워줍니다.
              </p>

              {/* 프리셋 버튼 */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[
                  { label: '3분', secs: 180 },
                  { label: '5분', secs: 300 },
                  { label: '10분', secs: 600 },
                  { label: '20분', secs: 1200 },
                ].map((preset) => (
                  <button
                    key={preset.secs}
                    onClick={() => setTimerPreset(preset.secs)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      initialSeconds === preset.secs && !isRunning
                        ? 'bg-[#6E815C] text-white shadow-sm'
                        : 'bg-[#F8FAF9] text-[#2C3E35]/70 hover:bg-[#B8C4A9]/20'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* 디스플레이 */}
              <div className="bg-[#F8FAF9] p-6 rounded-3xl border border-[#B8C4A9]/20 text-center mb-6 relative overflow-hidden">
                <div className="text-5xl font-black tracking-tight font-mono text-[#2C3E35] my-2">
                  {formatTime(secondsLeft)}
                </div>
                <div className="text-[11px] text-[#2C3E35]/50 font-semibold">
                  {isRunning ? '🟢 타이머 작동 중...' : '⏸️ 일시 정지됨'}
                </div>
              </div>
            </div>

            {/* 타이머 컨트롤 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
                  isRunning 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'bg-[#6E815C] hover:bg-[#59694A] text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? '일시정지' : '시작하기'}</span>
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setSecondsLeft(initialSeconds);
                }}
                className="px-4 py-3.5 rounded-2xl bg-[#F8FAF9] hover:bg-[#B8C4A9]/20 text-[#2C3E35] font-bold text-xs transition-colors flex items-center justify-center"
                title="초기화"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 도구 2: 행운의 발표자 뽑기 */}
          <div className="bg-white rounded-3xl p-7 border border-[#B8C4A9]/30 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#5B88B2]/10 text-[#5B88B2] flex items-center justify-center font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-[#5B88B2] bg-[#5B88B2]/10 px-2.5 py-1 rounded-full">
                  랜덤 뽑기
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#2C3E35] mb-2">행운의 발표자 선정</h3>
              <p className="text-xs text-[#2C3E35]/70 leading-relaxed mb-6">
                우리 반 전체 인원수에서 공정하고 흥미진진하게 발표자나 오늘의 학급 도우미를 무작위로 추첨합니다.
              </p>

              {/* 학생 수 설정 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#B8C4A9]/20 mb-6">
                <span className="text-xs font-bold text-[#2C3E35]">우리 반 전체 학생 수</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={totalStudents}
                    onChange={(e) => setTotalStudents(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center py-1 rounded-lg bg-white border border-[#B8C4A9]/40 text-xs font-bold outline-none text-[#5B88B2]"
                  />
                  <span className="text-xs font-bold text-[#2C3E35]/60">명</span>
                </div>
              </div>

              {/* 뽑기 결과 화면 */}
              <div className="bg-gradient-to-br from-[#5B88B2]/10 to-[#A0C4E2]/10 p-6 rounded-3xl border border-[#5B88B2]/20 text-center mb-6 min-h-[140px] flex flex-col items-center justify-center relative">
                {pickedStudent !== null ? (
                  <div className="animate-in zoom-in-75 duration-200">
                    <div className="text-xs font-bold text-[#5B88B2] mb-1">
                      {isSpinning ? '🎲 추첨 중...' : '🎉 오늘의 주인공! 🎉'}
                    </div>
                    <div className="text-4xl font-black text-[#2C3E35]">
                      <span className="text-[#5B88B2]">{pickedStudent}</span>번 학생
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-[#2C3E35]/40">
                    아래 버튼을 눌러 발표자를 추첨해보세요!
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={pickRandomStudent}
              disabled={isSpinning}
              className="w-full py-3.5 rounded-2xl bg-[#5B88B2] hover:bg-[#4A7397] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? '추첨 진행 중...' : '🍀 행운의 발표자 뽑기'}</span>
            </button>
          </div>

          {/* 도구 3: 랜덤 모둠 구성기 */}
          <div className="bg-white rounded-3xl p-7 border border-[#B8C4A9]/30 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  모둠 편성
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#2C3E35] mb-2">스마트 모둠 편성기</h3>
              <p className="text-xs text-[#2C3E35]/70 leading-relaxed mb-6">
                학생 번호를 원하는 모둠 수에 맞게 균등하게 자동 배치하여 빠르고 공정한 협동 학습 환경을 구성합니다.
              </p>

              {/* 모둠 수 설정 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#B8C4A9]/20 mb-6">
                <span className="text-xs font-bold text-[#2C3E35]">구성할 모둠 수</span>
                <div className="flex gap-1.5">
                  {[4, 5, 6].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setGroupCount(cnt)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        groupCount === cnt
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-white text-[#2C3E35]/70 border border-[#B8C4A9]/30 hover:border-amber-500'
                      }`}
                    >
                      {cnt}모둠
                    </button>
                  ))}
                </div>
              </div>

              {/* 모둠 결과 목록 */}
              <div className="bg-[#F8FAF9] p-4 rounded-3xl border border-[#B8C4A9]/20 mb-6 max-h-[170px] overflow-y-auto space-y-2">
                {groups.length === 0 ? (
                  <div className="py-8 text-center text-xs font-bold text-[#2C3E35]/40">
                    아래 버튼을 눌러 모둠을 자동 편성하세요.
                  </div>
                ) : (
                  groups.map((group, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white border border-[#B8C4A9]/20 flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-600">{idx + 1}모둠</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {group.map((num) => (
                          <span key={num} className="px-1.5 py-0.5 rounded bg-[#F8FAF9] font-mono font-bold text-[#2C3E35]">
                            {num}번
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={generateGroups}
              className="w-full py-3.5 rounded-2xl bg-[#2C3E35] hover:bg-[#3A5246] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>🚀 랜덤 모둠 자동 편성하기</span>
            </button>
          </div>

        </div>

    </div>
  );
}
