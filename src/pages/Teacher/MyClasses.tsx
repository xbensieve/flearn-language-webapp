import React, { useState, useMemo } from 'react';
import { Card, Button, Typography, Row, Col, Select, Empty, Tag, Tooltip, Segmented, Pagination } from 'antd';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getClassesService } from '../../services/class';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, AppstoreOutlined, CalendarOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { vi } from 'date-fns/locale';
import dayjs from 'dayjs';
import CreateClassForm from './components/CreateClassForm';

const { Title, Text } = Typography;
const { Option } = Select;

const locales = { vi };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

const statusOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'Published', label: 'Đã xuất bản' },
  { value: 'Draft', label: 'Bản nháp' },
  { value: 'InProgress', label: 'Đang diễn ra' },
  { value: 'Finished', label: 'Đã kết thúc' },
  { value: 'PendingCancel', label: 'Chờ hủy' },
  { value: 'Cancelled', label: 'Đã hủy' },
  { value: 'Cancelled_InsufficientStudents', label: 'Hủy (Thiếu HV)' },
];

const MyClasses: React.FC = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('Published');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['all-classes-calendar'],
    queryFn: () => getClassesService({ page: 1, pageSize: 100 }),
  });
  
  const classes = data?.data || [];
  
  const filteredClasses = useMemo(() => {
    if (filterStatus === 'ALL') return classes;
    return classes.filter((c: any) => (c.status || '') === filterStatus);
  }, [classes, filterStatus]);

  const events = useMemo(() => {
    return filteredClasses
      .map((cls: any) => ({
        id: cls.classID,
        title: cls.title,
        start: new Date(cls.startDateTime),
        end: new Date(cls.endDateTime),
        status: cls.status,
        resource: cls,
      }));
  }, [filteredClasses]);

  const eventStyleGetter = (event: any) => {
    let bg = '#6b7280'; // gray-500
    let border = '#4b5563';
    
    const status = (event.status || '').toLowerCase();
    
    if (status === 'published') {
      bg = '#10b981'; // emerald-500
      border = '#059669';
    } else if (status === 'draft') {
      bg = '#94a3b8'; // slate-400
      border = '#64748b';
    } else if (status === 'inprogress') {
      bg = '#3b82f6'; // blue-500
      border = '#2563eb';
    } else if (status === 'finished') {
      bg = '#6366f1'; // indigo-500
      border = '#4f46e5';
    } else if (status === 'pendingcancel') {
      bg = '#f97316'; // orange-500
      border = '#ea580c';
    } else if (status.includes('cancelled')) {
      bg = '#ef4444'; // red-500
      border = '#dc2626';
    }

    return {
      style: {
        backgroundColor: bg,
        borderColor: border,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.85rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textDecoration: status.includes('cancelled') ? 'line-through' : 'none',
      },
    };
  };

  const EventComponent: React.FC<{ event: any }> = ({ event }) => {
    return (
      <Tooltip title={`${event.title} (${event.status})`}>
        <div className="flex flex-col h-full justify-center px-1 overflow-hidden">
          <div className="font-semibold text-xs truncate">{event.title}</div>
          <div className="text-[10px] opacity-90 truncate flex items-center gap-1">
             {dayjs(event.start).format('HH:mm')} - {dayjs(event.end).format('HH:mm')}
          </div>
        </div>
      </Tooltip>
    );
  };

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => toolbar.onNavigate('PREV');
    const goToNext = () => toolbar.onNavigate('NEXT');
    const goToCurrent = () => toolbar.onNavigate('TODAY');

    return (
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={goToBack}>Trước</Button>
          <Button type="primary" onClick={goToCurrent} className="font-semibold">Hôm nay</Button>
          <Button onClick={goToNext}>Sau</Button>
        </div>
        <span className="text-xl font-bold text-gray-700 capitalize">
          {toolbar.label}
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val);
              setCurrentPage(1);
            }}
            style={{ width: 180 }}
            className="font-medium"
          >
            {statusOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
          </Select>
        </div>
      </div>
    );
  };

  const today = new Date();
  const todayEvents = events.filter((ev: any) => isSameDay(ev.start, today));

  const getStatusColorClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'published') return 'bg-emerald-500';
    if (s === 'draft') return 'bg-slate-400';
    if (s === 'inprogress') return 'bg-blue-500';
    if (s === 'finished') return 'bg-indigo-500';
    if (s === 'pendingcancel') return 'bg-orange-500';
    if (s.includes('cancelled')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getStatusConfig = (status: string) => {
    const s = (status || '').toLowerCase();
    const config: Record<string, { color: string; bg: string; label: string }> = {
      published: { color: 'text-emerald-700 border-emerald-200', bg: '!bg-emerald-100', label: 'Đã xuất bản' },
      draft: { color: 'text-gray-600 border-gray-200', bg: '!bg-gray-200', label: 'Bản nháp' },
      inprogress: { color: 'text-blue-700 border-blue-200', bg: '!bg-blue-100', label: 'Đang diễn ra' },
      finished: { color: 'text-indigo-700 border-indigo-200', bg: '!bg-indigo-100', label: 'Đã kết thúc' },
      pendingcancel: { color: 'text-orange-700 border-orange-200', bg: '!bg-orange-100', label: 'Chờ hủy' },
      cancelled: { color: 'text-red-700 border-red-200', bg: '!bg-red-100', label: 'Đã hủy' },
    };
    
    if (s.includes('cancelled') && !config[s]) return config.cancelled;
    return config[s] || { color: 'text-gray-700 border-gray-200', bg: '!bg-gray-100', label: status };
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Title level={2} className="!mb-1 !text-gray-800">Lịch giảng dạy</Title>
            <Text className="text-gray-500">Quản lý thời gian và lịch trình các lớp học của bạn</Text>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {viewMode === 'list' && (
              <Select
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val);
                  setCurrentPage(1);
                }}
                style={{ width: 180 }}
                className="font-medium"
              >
                {statusOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
              </Select>
            )}
            <Segmented
              options={[
                { label: 'Lịch', value: 'calendar', icon: <CalendarOutlined /> },
                { label: 'Danh sách', value: 'list', icon: <AppstoreOutlined /> },
              ]}
              value={viewMode}
              onChange={(val) => setViewMode(val as 'calendar' | 'list')}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large"
              onClick={() => setIsCreateModalVisible(true)}
              className="bg-blue-600 hover:bg-blue-700 border-none shadow-md shadow-blue-200 rounded-lg"
            >
              Tạo lớp học mới
            </Button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <Row gutter={[24, 24]}>
          <Col xs={24} xl={18}>
            <Card className="rounded-2xl shadow-sm border-gray-200 h-full" bodyStyle={{ padding: '20px', height: '100%' }}>
              <div className="h-[700px]">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  eventPropGetter={eventStyleGetter}
                  components={{ event: EventComponent, toolbar: CustomToolbar }}
                  views={['month', 'week', 'day', 'agenda']}
                  defaultView={Views.MONTH}
                  popup
                  messages={{
                    today: 'Hôm nay',
                    previous: 'Trước',
                    next: 'Sau',
                    month: 'Tháng',
                    week: 'Tuần',
                    day: 'Ngày',
                    agenda: 'Lịch trình',
                    date: 'Ngày',
                    time: 'Thời gian',
                    event: 'Sự kiện',
                    noEventsInRange: 'Không có lớp học nào trong khoảng thời gian này.',
                  }}
                  onSelectEvent={(event: any) => navigate(`/teacher/classes/${event.id}`)}
                />
              </div>
            </Card>
          </Col>
          
          <Col xs={24} xl={6}>
            <div className="flex flex-col gap-6 h-full">
              {/* Today's Schedule */}
              <Card 
                title={<div className="flex items-center gap-2"><span className="font-bold">Lịch hôm nay</span></div>}
                className="rounded-2xl shadow-sm border-gray-200 flex-1"
                headStyle={{ borderBottom: '1px solid #f0f0f0' }}
              >
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-800">{dayjs().format('DD')}</div>
                  <div className="text-gray-500 uppercase font-medium tracking-wide">{dayjs().format('MMMM, YYYY')}</div>
                  <div className="text-blue-600 font-medium mt-1">{dayjs().format('dddd')}</div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  {todayEvents.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có lớp học nào hôm nay" />
                  ) : (
                    todayEvents.map((ev: any) => {
                      const st = getStatusConfig(ev.status);
                      return (
                        <div 
                          key={ev.id} 
                          className="group p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                          onClick={() => navigate(`/teacher/classes/${ev.id}`)}
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColorClass(ev.status)}`}></div>
                          <div className="pl-2">
                            <div className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-1">{ev.title}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              {dayjs(ev.start).format('HH:mm')} - {dayjs(ev.end).format('HH:mm')}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                               <Tag className="m-0 text-[10px] border-0 bg-white shadow-sm">
                                 {ev.resource.languageName}
                               </Tag>
                               <Tag className={`m-0 text-[10px] border ${st.bg} ${st.color}`}>
                                 {st.label}
                               </Tag>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>

              {/* Legend / Stats */}
              <Card className="rounded-2xl shadow-sm border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-gray-600">Đã xuất bản</span>
                    </div>
                    <span className="font-semibold text-gray-800">{classes.filter((c: any) => c.status === 'Published').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                      <span className="text-gray-600">Đã kết thúc</span>
                    </div>
                    <span className="font-semibold text-gray-800">{classes.filter((c: any) => c.status === 'Finished').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span className="text-gray-600">Đang diễn ra</span>
                    </div>
                    <span className="font-semibold text-gray-800">{classes.filter((c: any) => c.status === 'InProgress').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                      <span className="text-gray-600">Chờ hủy</span>
                    </div>
                    <span className="font-semibold text-gray-800">{classes.filter((c: any) => c.status === 'PendingCancel').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                      <span className="text-gray-600">Bản nháp</span>
                    </div>
                    <span className="font-semibold text-gray-800">{classes.filter((c: any) => c.status === 'Draft').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="text-gray-600">Đã hủy</span>
                    </div>
                    <span className="font-semibold text-gray-800">{classes.filter((c: any) => c.status && c.status.includes('Cancelled')).length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredClasses.length === 0 ? (
              <Col span={24} className="min-h-[400px]">
                <Empty description="Không tìm thấy lớp học nào" className="py-20" />
              </Col>
            ) : (
              <>
              {filteredClasses.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((cls: any) => {
                const st = getStatusConfig(cls.status);

                return (
                  <Col key={cls.classID} xs={24} sm={12} lg={8} xl={6}>
                    <Card
                      hoverable
                      className="h-full rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col"
                      bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
                      onClick={() => navigate(`/teacher/classes/${cls.classID}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Tag className={`m-0 border font-medium px-2.5 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                          {st.label}
                        </Tag>
                        <Tag className="m-0 bg-indigo-50 text-indigo-600 border-indigo-100 font-medium">
                          {cls.languageName}
                        </Tag>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                        {cls.title}
                      </h3>
                      
                      <div className="space-y-2 mb-4 flex-1">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <CalendarOutlined />
                          <span>{dayjs(cls.startDateTime).format('DD/MM/YYYY')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <ClockCircleOutlined />
                          <span>{dayjs(cls.startDateTime).format('HH:mm')} - {dayjs(cls.endDateTime).format('HH:mm')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <UserOutlined />
                          <span>{cls.currentEnrollments}/{cls.capacity} Học viên</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                        <span className="text-gray-400 text-xs">Học phí</span>
                        <span className="font-bold text-blue-600 text-lg">
                          {(cls.pricePerStudent || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </Card>
                  </Col>
                );
              })}
              <Col span={24} className="flex justify-center mt-8 pb-8">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredClasses.length}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                />
              </Col>
              </>
            )}
          </Row>
        )}

        <CreateClassForm
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onCreated={() => refetch()}
        />
      </div>
    </div>
  );
};

export default MyClasses;