import { Globe2, ArrowRight } from 'lucide-react';

const languages = [
  { name: 'English', learners: '1.5B+', flag: 'US', popular: true },
  { name: 'Japanese', learners: '890K+', flag: 'JP' },
  { name: 'Chinese', learners: '1.1M+', flag: 'CN' },
];

const Languages = () => {
  return (
    <section className='relative py-24 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-sky-100'>
      {/* ── Animated world map (SVG) – sky‑blue gradient ── */}
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
              <stop offset='0%' stopColor='#38bdf8' /> {/* sky-400 */}
              <stop offset='100%' stopColor='#0ea5e9' /> {/* sky-500 */}
            </linearGradient>
          </defs>
          <path d='M100 200 Q300 100 500 250 T900 300 Q1100 400 1000 550 T600 650 Q300 600 100 500 Z' />
          <circle cx='320' cy='280' r='80' />
          <circle cx='780' cy='420' r='100' />
        </svg>
      </div>

      {/* ── Sun‑like glowing orbs (same as Hero) ── */}
      <div className='absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-3xl opacity-20 animate-pulse' />
      <div className='absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-cyan-300 to-sky-400 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-2000' />

      <div className='container mx-auto px-4 relative z-10'>
        {/* ── Header ── */}
        <div className='text-center mb-16 space-y-4'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg'>
            <Globe2 className='h-5 w-5' />
            <span>3 Languages Available</span>
          </div>

          {/* Title */}
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight'>
            Learn the Language{' '}
            <span className='bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent'>
              You Love
            </span>
          </h2>

          {/* Subtitle */}
          <p className='text-xl text-gray-600 max-w-2xl mx-auto font-light'>
            From Spanish to Mandarin, master any language with our{' '}
            <span className='font-bold text-sky-600'>comprehensive courses</span>
          </p>
        </div>

        {/* ── Language Grid ── */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center'>
          {languages.map((lang, i) => (
            <div
              key={i}
              className='group relative w-full max-w-xs p-8 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-2xl hover:border-sky-300 transition-all duration-300 transform hover:-translate-y-2'
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {/* Popular badge */}
              {lang.popular && (
                <div className='absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold uppercase tracking-wider shadow animate-bounce'>
                  Most Popular
                </div>
              )}

              {/* Flag with rotating gradient ring */}
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

              {/* Name */}
              <h3 className='text-xl font-bold text-gray-800 text-center group-hover:text-sky-600 transition-colors'>
                {lang.name}
              </h3>

              {/* Learner count (pulsing) */}
              <p className='text-center mt-2 text-sm text-gray-500 font-medium'>
                <span className='inline-block animate-pulse text-sky-600'>{lang.learners}</span>{' '}
                learners
              </p>
            </div>
          ))}
        </div>

        {/* ── CTA Button ── */}
        <div className='mt-16 text-center'>
          <p className='text-gray-600 mb-4'>
            And <span className='font-bold text-sky-600'>many more</span>! Can’t find yours?
          </p>
          <a
            href='#'
            className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 text-white font-medium hover:shadow-xl transition-all hover:scale-105'
          >
            Request a Language <ArrowRight className='w-5 h-5' />
          </a>
        </div>
      </div>

      {/* ── Custom Tailwind Animations (no JS) ── */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        .animate-bounce { animation: bounce 2s ease-in-out infinite; }

        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </section>
  );
};

export default Languages;
