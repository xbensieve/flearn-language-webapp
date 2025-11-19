import { Card, Typography } from 'antd';
import React from 'react';

const { Title } = Typography;

// Reusable Section Card
const InfoSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <Card
    className='mb-6 shadow-sm border border-gray-200 rounded-xl hover:shadow-md transition-shadow'
    bodyStyle={{ padding: '20px' }}
  >
    <div className='flex items-center gap-3 mb-4'>
      <div className='w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600'>
        {icon}
      </div>
      <Title level={4} className='m-0 text-gray-800 font-semibold'>
        {title}
      </Title>
    </div>
    {children}
  </Card>
);

export default InfoSection;
