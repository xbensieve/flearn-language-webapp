import { Quote, Star, User, Heart } from 'lucide-react';

const testimonials = [
  {
    name: 'Nguyễn Thị Lan Anh',
    role: 'Quản lý Marketing, Hà Nội',
    Icon: User,
    rating: 5,
    text: 'Chỉ sau 3 tháng mình đã tự tin giao tiếp tiếng Anh với khách hàng quốc tế. Buổi luyện nói với AI giống hệt người thật, quá tuyệt vời!',
  },
  {
    name: 'Trần Minh Đức',
    role: 'Lập trình viên, TP.HCM',
    Icon: User,
    rating: 5,
    text: 'Mình từng học tiếng Anh 10 năm mà không nói được. Nhờ Flearn, chỉ 4 tháng đã nói trôi chảy, giờ chuẩn bị phỏng vấn công ty nước ngoài!',
  },
  {
    name: 'Phạm Ngọc Ánh',
    role: 'Sinh viên ĐH Ngoại Thương',
    Icon: User,
    rating: 5,
    text: 'Mình đang học tiếng Nhật để đi du học. Cộng đồng Flearn siêu vui, có bạn Nhật chat cùng mỗi ngày, cảm giác như đang sống ở Tokyo!',
  },
  {
    name: 'Lê Hoàng Nam',
    role: 'Nhân viên kinh doanh xuất khẩu',
    Icon: User,
    rating: 5,
    text: 'Nhờ khóa tiếng Trung phản xạ, mình đã ký được hợp đồng triệu đô với đối tác Trung Quốc. Cảm ơn Flearn đã thay đổi sự nghiệp của mình!',
  },
];

const Testimonials = () => {
  return (
    <section className='py-24 bg-gradient-to-b from-sky-50 via-white to-sky-100 relative overflow-hidden'>
      {/* Hiệu ứng nền ánh sáng nhẹ (giống các phần khác) */}
      <div className='absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-3xl opacity-20 animate-pulse'></div>
      <div className='absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-cyan-300 to-sky-400 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-2000'></div>

      <div className='container mx-auto px-4 relative z-10'>
        {/* Header – Siêu cảm xúc */}
        <div className='text-center mb-16 space-y-6'>
          {/* Badge */}
          <div className='inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-2xl shadow-pink-500/30'>
            <Heart className='h-6 w-6 animate-pulse' />
            Câu Chuyện Thành Công
          </div>

          {/* Tiêu đề */}
          <h2 className='text-5xl md:text-6xl font-bold text-gray-900 leading-tight'>
            Được Hàng Ngàn Học Viên{' '}
            <span className='bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent'>
              Yêu Thích & Tin Tưởng
            </span>
          </h2>

          {/* Phụ đề */}
          <p className='text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed'>
            Họ đã <span className='font-bold text-sky-600'>nói được ngoại ngữ tự tin</span> — và bạn
            cũng sẽ làm được!
          </p>
        </div>

        {/* Testimonial Grid – Đẹp lung linh */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {testimonials.map((t, i) => {
            const Icon = t.Icon;
            return (
              <div
                key={i}
                className='group relative p-8 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl hover:border-sky-300 transition-all duration-500 transform hover:-translate-y-4 overflow-hidden'
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Hiệu ứng nền gradient khi hover */}
                <div className='absolute inset-0 bg-gradient-to-br from-sky-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                {/* Đánh giá sao + trích dẫn */}
                <div className='flex items-center justify-between mb-5 relative z-10'>
                  <div className='flex gap-1'>
                    {[...Array(t.rating)].map((_, s) => (
                      <Star
                        key={s}
                        className='h-6 w-6 fill-yellow-400 text-yellow-400 drop-shadow-md group-hover:scale-110 transition-transform'
                        style={{ animationDelay: `${s * 100}ms` }}
                      />
                    ))}
                  </div>
                  <Quote className='h-10 w-10 text-sky-200 group-hover:text-sky-500 transition-all duration-500' />
                </div>

                {/* Nội dung lời chứng thực */}
                <p className='text-gray-700 leading-relaxed italic text-base relative z-10 mb-6 line-clamp-4'>
                  "{t.text}"
                </p>

                {/* Thông tin người dùng */}
                <div className='flex items-center gap-4 pt-5 border-t border-gray-200 relative z-10'>
                  <div className='relative'>
                    <div className='w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 p-0.5 shadow-xl'>
                      <div className='w-full h-full rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform'>
                        <Icon className='h-8 w-8 text-sky-600' />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className='font-bold text-gray-800 group-hover:text-sky-600 transition-colors text-lg !mb-0'>
                      {t.name}
                    </p>
                    <p className='text-sm text-gray-500 !mb-0 font-medium'>{t.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dòng chữ nhỏ cảm xúc ở dưới */}
        <div className='text-center mt-16'>
          <p className='text-2xl font-bold text-gray-800'>
            Bạn sẽ là người tiếp theo kể câu chuyện của mình
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
