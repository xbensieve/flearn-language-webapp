import React from 'react';
import { Card, Button, Typography, Row, Col } from 'antd';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getClassesService } from '../../services/class';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

import { vi } from 'date-fns/locale';

const locales = { vi };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

const eventStyleGetter = (event: any) => {
  let bg = '#8b5cf6';
  if (event.status === 'Published') bg = '#10b981';
  if (event.status === 'Draft') bg = '#f59e42';
  if (event.status === 'Cancelled') bg = '#ef4444';
  return {
    style: {
      backgroundColor: bg,
      borderRadius: '12px',
      color: 'white',
      border: 'none',
      display: 'block',
      fontWeight: 600,
      fontSize: 15,
      boxShadow: '0 2px 8px #0001',
    },
  };
};

const TeacherClassCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  // Lấy tất cả lớp học (có thể phân trang lớn hơn nếu cần)
  const { data, isLoading } = useQuery({
    queryKey: ['all-classes-calendar'],
    queryFn: () => getClassesService({ page: 1, pageSize: 100 }),
  });
  const classes = data?.data || [];

  // Map class data thành event cho calendar
  // Only show published classes on calendar
  const published = classes.filter((c: any) => (c.status || '').toString().toLowerCase() === 'published');

  const classEvents = published.map((cls: any) => ({
    id: cls.classID,
    title: cls.title,
    start: new Date(cls.startDateTime),
    end: new Date(cls.endDateTime),
    status: cls.status,
    raw: cls,
  }));

  const EventComponent: React.FC<{ event: any }> = ({ event }) => {
    return (
      <div className="flex flex-col">
        <div className="font-semibold truncate">{event.title}</div>
        <div className="text-xs opacity-80 truncate">{event.raw.languageName} • {(event.raw.pricePerStudent || 0).toLocaleString('vi-VN')} đ</div>
      </div>
    );
  };

  // Today Schedule
  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const todayEvents = classEvents.filter(ev => isSameDay(ev.start, today));

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50 overflow-x-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 min-h-screen">
        <div className="mb-10">
          <div className="text-2xl font-bold text-violet-700 mb-2">&nbsp;</div>
          <input className="w-full rounded-xl border px-3 py-2 mt-2" placeholder="Tìm kiếm..." />
        </div>
        <nav className="flex-1 space-y-2">
          <Button type="text" className="w-full text-left">Tổng quan</Button>
          <Button type="text" className="w-full text-left font-bold bg-violet-50">Lịch</Button>
          <Button type="text" className="w-full text-left">Bài tập</Button>
          <Button type="text" className="w-full text-left">Tin nhắn</Button>
        </nav>
        <div className="mt-auto space-y-2">
          <Button type="text" className="w-full text-left">Cài đặt</Button>
          <Button type="text" className="w-full text-left">Trợ giúp</Button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <Title level={2} className="!mb-0">Lịch</Title>
          <Button type="primary" className="bg-violet-600 h-12 px-8 rounded-xl font-bold" onClick={() => navigate('/teacher/classes/create')}>+ Tạo lớp mới</Button>
        </div>
        <Row gutter={32}>
          <Col flex="auto">
            <Card className="rounded-2xl shadow-xl min-h-[600px] overflow-hidden">
              <div className="w-full overflow-auto">
                {isLoading ? 'Đang tải...' : (
                  <div style={{ width: '100%' }}>
                    <Calendar
                      localizer={localizer}
                      events={classEvents}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: 620, borderRadius: 16, background: 'white', width: '100%' }}
                      eventPropGetter={eventStyleGetter}
                      popup
                      defaultView="week"
                      views={['month', 'week', 'day']}
                      components={{ event: EventComponent }}
                      messages={{
                        today: 'Hôm nay',
                        previous: 'Trước',
                        next: 'Tiếp',
                        month: 'Tháng',
                        week: 'Tuần',
                        day: 'Ngày',
                        agenda: 'Danh sách',
                      }}
                      onSelectEvent={(event: any) => navigate(`/teacher/classes/${event.id}`)}
                    />
                  </div>
                )}
              </div>
            </Card>
          </Col>
          <Col flex="320px">
            <Card className="rounded-2xl shadow-xl mb-6">
              {/* Mini calendar có thể dùng lại react-big-calendar hoặc Antd Calendar */}
              <div className="mb-4 font-bold text-gray-700">Lịch nhỏ</div>
              {/* Đơn giản: chỉ show tháng hiện tại */}
              <div className="text-center text-lg font-semibold text-violet-700 mb-2">{today.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}</div>
              <div className="flex justify-center">
                <div className="bg-violet-50 rounded-xl p-4 text-gray-700">{today.toLocaleDateString('vi-VN')}</div>
              </div>
            </Card>
            <Card className="rounded-2xl shadow-xl">
              <div className="mb-4 font-bold text-gray-700">Lịch hôm nay</div>
              {todayEvents.length === 0 ? (
                <div className="text-gray-400">Không có lớp nào hôm nay.</div>
              ) : (
                todayEvents.map(ev => (
                  <div key={ev.id} className="mb-4 p-3 rounded-xl border-l-4 shadow-sm cursor-pointer hover:bg-violet-50" style={{ borderColor: eventStyleGetter(ev).style.backgroundColor }} onClick={() => navigate(`/teacher/classes/${ev.id}`)}>
                    <div className="font-semibold text-base text-gray-800">{ev.title}</div>
                    <div className="text-xs text-gray-500">{ev.start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {ev.end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))
              )}
            </Card>
          </Col>
        </Row>
      </main>
    </div>
  );
};

export default TeacherClassCalendarPage;
