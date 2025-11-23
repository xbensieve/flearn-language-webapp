import { ArrowRight } from 'lucide-react';
import { Button } from 'antd';

const HeroSection = () => {
  return (
    <section className='relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-sky-50 via-sky-100 to-blue-100'>
      {/* ── Sun‑like glowing orbs (blue‑sky vibe) ── */}
      <div className='absolute inset-0 opacity-20 pointer-events-none'>
        <div className='absolute top-16 left-12 w-80 h-80 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-16 right-12 w-96 h-96 bg-gradient-to-tl from-cyan-300 to-sky-400 rounded-full blur-3xl animate-pulse animation-delay-1000'></div>
      </div>

      <div className='container mx-auto px-6 py-20 pb-45 mt-24 relative z-10'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* ── LEFT: Text & CTA ── */}
          <div className='space-y-8 animate-fade-in'>
            {/* Badge */}
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 border border-sky-300'>
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-600 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-sky-600'></span>
              </span>
              <span className='text-sm font-medium text-sky-800'>
                Được hơn 2 triệu học viên trên toàn cầu tin dùng
              </span>
            </div>

            {/* Title */}
            <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900'>
              Làm Chủ Mọi Ngoại Ngữ
              <span className='block bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent'>
                Một Cách Tự Nhiên
              </span>
            </h1>

            {/* Description */}
            <p className='text-xl text-gray-700 leading-relaxed max-w-xl'>
              Học ngoại ngữ đúng cách — như người bản xứ. Bài học tương tác sống động, luyện tập hội
              thoại thực tế, và công nghệ AI thông minh tự điều chỉnh theo tốc độ học của bạn.
            </p>

            {/* Buttons */}
            <div className='flex flex-wrap gap-4'>
              <Button
                type='primary'
                size='large'
                className='group bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all'
                href='/login'
              >
                Bắt Đầu Học Miễn Phí
                <ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform' />
              </Button>
              {/* 
              <Button
                size='large'
                className='group border-2 border-sky-400 hover:border-sky-600 hover:bg-sky-50 text-sky-700 font-medium transition-all'
              >
                <Play className='mr-2 h-5 w-5 group-hover:scale-110 transition-transform' />
                Watch Demo
              </Button> */}
            </div>

            {/* Stats */}
            <div className='flex items-center gap-8 pt-4'>
              <div>
                <p className='text-3xl font-bold text-sky-700'>30+</p>
                <p className='text-sm text-gray-600'>Ngôn ngữ</p>
              </div>
              <div className='w-px h-12 bg-sky-300'></div>
              <div>
                <p className='text-3xl font-bold text-sky-700'>500K+</p>
                <p className='text-sm text-gray-600'>Bài học</p>
              </div>
              <div className='w-px h-12 bg-sky-300'></div>
              <div>
                <p className='text-3xl font-bold text-sky-700'>4.9★</p>
                <p className='text-sm text-gray-600'>Đánh giá từ học viên</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Image ── */}
          <div className='relative animate-scale-in'>
            {/* Glow behind image */}
            <div className='absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse'></div>

            <img
              src='https://static.vecteezy.com/system/resources/previews/015/394/317/non_2x/online-language-school-banner-distance-study-free-vector.jpg'
              alt='Language learning experience'
              className='relative rounded-3xl shadow-2xl w-full object-cover border-8 border-white'
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
