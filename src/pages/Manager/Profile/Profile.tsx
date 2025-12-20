import { getProfile } from "@/services/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Calendar, Shield } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { format } from "date-fns";
import NotificationSettings from "@/components/NotificationSettings";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await getProfile();
      return response?.data || null;
    },
    staleTime: 30 * 60 * 1000, // Profile ít đổi, cache hẳn 30 phút
  });

  const userInitials = profile?.username?.substring(0, 2).toUpperCase() || "UN";
  const joinedDate = profile?.createdAt
    ? format(new Date(profile.createdAt), "MMMM d, yyyy")
    : "N/A";

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-10 w-full max-w-md" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6 text-center py-20">
          <p className="text-muted-foreground text-lg">
            Không có dữ liệu hồ sơ.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="font-sans container mx-auto p-6 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
            Hồ sơ của tôi
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Xem và quản lý thông tin tài khoản của bạn
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-br from-primary/5 via-background to-background pb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
                    <AvatarImage src="" alt={profile.username} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/80 text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold">
                      {profile.username}
                    </CardTitle>
                    <CardDescription className="text-base">
                      Thành viên kể từ {joinedDate}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-3">
                      {profile.roles.map((role) => (
                        <Badge
                          key={role}
                          variant={role === "admin" ? "default" : "secondary"}
                          className="font-medium"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-8 space-y-8">
                <div className="space-y-6">
                  <div className="group p-5 rounded-md border bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                      <User className="h-5 w-5" />
                      <span className="font-medium text-sm">
                        Tên người dùng
                      </span>
                    </div>
                    <p className="text-xl font-semibold pl-8 text-foreground">
                      {profile.username}
                    </p>
                  </div>

                  <div className="group p-5 rounded-md border bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                      <Mail className="h-5 w-5" />
                      <span className="font-medium text-sm">Địa chỉ email</span>
                    </div>
                    <p className="text-xl font-semibold pl-8 text-foreground break-all">
                      {profile.email}
                    </p>
                  </div>

                  <div className="group p-5 rounded-md border bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium text-sm">
                        Đã tham gia vào
                      </span>
                    </div>
                    <p className="text-xl font-semibold pl-8 text-foreground">
                      {joinedDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID</span>
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {profile.userId.slice(0, 8)}...
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-green-600">
                    Đang hoạt động
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <NotificationSettings />

            <div className="text-center text-sm text-muted-foreground p-6 bg-muted/30 rounded-md">
              <p>Tài khoản của bạn an toàn và được cập nhật.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
