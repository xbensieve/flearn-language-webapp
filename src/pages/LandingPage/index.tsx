// src/pages/LandingPage.tsx
import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import HeroSection from '../../components/HeroSection';
import Features from '../../components/Features';
import Languages from '../../components/Languages';
import Testimonials from '../../components/Testimonials';
import CTA from '../../components/CTA';
import Footer from '../../components/Footer';
import PopularCourse from '../../components/PopularCourse';
import { Menu as MenuIcon } from 'lucide-react'; // Đổi tên để tránh trùng với Antd Menu

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem('FLEARN_ACCESS_TOKEN');
  const roles = localStorage.getItem('FLEARN_USER_ROLES');
  const isTeacher = roles?.includes('Teacher') || false;

  // Cuộn mượt + đóng menu mobile
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Adjust for fixed header (80px)
      window.scrollBy(0, -90);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* === HEADER === */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Flearn
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-700 !hover:text-sky-600 cursor-pointer font-medium transition">
              Tính năng
            </button>
            <button
              onClick={() => scrollToSection('popular-courses')}
              className="text-gray-700 !hover:text-sky-600 cursor-pointer font-medium transition">
              Khóa học nổi bật
            </button>
            <button
              onClick={() => scrollToSection('languages')}
              className="text-gray-700 !hover:text-sky-600 cursor-pointer font-medium transition">
              Ngôn ngữ
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-gray-700 !hover:text-sky-600 cursor-pointer font-medium transition">
              Học viên nói gì
            </button>
            <button
              onClick={() => scrollToSection('cta')}
              className="text-gray-700 !hover:text-sky-600 cursor-pointer font-medium transition">
              Bắt đầu ngay
            </button>

            {/* Nút đăng nhập / quản lý */}
            {!token ? (
              <>
                <a
                  href="/login"
                  className="text-gray-700 !hover:text-sky-600 cursor-pointer font-medium transition">
                  Đăng nhập
                </a>
                <a
                  href="/login"
                  className="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105">
                  Đăng ký miễn phí
                </a>
              </>
            ) : !isTeacher ? (
              <a
                href="/teacher"
                className="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105">
                Trở thành giảng viên
              </a>
            ) : (
              <a
                href="/teacher"
                className="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105">
                Quản lý khóa học
              </a>
            )}
          </div>

          {/* Nút menu mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="flex flex-col p-4 space-y-4">
              <div
                onClick={() => scrollToSection('features')}
                className="text-left text-gray-700 font-medium">
                Tính năng
              </div>
              <div
                onClick={() => scrollToSection('popular-courses')}
                className="text-left text-gray-700 font-medium">
                Khóa học nổi bật
              </div>
              <div
                onClick={() => scrollToSection('languages')}
                className="text-left text-gray-700 font-medium">
                Ngôn ngữ
              </div>
              <div
                onClick={() => scrollToSection('testimonials')}
                className="text-left text-gray-700 font-medium">
                Học viên nói gì
              </div>
              <div
                onClick={() => scrollToSection('cta')}
                className="text-left text-gray-700 font-medium">
                Bắt đầu ngay
              </div>

              {!token ? (
                <>
                  <a
                    href="/login"
                    className="text-gray-700 font-medium">
                    Đăng nhập
                  </a>
                  <a
                    href="/login"
                    className="bg-gradient-to-r from-sky-600 to-blue-600 text-white text-center py-3 rounded-full font-medium">
                    Đăng ký miễn phí
                  </a>
                </>
              ) : !isTeacher ? (
                <a
                  href="/teacher"
                  className="bg-gradient-to-r from-sky-600 to-blue-600 text-white text-center py-3 rounded-full font-medium">
                  Trở thành giảng viên
                </a>
              ) : (
                <a
                  href="/teacher-dashboard"
                  className="bg-gradient-to-r from-sky-600 to-blue-600 text-white text-center py-3 rounded-full font-medium">
                  Quản lý khóa học
                </a>
              )}
            </div>
          </div>
        )}
      </header>

      {/* === NỘI DUNG CHÍNH === */}
      <main className="pt-20">
        <section id="hero">
          <HeroSection />
        </section>

        <section id="features">
          <Features />
        </section>

        <section id="popular-courses">
          <PopularCourse />
        </section>

        <section id="languages">
          <Languages />
        </section>

        <section id="testimonials">
          <Testimonials />
        </section>

        <section id="cta">
          <CTA />
        </section>
      </main>

      {/* Nút chat nổi */}
      <button className="fixed bottom-20 right-6 bg-sky-600 text-white p-4 rounded-full shadow-lg hover:bg-sky-700 transition z-40">
        <MessageCircle className="w-6 h-6" />
      </button>

      <Footer />
    </div>
  );
};

export default LandingPage;
