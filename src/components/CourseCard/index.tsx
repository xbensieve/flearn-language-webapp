import { Card, Tag } from 'antd';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import type { ICourseMock, ILanguageMock } from '../../services/course/type';

interface CourseCardProps {
  course: ICourseMock;
  onClick?: () => void;
}

const languageConfig = {
  chinese: { label: '中文', color: 'hsl(var(--chinese))' },
  japanese: { label: '日本語', color: 'hsl(var(--japanese))' },
  english: { label: 'English', color: 'hsl(var(--english))' },
};

interface LanguageBadgeProps {
  language: ILanguageMock;
}

export const LanguageBadge = ({ language }: LanguageBadgeProps) => {
  const config = languageConfig[language];

  return (
    <Tag
      color={config.color}
      className="rounded-full px-3 py-1 font-medium">
      {config.label}
    </Tag>
  );
};

export const CourseCard = ({ course, onClick }: CourseCardProps) => {
  return (
    <Card
      hoverable
      onClick={onClick}
      className="h-full overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl"
      style={{ boxShadow: 'var(--shadow-card)' }}
      cover={
        <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <span className="text-6xl opacity-30">
            {course.language === 'chinese' && '中'}
            {course.language === 'japanese' && '日'}
            {course.language === 'english' && 'EN'}
          </span>
        </div>
      }>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">{course.title}</h3>
          <LanguageBadge language={course.language} />
        </div>

        <p className="text-muted-foreground line-clamp-2 text-sm">{course.description}</p>

        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <UserOutlined />
            <span>{course.teacherName}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockCircleOutlined />
            <span>{course.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {course.level}
          </span>
          <span className="text-xl font-bold text-primary">${course.price}</span>
        </div>
      </div>
    </Card>
  );
};
