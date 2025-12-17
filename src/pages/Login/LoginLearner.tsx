/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loginLearner } from "../../services/auth";
import { useAuth } from "../../utils/AuthContext";
import type { AxiosError } from "axios";
import { Loader2, Eye, EyeOff, ArrowRight, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import BackgroundImage from "@/assets/background-image.avif";
import LoadingScreen from "@/components/Loading/LoadingScreen";
import { toast } from "sonner";

const SYSTEM_DOMAIN = "https://system-flearn.vercel.app";

const LoginLearner: React.FC = () => {
  const navigate = useNavigate();
  const { updateAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const rolesString = localStorage.getItem("FLEARN_USER_ROLES");
      if (rolesString) {
        try {
          const rolesRaw = JSON.parse(rolesString);
          const roles = Array.isArray(rolesRaw)
            ? rolesRaw.map((r: any) => String(r).toLowerCase())
            : [];
          if (
            roles.some((r: string) =>
              ["admin", "manager", "teacher"].includes(r)
            )
          ) {
            toast.error(
              "Tài khoản có quyền Nhân viên. Vui lòng đăng nhập tại Cổng thông tin Hệ thống."
            );
            localStorage.clear();
            window.location.href = SYSTEM_DOMAIN;
            return;
          }

          if (roles.includes("learner")) {
            navigate("/learner");
          }
        } catch {
          localStorage.removeItem("FLEARN_USER_ROLES");
        }
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [navigate]);

  const mutation = useMutation({
    mutationFn: loginLearner,
    onSuccess: (data) => handleAuthSuccess(data),
    onError: (err: AxiosError<any>) =>
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại!"),
  });

  const handleAuthSuccess = (data: any) => {
    const roles = data.roles || [];
    const isStaff = roles.some((r: string) =>
      ["admin", "manager", "teacher"].includes(r.toLowerCase())
    );
    if (isStaff) {
      toast.error(
        "Bạn là nhân viên. Vui lòng sử dụng Cổng thông tin hệ thống."
      );
      setTimeout(() => {
        window.location.href = SYSTEM_DOMAIN;
      }, 1500);
      return;
    }

    localStorage.setItem("FLEARN_ACCESS_TOKEN", data.accessToken);
    localStorage.setItem("FLEARN_REFRESH_TOKEN", data.refreshToken);
    localStorage.setItem("FLEARN_USER_ROLES", JSON.stringify(data.roles));
    updateAuth();
    toast.success("Đăng nhập thành công!");
    navigate("/learner");
  };

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (isCheckingAuth || mutation.isSuccess) {
    return <LoadingScreen message="Xác minh phiên an toàn..." />;
  }

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      <div className="hidden bg-muted lg:block relative">
        <div className="absolute inset-0 bg-zinc-700">
          <img
            src={BackgroundImage}
            alt="Learning"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
        </div>

        <div className="relative z-20 flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-2 font-medium text-lg">
            <GraduationCap className="h-6 w-6" /> FLearn Team
          </div>
          <div className="mb-10">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Education is the passport to the future, for tomorrow
                belongs to those who prepare for it today.&rdquo;
              </p>
              <footer className="text-sm text-zinc-300">Malcom X</footer>
            </blockquote>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[400px] gap-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight text-foreground">
              <GraduationCap className="h-10 w-10" />
              FLearn - Đăng nhập
            </h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <div
                id="googleSignInDiv"
                className="w-full flex justify-center [&>div]:w-full overflow-hidden"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Tên người dùng hoặc Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe@gmail.com hoặc johndoe"
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
                <Label htmlFor="password">Password</Label>
                <a
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm font-medium text-primary hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </a>
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
                className="cursor-pointer h-4 w-4 rounded border border-gray-300 data-[state=checked]:bg-gray-200 data-[state=checked]:text-gray-800"
                id="remember"
                {...register("rememberMe")}
                onCheckedChange={() => {}}
              />
              <div></div>
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Duy trì đăng nhập
              </label>
            </div>

            <Button
              className="w-full bg-black !text-white hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Đăng nhập
            </Button>
          </form>

          <div className="text-center text-sm">
            Không có tài khoản?{" "}
            <span
              onClick={() => navigate("/register")}
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              Đăng ký
            </span>
          </div>
          <Separator className="my-2" />
          <div className="text-center">
            <a
              href={SYSTEM_DOMAIN}
              className="text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors"
            >
              Nhân viên? Truy cập Cổng thông tin hệ thống
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLearner;
