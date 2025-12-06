/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/auth";
import { notifySuccess, notifyError } from "../../utils/toastConfig";
import type { AxiosError } from "axios";
import { Loader2, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import BackgroundImage from "@/assets/background-image-03.avif";
const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (storedEmail) setUserEmail(storedEmail);
    else {
      // Nếu không tìm thấy email (do người dùng copy link), redirect về forgot
      navigate("/forgot-password");
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otpCode: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: any) =>
      resetPassword({
        email: userEmail,
        otpCode: values.otpCode,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }),
    onSuccess: (data) => {
      if (data.success) {
        notifySuccess(data.message || "Password reset successful!");
        localStorage.removeItem("resetEmail");
        navigate("/login");
      }
    },
    onError: (err: AxiosError<any>) => {
      if (err?.response?.data?.errors?.NewPassword) {
        notifyError(err.response.data.errors.NewPassword[0]);
      } else {
        notifyError(err?.response?.data?.message || "Failed to reset password");
      }
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      <div className="hidden bg-muted lg:block relative">
        <div className="absolute inset-0 bg-zinc-900">
          <img
            src={BackgroundImage}
            alt="Lock"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        </div>
        <div className="relative z-20 flex h-full flex-col justify-end p-10 text-white">
          <div className="mb-10">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Your password is the key to your digital kingdom. Keep it
                safe.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 md:top-8 md:left-8 cursor-pointer !text-foreground"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Hủy
        </Button>

        <div className="mx-auto grid w-full max-w-[400px] gap-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Đặt mật khẩu mới
            </h1>
            <p className="text-muted-foreground text-sm">
              Nhập mã được gửi đến{" "}
              <span className="font-medium text-foreground">{userEmail}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* OTP INPUT */}
            <div className="flex flex-col items-center space-y-2">
              <Label>OTP Code</Label>
              <InputOTP
                maxLength={6}
                value={watch("otpCode")}
                onChange={(val) => setValue("otpCode", val)}
              >
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    className="w-10 h-10 md:w-12 md:h-12"
                  />
                  <InputOTPSlot
                    index={1}
                    className="w-10 h-10 md:w-12 md:h-12"
                  />
                  <InputOTPSlot
                    index={2}
                    className="w-10 h-10 md:w-12 md:h-12"
                  />
                  <InputOTPSlot
                    index={3}
                    className="w-10 h-10 md:w-12 md:h-12"
                  />
                  <InputOTPSlot
                    index={4}
                    className="w-10 h-10 md:w-12 md:h-12"
                  />
                  <InputOTPSlot
                    index={5}
                    className="w-10 h-10 md:w-12 md:h-12"
                  />
                </InputOTPGroup>
              </InputOTP>
              {errors.otpCode && (
                <span className="text-xs text-red-500">OTP là bắt buộc</span>
              )}
            </div>

            {/* PASSWORD INPUTS */}
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPass ? "text" : "password"}
                  placeholder="Tối thiểu 8 ký tự"
                  className={
                    errors.newPassword ? "border-red-500 pr-10" : "pr-10"
                  }
                  {...register("newPassword", {
                    required: "Cần có mật khẩu",
                    minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPass ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <span className="text-xs text-red-500">
                  {errors.newPassword.message as string}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  className={
                    errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"
                  }
                  {...register("confirmPassword", {
                    validate: (val) => {
                      if (watch("newPassword") !== val)
                        return "Mật khẩu không khớp";
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showConfirmPass ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-xs text-red-500">
                  {errors.confirmPassword.message as string}
                </span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2 cursor-pointer !text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Đặt lại mật khẩu
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
