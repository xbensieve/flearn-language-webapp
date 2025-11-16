import { Brain, MessageCircle, Target, Trophy, Zap, Users } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Learning',
    description:
      'Advanced algorithms adapt to your learning style and pace, ensuring optimal progress.',
  },
  {
    icon: MessageCircle,
    title: 'Real Conversations',
    description: 'Practice with native speakers and AI tutors in realistic, everyday scenarios.',
  },
  {
    icon: Target,
    title: 'Personalized Path',
    description: 'Custom curriculum based on your goals, whether travel, business, or fluency.',
  },
  {
    icon: Zap,
    title: 'Quick Wins',
    description: 'Start speaking from day one with our proven immersive methodology.',
  },
  {
    icon: Trophy,
    title: 'Track Progress',
    description: 'Detailed analytics and achievements keep you motivated throughout your journey.',
  },
  {
    icon: Users,
    title: 'Global Community',
    description: 'Connect with millions of learners worldwide for practice and support.',
  },
];

const Features = () => {
  return (
    <section className='py-24 bg-gradient-to-b from-sky-50 via-white to-sky-100 relative overflow-hidden'>
      {/* ── Sun‑like glowing orbs (same as hero) ── */}
      <div className='absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'></div>
      <div className='absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-cyan-300 to-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000'></div>

      <div className='container mx-auto px-4 relative z-10'>
        {/* Header */}
        <div className='flex items-center justify-center flex-col text-center mb-16 space-y-4'>
          {/* Badge */}
          <div className='inline-block px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg'>
            Why Choose Flearn
          </div>

          {/* Title */}
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight'>
            Everything You Need to{' '}
            <span className='bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent'>
              Succeed
            </span>
          </h2>

          {/* Subtitle */}
          <p className='text-xl text-gray-600 max-w-2xl mx-auto font-light'>
            Powerful features designed to{' '}
            <span className='font-semibold text-sky-600'>accelerate</span> your language learning
            journey
          </p>
        </div>

        {/* Feature Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className='group p-8 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl hover:border-sky-300 transition-all duration-300 transform hover:-translate-y-1'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon Container */}
                <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-0.5 mb-6 shadow-lg'>
                  <div className='w-full h-full rounded-2xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform'>
                    <Icon className='h-8 w-8 text-sky-600' />
                  </div>
                </div>

                {/* Title */}
                <h3 className='text-xl font-bold mb-3 text-gray-800 group-hover:text-sky-600 transition-colors'>
                  {feature.title}
                </h3>

                {/* Description */}
                <p className='text-gray-600 leading-relaxed text-sm'>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
