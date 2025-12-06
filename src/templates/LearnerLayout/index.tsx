import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { GraduationCap, LogOut, Menu } from "lucide-react";
import { toast } from "react-toastify";
import {
  MapPin,
  Mail,
  ChevronRight,
  Download,
  Users,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import LoadingScreen from "@/components/Loading/LoadingScreen";
import { cn } from "@/lib/utils";
import { logoutService } from "@/services/auth";

const NAV_ITEMS = [
  { label: "Ứng tuyển", href: "/learner/application" },
  { label: "Đơn của tôi", href: "/learner/status" },
] as const;

export default function LearnerLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: (refreshToken: string) => logoutService(refreshToken),
    onSuccess: () => {
      toast.success("Đăng xuất thành công!");
      localStorage.removeItem("FLEARN_ACCESS_TOKEN");
      localStorage.removeItem("FLEARN_REFRESH_TOKEN");
      localStorage.removeItem("FLEARN_USER_ROLES");
      window.location.href = "/login";
    },
    onError: (error) => {
      toast.error(error?.message || "Đăng xuất thất bại!");
    },
  });

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("FLEARN_REFRESH_TOKEN");
    if (refreshToken) {
      toast.success("Đăng xuất thành công!");
      logout(refreshToken);
    } else {
      localStorage.clear();
      toast.success("Đăng xuất thành công!");
      window.location.href = "/login";
    }
  };

  if (isLoggingOut) return <LoadingScreen />;

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (
    item:
      | (typeof NAV_ITEMS)[number]
      | { label: string; href: null; isLogout?: boolean }
  ) => {
    if ("isLogout" in item) {
      return (
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
            "data-[pending=true]:opacity-50"
          )}
          onClick={handleLogout}
          disabled={isLoggingOut}
          data-pending={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {item.label}
          {isLoggingOut && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
        </Button>
      );
    }

    return (
      <NavigationMenuLink asChild>
        <Link
          to={item.href as string}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActive(item.href as string)
              ? "bg-accent text-accent-foreground"
              : "text-foreground"
          )}
        >
          {item.label}
        </Link>
      </NavigationMenuLink>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-primary"
          >
            <GraduationCap className="h-7 w-7" />
            <span>FLearn</span>
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavigationMenuItem key={item.href}>
                  {renderNavItem(item)}
                </NavigationMenuItem>
              ))}
              <div className="mx-2 h-6 w-px bg-border" />
              <NavigationMenuItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-600 hover:!text-red-700 hover:!bg-red-50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                  {isLoggingOut && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 pt-12">
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "rounded-md px-4 py-3 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive(item.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-4 border-t border-border" />
                <Button
                  variant="ghost"
                  className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Đăng xuất
                  {isLoggingOut && (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                  )}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <footer className="bg-white pt-16 pb-8 border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-8 md:px-16 lg:px-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12 text-center lg:text-left">
            <div className="lg:col-span-2 space-y-6 flex flex-col items-center lg:items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">FLearn</span>
              </div>
              <p className="text-gray-500 text-sm leading-7 max-w-md mx-auto lg:mx-0">
                FLearn là nền tảng học nói đa ngôn ngữ được hỗ trợ bởi AI. Chúng
                tôi kết nối người học với giáo viên chuyên nghiệp và cung cấp
                công nghệ nhận dạng giọng nói tiên tiến cho tiếng Anh, tiếng
                Nhật và tiếng Trung.
              </p>
              <div className="space-y-4 pt-2 w-full">
                <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Khu công nghệ cao, Thành phố Thủ Đức, TP.HCM</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <a href="mailto:tri10ngon@gmail.com">tri10ngon@gmail.com</a>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">
                Ngôn ngữ
              </h3>
              <ul className="space-y-4">
                {["English", "Japanese", "Chinese"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-500 text-sm flex items-center justify-center lg:justify-start gap-2"
                    >
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-1">
              <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">
                Về chúng tôi
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-500 text-sm flex items-center justify-center lg:justify-start gap-2"
                  >
                    <Users className="w-4 h-4 text-gray-400" />
                    Dự án & Thành viên
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 text-sm flex items-center justify-center lg:justify-start gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-gray-400" />
                    Trở thành giáo viên
                  </a>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
              <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">
                Tải ứng dụng
              </h3>
              <button className="bg-white border border-gray-300 rounded-xl p-4 flex items-center gap-4 w-full max-w-[240px] mx-auto lg:mx-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                    Tải ngay bây giờ
                  </div>
                  <div className="font-bold text-gray-900 text-sm">
                    Phiên bản APK
                  </div>
                </div>
              </button>
              <p className="mt-4 text-xs text-gray-400">
                Tương thích với các thiết bị Android
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} FLearn. Mọi quyền được bảo lưu.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#">Chính sách bảo mật</a>
              <a href="#">Điều khoản dịch vụ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
