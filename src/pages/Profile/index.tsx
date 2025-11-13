import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, Typography, Spin, Button, Row, Col, Avatar, Rate } from 'antd';
import { toast } from 'react-toastify';
import { getProfile, logoutService, getProfileTeacher } from '../../services/auth';

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
    queryFn: getProfileTeacher,
    enabled: isTeacher,
    select: (data) => data.data,
  });

  const isLoading = generalLoading || (isTeacher && teacherLoading);
  const isError = generalError || (isTeacher && teacherError);

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: (refreshToken: string) => logoutService(refreshToken),
    onSuccess: () => {
      handleLogout();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('FLEARN_ACCESS_TOKEN');
    localStorage.removeItem('FLEARN_REFRESH_TOKEN');
    toast.success('You have logged out!');
    window.location.href = '/login';
  };

  if (isLoading || isLoggingOut) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !profileData?.success) {
    return <div className="text-center mt-10">Unable to load information.</div>;
  }

  const profile = profileData.data;

  return (
    <div className="flex justify-center w-full h-full py-10">
      <Row
        gutter={[16, 16]}
        justify="center"
        style={{ maxWidth: '1200px', width: '100%' }}>
        {/* Left: Profile Info */}
        <Col
          xs={24}
          md={12}>
          <Card className="shadow-lg rounded-xl h-full">
            <Title
              level={3}
              className="text-center mb-6">
              Personal Information
            </Title>

            <div className="space-y-4">
              <div className="text-center mb-4">
                {teacherProfile?.avatar ? (
                  <Avatar
                    src={teacherProfile.avatar}
                    size={100}
                    className="mb-2"
                  />
                ) : null}
                <Text
                  strong
                  className="block">
                  {teacherProfile?.fullName || profile.username}
                </Text>
              </div>

              <div>
                <Text strong>Email: </Text>
                <Text>{profile.email}</Text>
              </div>

              {teacherProfile?.phoneNumber && (
                <div>
                  <Text strong>Phone Number: </Text>
                  <Text>{teacherProfile.phoneNumber}</Text>
                </div>
              )}

              <div>
                <Text strong>Roles: </Text>
                <Text>{profile.roles.join(', ')}</Text>
              </div>

              {teacherProfile && (
                <>
                  <div>
                    <Text strong>Language: </Text>
                    <Text>{teacherProfile.language}</Text>
                  </div>

                  <div>
                    <Text strong>Date of Birth: </Text>
                    <Text>{teacherProfile.dateOfBirth}</Text>
                  </div>

                  <div>
                    <Text strong>Bio: </Text>
                    <Text>{teacherProfile.bio}</Text>
                  </div>

                  <div>
                    <Text strong>Proficiency Code: </Text>
                    <Text>{teacherProfile.proficiencyCode}</Text>
                  </div>

                  <div className="flex items-center">
                    <Text strong>Average Rating: </Text>
                    <Rate
                      disabled
                      defaultValue={teacherProfile.averageRating}
                      className="ml-2"
                    />
                    <Text className="ml-2">({teacherProfile.reviewCount} reviews)</Text>
                  </div>

                  {teacherProfile.meetingUrl && (
                    <div>
                      <Text strong>Meeting URL: </Text>
                      <Text>
                        <a
                          href={teacherProfile.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer">
                          {teacherProfile.meetingUrl}
                        </a>
                      </Text>
                    </div>
                  )}
                </>
              )}
            </div>

            <Button
              type="primary"
              danger
              block
              size="large"
              className="!mt-6"
              onClick={() => logout(localStorage.getItem('FLEARN_REFRESH_TOKEN') || '')}>
              Logout
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
