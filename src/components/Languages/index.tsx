import { Globe2, ArrowRight } from 'lucide-react';

const languages = [
  { name: 'Tiếng Anh', learners: 'Hơn 1.5 tỷ', flag: 'US', popular: true },
  { name: 'Tiếng Nhật', learners: '890K+', flag: 'JP' },
  { name: 'Tiếng Trung', learners: '1.1 triệu+', flag: 'CN' },
];

const Languages = () => {
  return (
    <section className='relative py-24 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-sky-100'>
      {/* Bản đồ thế giới hiệu ứng nhẹ */}
      <div className='absolute inset-0 opacity-10 pointer-events-none'>
        <svg
          viewBox='0 0 1200 800'
          className='w-full h-full animate-pulse'
          fill='none'
          stroke='url(#mapGradient)'
          strokeWidth='1.5'
        >
          <defs>
            <linearGradient id='mapGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stopColor='#38bdf8' />
              <stop offset='100%' stopColor='#0ea5e9' />
            </linearGradient>
          </defs>
          <path d='M100 200 Q300 100 500 250 T900 300 Q1100 400 1000 550 T600 650 Q300 600 100 500 Z' />
          <circle cx='320' cy='280' r='80' />
          <circle cx='780' cy='420' r='100' />
        </svg>
      </div>

      {/* Hiệu ứng ánh sáng nền */}
      <div className='absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-3xl opacity-20 animate-pulse' />
      <div className='absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-cyan-300 to-sky-400 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-2000' />

      <div className='container mx-auto px-4 relative z-10'>
        {/* Header */}
        <div className='text-center mb-16 space-y-4'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg'>
            <Globe2 className='h-5 w-5' />
            <span>3 Ngôn Ngữ Đang Có Mặt</span>
          </div>

          {/* Tiêu đề */}
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight'>
            Học Ngoại Ngữ Bạn{' '}
            <span className='bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent'>
              Yêu Thích
            </span>
          </h2>

          {/* Phụ đề */}
          <p className='text-xl text-gray-600 max-w-2xl mx-auto font-light'>
            Từ tiếng Anh, tiếng Nhật đến tiếng Trung — chinh phục bất kỳ ngôn ngữ nào với{' '}
            <span className='font-bold text-sky-600'>khóa học toàn diện</span> của chúng tôi
          </p>
        </div>

        {/* Grid ngôn ngữ */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center'>
          {languages.map((lang, i) => (
            <div
              key={i}
              className='group relative w-full max-w-xs p-8 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-2xl hover:border-sky-300 transition-all duration-300 transform hover:-translate-y-2'
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {/* Badge "Phổ biến nhất" */}
              {lang.popular && (
                <div className='absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold uppercase tracking-wider shadow animate-bounce'>
                  Phổ Biến Nhất
                </div>
              )}

              {/* Cờ quốc gia với vòng gradient xoay nhẹ */}
              <div className='relative mx-auto w-20 h-20 mb-5'>
                <div className='absolute inset-0 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 p-1 shadow-lg'>
                  <div
                    style={{
                      backgroundImage: `url(https://flagcdn.com/w160/${lang.flag.toLowerCase()}.png)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    className='w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-bold'
                  ></div>
                </div>
              </div>

              {/* Tên ngôn ngữ */}
              <h3 className='text-xl font-bold text-gray-800 text-center group-hover:text-sky-600 transition-colors'>
                {lang.name}
              </h3>

              {/* Số lượng học viên */}
              <p className='text-center mt-2 text-sm text-gray-500 font-medium'>
                <span className='inline-block animate-pulse text-sky-600 font-bold'>
                  {lang.learners}
                </span>{' '}
                học viên đang học
              </p>
            </div>
          ))}
        </div>

        {/* Nút kêu gọi hành động */}
        <div className='mt-16 text-center'>
          <p className='text-gray-600 mb-4 text-lg'>
            Và <span className='font-bold text-sky-600'>rất nhiều ngôn ngữ khác</span> đang được
            phát triển!
          </p>
          <p className='text-gray-600 mb-6'>
            Không thấy ngôn ngữ bạn muốn? Hãy gợi ý cho chúng tôi nhé
          </p>
          <a
            href='#'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-lg hover:shadow-xl transition-all hover:scale-105'
          >
            Yêu Cầu Thêm Ngôn Ngữ <ArrowRight className='w-6 h-6' />
          </a>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        .animate-bounce { animation: bounce 2s ease-in-out infinite; }

        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </section>
  );
};

export default Languages;
