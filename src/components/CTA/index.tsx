import { Button } from 'antd';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const benefits = [
  'No credit card required',
  'Cancel anytime',
  '7-day free trial',
  'Access to all languages',
];

const CTA = () => {
  return (
    <section className='py-24 bg-gradient-to-b from-sky-50 via-white to-sky-100 relative overflow-hidden'>
      {/* ── Sun‑like glowing orb (same as Hero) ── */}
      <div className='absolute inset-0'>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-3xl opacity-10 animate-pulse'></div>
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-4xl mx-auto'>
          {/* ── Gradient Card Border ── */}
          <div className='bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-500 p-1 rounded-3xl shadow-2xl'>
            <div className='bg-white rounded-3xl p-12 md:p-16 text-center space-y-8'>
              {/* Title */}
              <div className='space-y-4 animate-fade-in'>
                <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight'>
                  Ready to Start Your
                  <span className='block bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent'>
                    Language Journey?
                  </span>
                </h2>
                <p className='text-xl text-gray-600 max-w-2xl mx-auto font-light'>
                  Join millions of learners who are already speaking with confidence. Your first
                  lesson is waiting.
                </p>
              </div>

              {/* CTA Button */}
              <div
                className='flex flex-wrap justify-center gap-4 animate-fade-in'
                style={{ animationDelay: '200ms' }}
              >
                <Button
                  href='/login'
                  type='primary'
                  size='large'
                  className='group text-lg px-8 py-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all'
                >
                  Get Started Free
                  <ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform' />
                </Button>
              </div>

              {/* Benefits Grid */}
              <div
                className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 animate-fade-in'
                style={{ animationDelay: '400ms' }}
              >
                {benefits.map((benefit, index) => (
                  <div key={index} className='flex items-center gap-2 justify-center'>
                    <CheckCircle2 className='h-5 w-5 text-sky-600 flex-shrink-0' />
                    <span className='text-sm text-gray-600 font-medium'>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
