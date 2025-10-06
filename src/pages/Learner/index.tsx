import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import type { ICourseMock } from '../../services/course/type';
import { CourseCard } from '../../components/CourseCard';
import type { RecommendedCourse } from '../../services/survey/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMySurvey, regenerateRecommendations } from '../../services/survey';
import { Button, Card, Skeleton, Spin } from 'antd';
import { notifyError, notifySuccess } from '../../utils/toastConfig';

export default function BrowseCourses() {
  const queryClient = useQueryClient();
  const [courses, setCourses] = useState<ICourseMock[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<ICourseMock[]>();
  const [selectedLanguage, setSelectedLanguage] = useState<'all'>('all');

  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['mySurvey'],
    queryFn: getMySurvey,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mutate: handleRegenerate, isPending } = useMutation({
    mutationFn: regenerateRecommendations,
    onSuccess: () => {
      notifySuccess('Recommendations regenerated!');
      queryClient.invalidateQueries({ queryKey: ['mySurvey'] });
    },
    onError: () => {
      notifyError('Failed to regenerate recommendations');
    },
  });

  const recommendations = data?.data?.aiRecommendations?.recommendedCourses || [];
  const reasoning = data?.data?.aiRecommendations;

  // 🔄 Convert RecommendedCourse → ICourseMock
  const mapCourse = (course: RecommendedCourse): ICourseMock => ({
    id: course.courseID,
    title: course.courseName,
    description: course.courseDescription,
    language: course.level.toLowerCase(), // or map properly if backend gives language separately
    level: course.level,
    teacherId: 'ai-generated', // placeholder if no teacher info
    teacherName: 'AI Recommendation',
    duration: `${course.estimatedDuration} hours`,
    price: 0, // AI recs may not include price
    createdAt: new Date().toISOString(),
  });

  const initialCourses: ICourseMock[] = recommendations.map(mapCourse);

  useEffect(() => {
    if (initialCourses.length) {
      setCourses(initialCourses);
      setFilteredCourses(initialCourses);
    }
  }, [data]);

  const handleFilter = (language: 'all', search: string) => {
    let filtered = courses;

    if (language !== 'all') {
      filtered = filtered.filter((c) => c.language === language);
    }

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const handleLanguageChange = (language: 'all') => {
    setSelectedLanguage(language);
    handleFilter(language, searchTerm);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    handleFilter(selectedLanguage, value);
  };

  useEffect(() => {
    if (isError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      notifyError((error as any)?.response?.data?.message || 'Failed to fetch survey');
    }
  }, [isError, error]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );

  if (isPending) {
    return (
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header Skeleton */}
        <Skeleton
          active
          title
          paragraph={{ rows: 1 }}
        />

        {/* Filters Skeleton */}
        <Card>
          <Skeleton.Input
            active
            style={{ width: 200, marginRight: 16 }}
          />
          <Skeleton.Input
            active
            style={{ width: 120 }}
          />
        </Card>

        {/* Courses Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <Card key={idx}>
              <Skeleton
                active
                paragraph={{ rows: 3 }}
              />
            </Card>
          ))}
        </div>

        {/* AI Sections Skeleton */}
        <Card>
          <Skeleton
            active
            paragraph={{ rows: 3 }}
          />
        </Card>
        <Card>
          <Skeleton
            active
            paragraph={{ rows: 4 }}
          />
        </Card>
        <Card>
          <Skeleton
            active
            paragraph={{ rows: 5 }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8 flex justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Courses</h1>
          <p className="text-gray-600">Discover language courses from expert teachers</p>
        </div>
        <div>
          <Button
            type="primary"
            loading={isPending}
            onClick={() => handleRegenerate()}
            style={{ marginBottom: 16 }}>
            🔄 Regenerate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Dropdown */}
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as 'all')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <option value="all">All Languages</option>
            <option value="chinese">Chinese</option>
            <option value="japanese">Japanese</option>
            <option value="english">English</option>
          </select>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2 mt-4 items-center">
          <span className="text-sm text-gray-500">Quick filters:</span>
          {['all', 'chinese', 'japanese', 'english'].map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang as 'all')}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
                selectedLanguage === lang
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}>
              {lang === 'all' ? 'All' : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses?.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
          />
        ))}
      </div>

      {/* AI Reasoning */}
      {reasoning?.reasoningExplanation && (
        <Card title="🧠 AI Reasoning">
          <p className="whitespace-pre-line">{reasoning.reasoningExplanation}</p>
        </Card>
      )}

      {/* Learning Path */}
      {reasoning?.learningPath && (
        <Card title="🎯 Learning Path">
          <div className="prose">{reasoning.learningPath}</div>
        </Card>
      )}

      {/* Study Tips */}
      {reasoning?.studyTips && reasoning?.studyTips?.length > 0 && (
        <Card title="💡 Study Tips">
          <ul className="list-disc pl-6 space-y-2">
            {reasoning.studyTips.map((tip: string, idx: number) => (
              <li
                key={idx}
                className="text-gray-700">
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
