import React from "react";
import { Empty, Spin } from "antd";
import type { Unit } from "../../../services/course/type";
import { useLessons } from "../helpers";
import LessonItem from "./LessonItem";
const LessonsList: React.FC<{
  unit: Unit;
  onDeleted: (id: string) => void;
}> = ({ unit, onDeleted }) => {
  const { lessons, isLoading, refetch } = useLessons(unit.courseUnitID);

  if (isLoading)
    return (
      <div className="flex justify-center py-6">
        <Spin size="large" />
      </div>
    );

  if (!lessons.length)
    return (
      <Empty
        description="Chưa có bài học nào trong chương này"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-6"
      />
    );

  return (
    <div className="flex flex-col gap-3">
      {lessons.map((lesson) => (
        <LessonItem
          key={lesson.lessonID}
          lesson={lesson}
          onUpdated={refetch}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  );
};

export default LessonsList;
