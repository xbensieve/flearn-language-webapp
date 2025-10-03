import { Card, Tag } from 'antd';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import type { ICourseMock } from '../../services/course/type';

interface CourseCardProps {
  course: ICourseMock;
  onClick?: () => void;
}

const languageConfig: Record<string, { label: string; color: string }> = {
  chinese: { label: '中文', color: 'var(--chinese)' },
  japanese: { label: '日本語', color: 'var(--japanese)' },
  english: { label: 'English', color: 'var(--english)' },
};

interface LanguageBadgeProps {
  language: string;
}

export const LanguageBadge = ({ language }: LanguageBadgeProps) => {
  const config = languageConfig[language] || { label: language, color: '#d9d9d9' };

  return (
    <Tag
      style={{
        backgroundColor: config.color,
        color: '#fff',
        borderRadius: '9999px',
        padding: '2px 10px',
        fontWeight: 500,
      }}>
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
        {/* Title + Badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">{course.title}</h3>
          <LanguageBadge language={course.language} />
        </div>

        {/* Description */}
        <p className="text-muted-foreground line-clamp-2 text-sm">{course.description}</p>

        {/* Teacher + Duration */}
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

        {/* Level + Price */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {course.level}
          </span>
          <span className="text-xl font-bold text-primary">
            {course.price > 0 ? `$${course.price}` : 'Free'}
          </span>
        </div>
      </div>
    </Card>
  );
};
