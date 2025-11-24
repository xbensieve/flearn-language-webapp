import React from 'react';
import { Card, Tag, Skeleton } from 'antd';
import { UserOutlined, StarFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/axios';

interface Course {
  courseId: string;
  title: string;
  teacherName: string;
  price: number;
  averageRating: number;
  reviewCount: number;
  learnerCount: number;
  imageUrl: string;
  programName: string;
  proficiencyCode: string;
}

const fetchPopularCourses = async (): Promise<Course[]> => {
  const { data } = await api.get('/courses/popular?count=12');
  return data.data;
};

const PopularCourse: React.FC = () => {
  const {
    data: courses,
    isLoading,
    isError,
  } = useQuery<Course[]>({
    queryKey: ['popular-courses'],
    queryFn: fetchPopularCourses,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  if (isError) {
    return (
      <section className='py-24 bg-gradient-to-b from-sky-50 via-white to-sky-100'>
        <div className='max-w-7xl mx-auto px-6 text-center'>
          <p className='text-xl text-gray-600'>
            Không thể tải khóa học nổi bật. Vui lòng thử lại sau.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className='relative py-24 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-sky-100'>
      {/* ── Hiệu ứng nền đẹp lung linh (giống Hero & Features) ── */}
      <div className='absolute inset-0 opacity-30 pointer-events-none'>
        <div className='absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-cyan-300 to-sky-500 rounded-full blur-3xl animate-pulse animation-delay-2000'></div>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-sky-200/20 via-transparent to-blue-200/20 blur-3xl'></div>
      </div>

      <div className='relative z-10 max-w-7xl mx-auto px-6'>
        {/* Header – Siêu bắt mắt */}
        <div className='text-center mb-16 space-y-6'>
          <div className='inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-lg shadow-2xl shadow-sky-500/30 animate-pulse'>
            <StarFilled className='text-yellow-300' />
            Khóa Học Được Yêu Thích Nhất
            <StarFilled className='text-yellow-300' />
          </div>

          <h2 className='text-5xl md:text-6xl font-bold text-gray-900 leading-tight'>
            Khóa Học Nổi Bật
            <span className='block bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent'>
              Đang Làm Mưa Làm Gió
            </span>
          </h2>

          <p className='text-xl text-gray-600 max-w-4xl mx-auto font-light'>
            Hàng ngàn học viên đã thay đổi cuộc đời nhờ những khóa học được thiết kế bởi{' '}
            <span className='font-bold text-sky-600'>các chuyên gia hàng đầu</span>
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
            {[...Array(8)].map((_, i) => (
              <Card key={i} className='rounded-3xl overflow-hidden shadow-xl border-0'>
                <Skeleton.Image className='w-full h-56 rounded-t-3xl' />
                <div className='p-6'>
                  <Skeleton active paragraph={{ rows: 4 }} title={false} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Courses Grid – Đỉnh cao thiết kế */}
        {courses && courses.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
            {courses.map((course, index) => (
              <div
                key={course.courseId}
                className='group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-sky-300 hover:-translate-y-4'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hiệu ứng viền sáng khi hover */}
                <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'></div>

                {/* Image */}
                <div className='relative overflow-hidden'>
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className='w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700'
                    loading='lazy'
                  />

                  {/* Badges tuyệt đẹp */}
                  <div className='absolute top-4 left-4 flex flex-col gap-2'>
                    <Tag
                      color='green'
                      className='font-bold text-xs px-4 py-1.5 rounded-full shadow-lg border border-white/30 backdrop-blur-sm'
                    >
                      {course.proficiencyCode}
                    </Tag>
                  </div>

                  <div className='absolute top-4 right-4'>
                    {course.price === 0 ? (
                      <Tag className='font-bold text-sm px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg border-0'>
                        MIỄN PHÍ
                      </Tag>
                    ) : (
                      <Tag className='font-bold text-sm px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg border-0'>
                        {course.price.toLocaleString('vi-VN')}đ
                      </Tag>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className='p-6 space-y-4 relative z-10 bg-gradient-to-b from-white to-sky-50/30'>
                  <div className='text-xs font-bold text-sky-600 uppercase tracking-wider'>
                    {course.programName}
                  </div>

                  <h3 className='font-bold text-xl text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors'>
                    {course.title}
                  </h3>

                  <p className='text-sm text-gray-600'>
                    Giảng viên:{' '}
                    <span className='font-semibold text-gray-800'>{course.teacherName}</span>
                  </p>

                  {/* Stats */}
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-2'>
                      <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => (
                          <StarFilled
                            key={i}
                            className={`text-lg ${
                              i < Math.floor(course.averageRating || 0)
                                ? '!text-yellow-500'
                                : '!text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className='font-bold text-gray-700'>
                        {course.averageRating > 0 ? course.averageRating.toFixed(1) : 'Mới'}
                      </span>
                      <span className='text-gray-500'>({course.reviewCount})</span>
                    </div>

                    <div className='flex items-center gap-1 text-gray-600'>
                      <UserOutlined className='text-lg' />
                      <span className='font-bold'>{course.learnerCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className='px-6 pb-6'>
                  <a
                    href={`/course/${course.courseId}`}
                    className='block w-full text-center bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold py-4 rounded-2xl hover:shadow-2xl transition-all hover:scale-105 hover:from-sky-700 hover:to-blue-700'
                  >
                    Xem Chi Tiết
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button – Siêu nổi bật */}
        <div className='text-center mt-16'>
          <a
            href='/courses'
            className='group inline-flex items-center gap-4 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-xl px-12 py-6 rounded-full hover:shadow-2xl transition-all hover:scale-105 hover:from-sky-700 hover:to-blue-700'
          >
            Xem Tất Cả Khóa Học
            <svg
              className='w-7 h-7 group-hover:translate-x-2 transition-transform'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={3}
                d='M13 5l7 7-7 7M5 5l7 7-7 7'
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default PopularCourse;
