import { Quote, Star, User, Briefcase, GraduationCap } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Martinez',
    role: 'Marketing Manager',
    Icon: Briefcase,
    rating: 5,
    text: 'I went from zero Spanish to having conversations with clients in just 3 months. The AI practice sessions are incredibly realistic!',
  },
  {
    name: 'David Chen',
    role: 'Software Engineer',
    Icon: User,
    rating: 5,
    text: 'Finally, a platform that understands how adults learn. The personalized approach helped me master French for my move to Paris.',
  },
  {
    name: 'Emma Thompson',
    role: 'College Student',
    Icon: GraduationCap,
    rating: 5,
    text: "The community aspect is amazing. I've made friends worldwide while learning Japanese. It's like having study buddies 24/7.",
  },
];

const Testimonials = () => {
  return (
    <section className='py-24 bg-gradient-to-b from-sky-50 via-white to-sky-100 relative overflow-hidden'>
      {/* ── Sun‑like glowing orbs (same as Hero) ── */}
      <div className='absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'></div>
      <div className='absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-cyan-300 to-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000'></div>

      <div className='container mx-auto px-4 relative z-10'>
        {/* Header */}
        <div className='text-center mb-16 space-y-4'>
          {/* Badge */}
          <div className='inline-block px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg'>
            Success Stories
          </div>

          {/* Title */}
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight'>
            Loved by Learners{' '}
            <span className='bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent'>
              Worldwide
            </span>
          </h2>

          {/* Subtitle */}
          <p className='text-xl text-gray-600 max-w-2xl mx-auto font-light'>
            Join <span className='font-bold text-sky-600'>thousands</span> who've transformed their
            language skills
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className='grid md:grid-cols-3 gap-8'>
          {testimonials.map((t, i) => {
            const Icon = t.Icon;
            return (
              <div
                key={i}
                className='group p-8 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl hover:border-sky-300 transition-all duration-300 transform hover:-translate-y-1'
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {/* Rating + Quote */}
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex gap-1'>
                    {[...Array(t.rating)].map((_, s) => (
                      <Star
                        key={s}
                        className='h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-sm group-hover:animate-pulse'
                      />
                    ))}
                  </div>
                  <Quote className='h-8 w-8 text-sky-200 group-hover:text-sky-400 transition-colors' />
                </div>

                {/* Quote Text */}
                <p className='text-gray-700 leading-relaxed italic text-base'>"{t.text}"</p>

                {/* User Info */}
                <div className='flex items-center gap-4 pt-6 mt-6 border-t border-gray-100'>
                  <div className='relative'>
                    <div className='w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 p-0.5 shadow-md'>
                      <div className='w-full h-full rounded-full bg-white flex items-center justify-center'>
                        <Icon className='h-7 w-7 text-sky-600' />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className='font-bold text-gray-800 group-hover:text-sky-600 transition-colors'>
                      {t.name}
                    </p>
                    <p className='text-sm text-gray-500'>{t.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
