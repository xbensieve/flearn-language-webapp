import {
  BarChartOutlined,
  GlobalOutlined,
  LayoutOutlined,
  MessageOutlined,
  ProjectOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const courses = [
  {
    id: 'chinese',
    name: 'Chinese for Beginners',
    gradient: 'bg-gradient-to-r from-red-500 to-yellow-300',
    desc: 'Start your journey with essential vocabulary and daily expressions.',
  },
  {
    id: 'japanese',
    name: 'Japanese Conversation',
    gradient: 'bg-gradient-to-r from-pink-500 to-rose-500',
    desc: 'Master practical conversations for travel, work, and daily life.',
  },
  {
    id: 'english',
    name: 'Business English',
    gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    desc: 'Boost your career with professional English communication skills.',
  },
];

const testimonials = [
  {
    text: 'The courses are interactive and fun. I never thought learning a new language could be this engaging!',
    name: 'Linh, Vietnam',
  },
  {
    text: 'I took the Business English course and it immediately improved my workplace communication.',
    name: 'Carlos, Spain',
  },
  {
    text: 'The step-by-step lessons made Japanese easy to follow. Highly recommended!',
    name: 'Aya, Japan',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1
            className="text-xl font-bold cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Flearning
          </h1>
          <nav className="hidden sm:flex gap-6 text-gray-300 font-medium">
            <button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
              Courses
            </button>
            <button onClick={() => window.scrollTo({ top: 1200, behavior: 'smooth' })}>
              How it Works
            </button>
            <button onClick={() => window.scrollTo({ top: 2000, behavior: 'smooth' })}>
              For Teachers
            </button>
            <button onClick={() => window.scrollTo({ top: 3000, behavior: 'smooth' })}>
              Testimonials
            </button>
          </nav>
          <div className="hidden sm:flex gap-4">
            <button
              className="text-white hover:underline"
              onClick={() => navigate('/login')}>
              Login
            </button>
            <button
              className="bg-white !text-black font-bold px-4 py-2 rounded hover:bg-gray-200"
              onClick={() => navigate('/register')}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-center py-20 px-4 relative overflow-hidden">
        <h2 className="text-4xl md:text-6xl font-extrabold">Speak With Confidence.</h2>
        <p className="text-lg mt-6 max-w-2xl mx-auto opacity-90">
          Learn faster with bite-sized lessons, real-life practice, and AI guidance.
        </p>
        <button
          className="mt-8 bg-white !text-black font-bold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-200 transition"
          onClick={() => navigate('/register')}>
          Start Free Trial →
        </button>
      </section>

      {/* How it Works */}
      <section className="bg-gray-50 py-20 text-center">
        <h3 className="text-3xl font-bold">How It Works</h3>
        <p className="mt-2 text-gray-600">Simple, effective, and designed for your busy life.</p>
        <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {[
            {
              icon: <LayoutOutlined />,
              title: 'Pick a Course',
              desc: 'Choose from Chinese, Japanese, or English tailored to your goals.',
            },
            {
              icon: <MessageOutlined />,
              title: 'Practice Daily',
              desc: 'Interactive lessons designed for just 15 minutes a day.',
            },
            {
              icon: <ProjectOutlined />,
              title: 'Track Progress',
              desc: 'AI-powered insights help you improve steadily and stay motivated.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
              {item.icon}
              <h4 className="mt-6 text-xl font-semibold">{item.title}</h4>
              <p className="mt-3 text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20 text-center">
        <h3 className="text-3xl font-bold">Popular Courses</h3>
        <p className="mt-2 text-gray-600">Carefully curated to help you achieve fluency faster.</p>
        <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`rounded-xl p-8 text-white cursor-pointer transform transition hover:-translate-y-2 hover:shadow-xl ${course.gradient}`}
              onClick={() => navigate('/login')}>
              <h4 className="text-2xl font-bold">{course.name}</h4>
              <p className="mt-4 opacity-90">{course.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Teacher Section */}
      <section className="bg-indigo-50 py-20 text-center">
        <h3 className="text-3xl font-bold">For Teachers</h3>
        <p className="mt-2 text-gray-600">Share your knowledge and inspire learners worldwide.</p>
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {[
            {
              icon: <UsergroupAddOutlined />,
              title: 'Global Community',
              desc: 'Connect with learners from every corner of the world.',
            },
            {
              icon: <GlobalOutlined />,
              title: 'Flexible Teaching',
              desc: 'Set your own schedule and teach from anywhere.',
            },
            {
              icon: <BarChartOutlined />,
              title: 'Grow Your Career',
              desc: 'Earn income while building your reputation as a language expert.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
              {item.icon}
              <h4 className="mt-6 text-xl font-semibold">{item.title}</h4>
              <p className="mt-3 text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <button
        className="mt-12 bg-indigo-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-indigo-700 transition"
        onClick={() => navigate('/teacher/register')}>
        Become a Teacher →
      </button>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20 text-center">
        <h3 className="text-3xl font-bold">Trusted by Learners Worldwide</h3>
        <p className="mt-2 text-gray-600">Hear what our students have to say.</p>
        <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition h-full">
              <p className="italic text-gray-700">“{t.text}”</p>
              <p className="mt-6 font-semibold">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-center py-20 px-4">
        <h3 className="text-3xl md:text-4xl font-extrabold">Ready to Start Learning?</h3>
        <p className="mt-4 opacity-90">
          Join thousands of learners building fluency with Flearning.
        </p>
        <button
          className="mt-8 bg-white !text-black font-bold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-200 transition"
          onClick={() => navigate('/register')}>
          Join Now →
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h4 className="font-bold text-white mb-3">Flearning</h4>
            <p>Learn. Grow. Connect. Anywhere in the world.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
                  Courses
                </button>
              </li>
              <li>
                <button onClick={() => window.scrollTo({ top: 1200, behavior: 'smooth' })}>
                  How it Works
                </button>
              </li>
              <li>
                <button
                  className="text-black"
                  onClick={() => navigate('/teacher/register')}>
                  Become a Teacher
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Follow Us</h4>
            <p>🌐 Facebook | Twitter | Instagram</p>
          </div>
        </div>
        <div className="text-center mt-8 border-t border-gray-700 pt-6">
          <p>© {new Date().getFullYear()} Flearning. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
