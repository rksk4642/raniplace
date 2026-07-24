import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: 실제 DB 연동 및 유저 인증 후 유저의 실제 일정을 ICS 텍스트로 변환하여 리턴해야 합니다.
  // 현재는 바탕화면 달력 위젯 연동 테스트를 위한 더미(Dummy) 데이터를 제공합니다.
  
  const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//raniplace//Calendar Widget//KO
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:달력 위젯 연동 테스트 일정
DTSTART;VALUE=DATE:20260724
DTEND;VALUE=DATE:20260725
DESCRIPTION:실제 DB 연동 후에는 진짜 일정들이 바탕화면에 나타납니다.
END:VEVENT
END:VCALENDAR`;

  return new NextResponse(icsData, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="calendar.ics"',
    },
  });
}
