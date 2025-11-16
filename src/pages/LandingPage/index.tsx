// src/pages/LandingPage.tsx
import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import HeroSection from '../../components/HeroSection';
import Features from '../../components/Features';
import Languages from '../../components/Languages';
import Testimonials from '../../components/Testimonials';
import CTA from '../../components/CTA';
import Footer from '../../components/Footer';
import { Menu } from 'antd';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smooth scroll + close mobile menu
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Height of fixed header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setMobileMenuOpen(false); // Close mobile menu
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      {/* === HEADER === */}
      <header className='fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
          {/* Logo */}
          <a href='/' className='flex items-center gap-2'>
            <div className='text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent'>
              Flearn
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className='hidden md:flex items-center gap-8 cursor-pointer'>
            <button
              onClick={() => scrollToSection('features')}
              className='text-gray-700 hover:text-sky-600 font-medium transition cursor-pointer'
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('languages')}
              className='text-gray-700 hover:text-sky-600 font-medium transition cursor-pointer'
            >
              Languages
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className='text-gray-700 hover:text-sky-600 font-medium transition cursor-pointer'
            >
              Testimonials
            </button>
            <button
              onClick={() => scrollToSection('cta')}
              className='text-left text-gray-700 font-medium cursor-pointer'
            >
              Start Journey
            </button>
            <a
              href='/login'
              className='text-gray-700 hover:text-sky-600 font-medium transition cursor-pointer'
            >
              Log In
            </a>
            <a
              href='/login'
              className='bg-gradient-to-r from-sky-600 to-blue-600 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105'
            >
              Apply Now
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className='md:hidden p-2'>
            {mobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='md:hidden bg-white border-t border-gray-200'>
            <nav className='flex flex-col p-4 space-y-3 cursor-pointer'>
              <button
                onClick={() => scrollToSection('features')}
                className='text-left text-gray-700 font-medium cursor-pointer'
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('languages')}
                className='text-left text-gray-700 font-medium cursor-pointer'
              >
                Languages
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className='text-left text-gray-700 font-medium cursor-pointer'
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection('cta')}
                className='text-left text-gray-700 font-medium cursor-pointer'
              >
                Start Journey
              </button>
              <a href='/login' className='text-gray-700 font-medium cursor-pointer'>
                Log In
              </a>
              <a
                href='/login'
                className='bg-gradient-to-r from-sky-600 to-blue-600 text-white text-center py-2 rounded-full font-medium cursor-pointer'
              >
                Apply Now
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* === MAIN CONTENT (with IDs) === */}
      <main className='pt-18'>
        {' '}
        {/* Offset for fixed header */}
        <section id='hero'>
          <HeroSection />
        </section>
        <section id='features'>
          <Features />
        </section>
        <section id='languages'>
          <Languages />
        </section>
        <section id='testimonials'>
          <Testimonials />
        </section>
        <section id='cta'>
          <CTA />
        </section>
      </main>

      {/* === FLOATING CHAT === */}
      <button className='fixed bottom-20 right-6 bg-sky-600 text-white p-4 rounded-full shadow-lg hover:bg-sky-700 transition z-40'>
        <MessageCircle className='w-6 h-6' />
      </button>

      <Footer />
    </div>
  );
};

export default LandingPage;
