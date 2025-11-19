import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Typography, Spin, Button, Avatar, Rate } from 'antd';
import { toast } from 'react-toastify';
import { getProfile, logoutService, getProfileTeacher } from '../../services/auth';
import {
  Mail,
  Phone,
  Calendar,
  Book,
  Star,
  Link2,
  LogOut,
  User,
  Wallet as WalletIcon,
} from 'lucide-react';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const {
    data: profileData,
    isLoading: generalLoading,
    isError: generalError,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const isTeacher = profileData?.data?.roles?.includes('Teacher') || false;

  const {
    data: teacherProfile,
    isLoading: teacherLoading,
    isError: teacherError,
  } = useQuery({
    queryKey: ['teacherProfile'],
    queryFn: () => getProfileTeacher(),
    enabled: isTeacher,
    select: (data) => data.data,
  });

  const isLoading = generalLoading || (isTeacher && teacherLoading);
  const isError = generalError || (isTeacher && teacherError);

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: (refreshToken: string) => logoutService(refreshToken),
    onSuccess: () => handleLogout(),
  });

  const handleLogout = () => {
    localStorage.removeItem('FLEARN_ACCESS_TOKEN');
    localStorage.removeItem('FLEARN_REFRESH_TOKEN');
    toast.success('Đăng xuất thành công!');
    window.location.href = '/login';
  };

  if (isLoading || isLoggingOut) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative">
          <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full opacity-30 animate-ping"></div>
          <Spin
            size="large"
            className="relative z-10"
          />
        </div>
        <Text className="mt-8 text-lg font-semibold text-indigo-700 animate-pulse">
          Đang tải hồ sơ...
        </Text>
      </div>
    );
  }

  if (isError || !profileData?.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <Title
            level={4}
            className="text-gray-800 mb-2">
            Có lỗi xảy ra
          </Title>
          <Text className="text-gray-600">
            Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

            <div className="relative z-10 text-center">
              <div className="relative inline-block mb-5">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-1 blur-md animate-pulse"></div>
                <Avatar
                  src={teacherProfile?.profile.avatar}
                  size={130}
                  className="relative z-10 border-4 border-white shadow-2xl"
                  icon={<User className="w-14 h-14 text-gray-400" />}
                />
              </div>

              <Title
                level={2}
                className="!text-white !mb-1 !text-3xl font-bold">
                {teacherProfile?.profile?.fullName || profileData.data.username || 'User'}
              </Title>
              <Text className="text-white/90 text-lg font-medium flex items-center justify-center gap-2">
                <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {isTeacher ? 'Giáo viên' : 'Học viên'}
                </span>
              </Text>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            {/* General Info */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="flex items-center gap-4 bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Mail className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <Text className="text-xs text-gray-500 block font-medium">Email</Text>
                  <Text className="font-semibold text-gray-800">{profileData.data.email}</Text>
                </div>
              </div>

              {teacherProfile?.profile.phoneNumber && (
                <div className="flex items-center gap-4 bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Phone className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <Text className="text-xs text-gray-500 block font-medium">Số điện thoại</Text>
                    <Text className="font-semibold text-gray-800">
                      {teacherProfile.profile.phoneNumber}
                    </Text>
                  </div>
                </div>
              )}
            </div>

            {/* Teacher Only Section */}
            {isTeacher && teacherProfile && (
              <>
                {/* Wallet Balance */}
                {teacherProfile.wallet && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                          <WalletIcon className="w-7 h-7 text-green-700" />
                        </div>
                        <div>
                          <Text className="text-sm text-gray-600">Số dư khả dụng</Text>
                          <Title
                            level={3}
                            className="!text-green-700 !m-0">
                            {teacherProfile.wallet.availableBalance.toLocaleString()}{' '}
                            {teacherProfile.wallet.currency}
                          </Title>
                        </div>
                      </div>
                      <div className="text-right">
                        <Text className="text-xs text-gray-500">
                          Tổng: {teacherProfile.wallet.totalBalance.toLocaleString()}
                        </Text>
                        <br />
                        <Text className="text-xs text-orange-600">
                          Đang giữ: {teacherProfile.wallet.holdBalance.toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 p-7 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 space-y-6">
                  <Title
                    level={4}
                    className="text-indigo-800 mb-5 flex items-center gap-2 font-bold">
                    <Star className="w-6 h-6 text-yellow-500" />
                    Hồ sơ giáo viên
                  </Title>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="flex items-center gap-4 bg-white/70 p-4 rounded-xl">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Book className="w-5 h-5 text-purple-700" />
                      </div>
                      <div>
                        <Text className="text-xs text-gray-500 block">Ngôn ngữ giảng dạy</Text>
                        <Text className="font-semibold">{teacherProfile.profile.language}</Text>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/70 p-4 rounded-xl">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-pink-700" />
                      </div>
                      <div>
                        <Text className="text-xs text-gray-500 block">Ngày sinh</Text>
                        <Text className="font-semibold">
                          {new Date(teacherProfile.profile.dateOfBirth).toLocaleDateString('vi-VN')}
                        </Text>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 bg-white/60 p-5 rounded-xl">
                    <div>
                      <Text className="text-sm text-gray-600 block mb-1">Giới thiệu</Text>
                      <Text className="text-gray-800 leading-relaxed">
                        {teacherProfile.profile.bio || 'Chưa có giới thiệu'}
                      </Text>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <Text className="text-sm text-gray-600 block mb-1">Trình độ</Text>
                        <Text className="font-bold text-indigo-700 text-lg">
                          {teacherProfile.profile.proficiencyCode}
                        </Text>
                      </div>

                      <div className="flex items-center gap-3">
                        <div>
                          <Text className="text-sm text-gray-600 block mb-1">Đánh giá</Text>
                          <Rate
                            disabled
                            allowHalf
                            value={teacherProfile.profile.averageRating}
                            className="text-yellow-500"
                          />
                        </div>
                        <Text className="font-semibold text-gray-700">
                          ({teacherProfile.profile.reviewCount} lượt)
                        </Text>
                      </div>
                    </div>

                    {teacherProfile.profile.meetingUrl && (
                      <div>
                        <Text className="text-sm text-gray-600 block mb-2">Link phòng học</Text>
                        <a
                          href={teacherProfile.profile.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold underline-offset-4 hover:underline">
                          <Link2 className="w-5 h-5" />
                          Vào lớp học
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Logout Button */}
            <Button
              type="primary"
              danger
              size="large"
              block
              icon={<LogOut className="w-5 h-5" />}
              onClick={() => logout(localStorage.getItem('FLEARN_REFRESH_TOKEN') || '')}
              className="mt-10 h-14 text-lg font-bold rounded-xl shadow-lg bg-gradient-to-r from-red-600 to-pink-600 border-0">
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
