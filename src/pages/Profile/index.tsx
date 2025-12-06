import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { notifySuccess } from "@/utils/toastConfig";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Calendar,
  Book,
  Star,
  Link2,
  LogOut,
  User,
  Wallet,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Bell,
} from "lucide-react";

// Services
import {
  getProfile,
  logoutService,
  getProfileTeacher,
} from "../../services/auth";
import { unregisterWebPush } from "../../services/webPush";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import NotificationSettings from "@/components/NotificationSettings";

const Profile: React.FC = () => {
  const navigate = useNavigate();

  // --- Queries ---
  const {
    data: profileData,
    isLoading: generalLoading,
    isError: generalError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const isTeacher = profileData?.data?.roles?.includes("Teacher") || false;

  const {
    data: teacherProfile,
    isLoading: teacherLoading,
    isError: teacherError,
  } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: () => getProfileTeacher(),
    enabled: isTeacher,
    select: (data) => data.data,
  });

  const isLoading = generalLoading || (isTeacher && teacherLoading);
  const isError = generalError || (isTeacher && teacherError);

  // --- Mutations ---
  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: (refreshToken: string) => logoutService(refreshToken),
    onSuccess: () => handleLogoutCleanup(),
    onError: () => handleLogoutCleanup(),
  });

  const handleLogoutClick = () => {
    const refreshToken = localStorage.getItem("refreshToken");
    // Unregister web push before logout
    unregisterWebPush().catch(() => {});
    if (refreshToken) {
      logout(refreshToken);
    } else {
      handleLogoutCleanup();
    }
  };

  const handleLogoutCleanup = () => {
    localStorage.removeItem("FLEARN_ACCESS_TOKEN");
    localStorage.removeItem("FLEARN_REFRESH_TOKEN");
    localStorage.removeItem("FLEARN_USER_ROLE");
    localStorage.removeItem("FLEARN_USER_ROLES");
    notifySuccess("Logout successful");
    navigate("/login");
  };

  // --- Render Helpers ---
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // --- Loading State ---
  if (isLoading || isLoggingOut) {
    return (
      <div className="container max-w-5xl py-10 mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl md:col-span-2" />
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (isError || !profileData?.success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Unable to load your profile information. Please check your internet
            connection or try again later.
          </AlertDescription>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Alert>
      </div>
    );
  }

  const user = profileData.data;
  const teacher = teacherProfile?.profile;
  const wallet = teacherProfile?.wallet;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-5">
            <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-white shadow-sm">
              <AvatarImage
                src={teacher?.avatar}
                alt={user.username}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-slate-200">
                {user.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                {teacher?.fullName || user.username}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={isTeacher ? "default" : "secondary"}
                  className="text-sm px-3 py-0.5"
                >
                  {isTeacher ? "Teacher" : "Student"}
                </Badge>
                {isTeacher && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={handleLogoutClick}
            className="w-full md:w-auto shadow-sm cursor-pointer !text-white hover:bg-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Separator className="my-6" />

        {/* Main Grid Layout */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* LEFT COLUMN: Contact & Personal Info (Span 4) */}
          <div className="md:col-span-4 space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p
                      className="text-sm font-medium text-gray-900 truncate"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                {teacher?.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-md">
                      <Phone className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {teacher.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}

                {teacher?.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-50 p-2 rounded-md">
                      <Calendar className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {teacher.dateOfBirth}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Settings Card */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationSettings />
              </CardContent>
            </Card>

            {isTeacher && wallet && (
              <Card className="shadow-sm border-gray-200 bg-gradient-to-br from-emerald-50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                    <Wallet className="w-5 h-5" />
                    My Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-emerald-600/80 font-medium">
                      Available Balance
                    </p>
                    <p className="text-3xl font-bold text-emerald-700">
                      {wallet.availableBalance.toLocaleString()}{" "}
                      <span className="text-lg">{wallet.currency}</span>
                    </p>
                  </div>
                  <Separator className="bg-emerald-200/50 mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total Income
                      </p>
                      <p className="font-semibold text-gray-700">
                        {wallet.totalBalance.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">On Hold</p>
                      <p className="font-semibold text-orange-600">
                        {wallet.holdBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="outline"
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Withdraw Funds
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: Professional Details (Span 8) */}
          <div className="md:col-span-8 space-y-6">
            {/* Teacher Details */}
            {isTeacher && teacher ? (
              <>
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <div className="text-2xl font-bold text-indigo-600 mb-1">
                        {teacher.proficiencyCode}
                      </div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
                        Proficiency
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {teacher.averageRating}
                        </span>
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
                        {teacher.reviewCount} Reviews
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {teacher.language}
                      </div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
                        Language
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Bio & Meeting Info */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Teacher Profile
                      {teacher.meetingUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-2"
                          asChild
                        >
                          <a
                            href={teacher.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            Class Link
                          </a>
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Book className="w-4 h-4 text-muted-foreground" />
                        Biography
                      </h3>
                      <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {teacher.bio ? (
                          teacher.bio
                        ) : (
                          <span className="italic text-muted-foreground">
                            This teacher has not updated their biography yet.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Overall Rating</p>
                        <div className="flex items-center gap-2">
                          {renderStars(teacher.averageRating || 0)}
                          <span className="text-sm font-bold ml-2">
                            {teacher.averageRating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {teacher.reviewCount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Reviews
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              // Student View Placeholder
              <Card className="h-full flex items-center justify-center min-h-[300px] border-dashed">
                <div className="text-center space-y-3">
                  <div className="bg-gray-100 p-4 rounded-full inline-block">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Welcome, {user.username}!
                  </h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    You are currently viewing this profile as a student. Your
                    learning history and course progress will appear here.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
