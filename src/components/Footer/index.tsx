import { Globe2 } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='relative bg-gradient-to-b from-sky-50 via-sky-100 to-sky-200 pt-16 overflow-hidden'>
      {/* Sun‑like glow orb (same as Hero) */}
      <div className='absolute inset-0 opacity-10 pointer-events-none'>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-3xl animate-pulse'></div>
      </div>

      <div className='max-w-7xl mx-auto px-6 relative z-10'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand */}
          <div className='space-y-4'>
            <div className='text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent'>
              Flearn
            </div>
            <p className='text-sm text-gray-600 leading-relaxed'>
              The #1 marketplace for{' '}
              <span className='font-semibold text-sky-700'>Vietnamese language teachers</span>.
            </p>
            <div className='flex items-center gap-2 text-sky-600'>
              <Globe2 className='h-5 w-5' />
              <span className='text-sm font-medium'>Serving learners worldwide</span>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className='font-bold text-sky-800 mb-3'>Company</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <a href='/about' className='text-gray-600 hover:text-sky-600 transition-colors'>
                  About Us
                </a>
              </li>
              <li>
                <a href='/careers' className='text-gray-600 hover:text-sky-600 transition-colors'>
                  Careers
                </a>
              </li>
              <li>
                <a href='/press' className='text-gray-600 hover:text-sky-600 transition-colors'>
                  Press
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='font-bold text-sky-800 mb-3'>Support</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <a href='/help' className='text-gray-600 hover:text-sky-600 transition-colors'>
                  Help Center
                </a>
              </li>
              <li>
                <a href='/contact' className='text-gray-600 hover:text-sky-600 transition-colors'>
                  Contact
                </a>
              </li>
              <li>
                <a href='/safety' className='text-gray-600 hover:text-sky-600 transition-colors'>
                  Safety
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className='font-bold text-sky-800 mb-3'>Legal</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <a href='/terms' className='text-gray-600 hover:text-sky-600 transition-colors'>
                  Terms
                </a>
              </li>
              <li>
                <a href='/privacy' className='text-gray-600 hover:text-sky-600 transition-colors'>
                  Privacy
                </a>
              </li>
              <li>
                <a href='/cookies' className='text-gray-600 hover:text-sky-600 transition-colors'>
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className='border-t border-sky-300 mt-10 pt-6 text-center'>
          <p className='text-sm text-gray-600'>
            © {currentYear} <span className='font-semibold text-sky-700'>Flearn</span>. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
