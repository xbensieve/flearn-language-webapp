import React from 'react';
import { Empty, Spin } from 'antd';
import type { Unit } from '../../../services/course/type';
import { useLessons } from '../helpers';
import LessonItem from './LessonItem';

const LessonsList: React.FC<{ unit: Unit }> = ({ unit }) => {
  const { lessons, isLoading, refetch } = useLessons(unit.courseUnitID);

  if (isLoading)
    return (
      <div className='flex justify-center py-6'>
        <Spin size='large' />
      </div>
    );

  if (!lessons.length)
    return (
      <Empty description='No lessons yet' image={Empty.PRESENTED_IMAGE_SIMPLE} className='py-6' />
    );

  return (
    <div className='flex flex-col gap-3'>
      {lessons.map((lesson) => (
        <LessonItem key={lesson.lessonID} lesson={lesson} onUpdated={refetch} />
      ))}
    </div>
  );
};

export default LessonsList;
