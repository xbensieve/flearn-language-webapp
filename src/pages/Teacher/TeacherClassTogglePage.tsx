import React, { useState } from 'react';
import { Segmented } from 'antd';
import { CalendarOutlined, AppstoreOutlined } from '@ant-design/icons';
import TeacherClassCalendarPage from './TeacherClassCalendarPage';
import MyClasses from './MyClasses';

const TeacherClassTogglePage: React.FC = () => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Segmented
          options={[
            { label: 'Lịch', value: 'calendar', icon: <CalendarOutlined /> },
            { label: 'Danh sách', value: 'list', icon: <AppstoreOutlined /> },
          ]}
          value={view}
          onChange={val => setView(val as 'calendar' | 'list')}
          size="large"
        />
      </div>
      <div>
        {view === 'calendar' ? <TeacherClassCalendarPage /> : <MyClasses />}
      </div>
    </div>
  );
};

export default TeacherClassTogglePage;
