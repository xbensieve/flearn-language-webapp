/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loginDashboard } from "../../services/auth";
import { useAuth } from "../../utils/AuthContext";
import { handleRoleRedirect } from "@/utils/authUtils";
import type { AxiosError } from "axios";
import {
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import LoadingScreen from "@/components/Loading/LoadingScreen";
import BackgroundImage from "@/assets/background-image-02.avif";
import { toast } from "sonner";

const APP_DOMAIN = "https://app-flearn.dev";

const LoginDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { updateAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      usernameOrEmail: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const roles = JSON.parse(
        localStorage.getItem("FLEARN_USER_ROLES") || "[]"
      );
      if (
        roles.length > 0 &&
        roles.some((r: string) => ["admin", "manager", "teacher"].includes(r))
      ) {
        handleRoleRedirect(roles, navigate, "internal");
        return;
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [navigate]);

  const mutation = useMutation({
    mutationFn: loginDashboard,
    onSuccess: (data) => handleAuthSuccess(data),
    onError: (err: AxiosError<any>) => {
      console.log(err?.response?.data?.message);
      toast.error("Đăng nhập thất bại!");
    },
  });

  const handleAuthSuccess = (data: any) => {
    localStorage.setItem("FLEARN_ACCESS_TOKEN", data.accessToken);
    localStorage.setItem("FLEARN_REFRESH_TOKEN", data.refreshToken);
    localStorage.setItem("FLEARN_USER_ROLES", JSON.stringify(data.roles));
    updateAuth();
    toast.success("Đăng nhập thành công!");
    handleRoleRedirect(data.roles, navigate, "internal");
  };

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (isCheckingAuth || mutation.isSuccess) {
    return <LoadingScreen message="Truy cập Cổng thông tin hệ thống..." />;
  }

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      <div className="hidden bg-slate-900 lg:block relative">
        <div className="absolute inset-0 bg-slate-700">
          <img
            src={BackgroundImage}
            alt="Dashboard Analytics"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay grayscale"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="relative z-20 flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-2 font-medium text-lg text-indigo-300">
            <GraduationCap className="h-6 w-6" /> Hệ thống quản lý FLearn
          </div>
          <div className="mb-10 max-w-lg">
            <blockquote className="space-y-4">
              <p className="text-2xl font-light leading-relaxed text-slate-200">
                "Efficiency is doing better what is already being done.
                Management is efficiency in climbing the ladder of success."
              </p>
              <footer className="text-sm font-medium text-indigo-400">
                — Peter Drucker
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
      <div className="flex bg-white items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[400px] gap-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight text-foreground">
              <ShieldCheck className="h-7 w-7" /> Truy cập hệ thống
            </h1>
            <p className="text-muted-foreground text-sm">
              Khu vực dành riêng cho Quản trị viên và Nhân sự
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Tên người dùng hoặc Email</Label>
              <Input
                id="username"
                placeholder="admin@flearn.com"
                className={errors.usernameOrEmail ? "border-red-500" : ""}
                {...register("usernameOrEmail", { required: true })}
              />
              {errors.usernameOrEmail && (
                <span className="text-xs text-red-500">
                  Trường này là bắt buộc
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="******"
                  type={showPassword ? "text" : "password"}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  {...register("password", { required: true })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-red-500">
                  Trường này là bắt buộc
                </span>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2">
              <Checkbox
                id="remember"
                {...register("rememberMe")}
                className="cursor-pointer h-4 w-4 rounded border border-gray-300 data-[state=checked]:bg-gray-200 data-[state=checked]:text-gray-800"
              />
              <div></div>
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Duy trì đăng nhập
              </label>
            </div>

            <Button
              className="w-full !text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xác
                  minh...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Đăng nhập
                </>
              )}
            </Button>
          </form>
          <Separator className="my-2" />
          <a
            className="text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors"
            href={APP_DOMAIN}
          >
            Truy cập hệ thống dành cho giáo viên đăng ký
            <ArrowRight className="ml-2 h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginDashboard;
