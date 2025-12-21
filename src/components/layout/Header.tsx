import { Bell, LogOut, User, UserCog } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logoutService } from "@/services/auth";
export const Header = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      queryClient.removeQueries();
      if (refreshToken) {
        await logoutService(refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("FLEARN_ACCESS_TOKEN");
      localStorage.removeItem("FLEARN_REFRESH_TOKEN");
      localStorage.removeItem("FLEARN_USER_ROLE");
      localStorage.removeItem("FLEARN_USER_ROLES");
      toast.success("Đăng xuất thành công!");
      navigate("/login");
    }
  };

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">{"Quản lý hệ thống"}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500"></span>
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 cursor-pointer"
            >
              <UserCog />
              <span className="font-medium">Quản lý</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/profile")}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Hồ sơ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive cursor-pointer focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
