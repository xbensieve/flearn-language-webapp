// src/pages/Languages.tsx
import { useNavigate } from 'react-router-dom';

const languages = [
  {
    id: 'chinese',
    name: 'Chinese',
    description: 'Master Mandarin Chinese for business, travel, or culture.',
    flag: '🇨🇳',
    gradient: 'from-red-500 to-yellow-400',
  },
  {
    id: 'japanese',
    name: 'Japanese',
    description: 'Learn Japanese to explore anime, culture, and work opportunities.',
    flag: '🇯🇵',
    gradient: 'from-pink-500 to-red-400',
  },
  {
    id: 'english',
    name: 'English',
    description: 'Improve your English for global communication and career growth.',
    flag: '🇬🇧',
    gradient: 'from-blue-500 to-indigo-600',
  },
];

const Languages = () => {
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    navigate(`/learn/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          🌍 Choose Your Language to Learn
        </h1>
        <p className="text-gray-600 mt-3 max-w-xl mx-auto">
          Unlock new opportunities by mastering a new language. Select one and start your journey
          today.
        </p>
      </div>

      {/* Language Cards */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
        {languages.map((lang) => (
          <div
            key={lang.id}
            onClick={() => handleSelect(lang.id)}
            className={`cursor-pointer rounded-2xl p-6 shadow-lg bg-gradient-to-br ${lang.gradient} text-white transform hover:scale-105 transition duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">{lang.flag}</span>
              <h2 className="text-2xl font-bold">{lang.name}</h2>
            </div>
            <p className="text-sm opacity-90">{lang.description}</p>
            <button className="mt-6 bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition">
              Start Learning →
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-16 text-gray-500 text-sm">
        © {new Date().getFullYear()} My Language Platform. All rights reserved.
      </div>
    </div>
  );
};

export default Languages;
