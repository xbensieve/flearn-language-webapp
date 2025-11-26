import { ArrowRight } from 'lucide-react';
import { Button } from 'antd';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-sky-50 via-sky-100 to-blue-100">
      {/* ── Sun‑like glowing orbs (blue‑sky vibe) ── */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-16 left-12 w-80 h-80 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 right-12 w-96 h-96 bg-gradient-to-tl from-cyan-300 to-sky-400 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 py-20 pb-45 mt-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* ── LEFT: Text & CTA ── */}
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-5xl md:text-3xl lg:text-5xl font-extrabold leading-tight text-gray-900">
              Học Ngoại Ngữ Toàn Diện
              <span className="block bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Tiếng Anh • Nhật • Trung
              </span>
              <span className="block text-2xl md:text-3xl text-gray-700 mt-4">
                Từ Bài Học Cơ Bản Đến Chứng Chỉ Quốc Tế
              </span>
            </h3>

            <p className="text-lg md:text-lg text-gray-700 leading-relaxed max-w-3xl">
              300+ bài học video ngắn, từ vựng/ ngữ pháp tương tác, luyện nghe, nói, đọc, viết hàng
              ngày, đề thi IELTS/TOEIC/TOPIK/HSK đầy đủ. Giáo viên bản xứ sửa bài 1-1, lộ trình cá
              nhân hóa cho người Việt.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                type="primary"
                size="large"
                className="group bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                href="/login">
                Bắt Đầu Học Miễn Phí{' '}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-sky-700">3</p>
                <p className="text-sm text-gray-600">Ngôn ngữ</p>
              </div>
              <div className="w-px h-12 bg-sky-300"></div>
              <div>
                <p className="text-3xl font-bold text-sky-700">300+</p>
                <p className="text-sm text-gray-600">Bài học</p>
              </div>
              <div className="w-px h-12 bg-sky-300"></div>
              <div>
                <p className="text-3xl font-bold text-sky-700">4.7★</p>
                <p className="text-sm text-gray-600">Đánh giá</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Image ── */}
          <div className="relative animate-scale-in">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>

            <img
              src="https://static.vecteezy.com/system/resources/previews/015/394/317/non_2x/online-language-school-banner-distance-study-free-vector.jpg"
              alt="Language learning experience"
              className="relative rounded-3xl shadow-2xl w-full object-cover border-8 border-white"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
