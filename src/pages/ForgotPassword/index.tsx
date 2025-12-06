/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/auth";
import { notifySuccess, notifyError } from "../../utils/toastConfig";
import type { AxiosError } from "axios";
import { Loader2, ArrowLeft, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackgroundImage from "@/assets/background-image-03.avif";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailOrUsername: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: { emailOrUsername: string }) => forgotPassword(values),
    onSuccess: (data, variables) => {
      if (data.success) {
        notifySuccess(data.message || "Mã OTP đã được gửi đến email của bạn!");
        localStorage.setItem("resetEmail", variables.emailOrUsername);
        navigate("/reset-password");
      }
    },
    onError: (err: AxiosError<any>) =>
      notifyError(err?.response?.data?.message || "Không gửi được OTP"),
  });

  const onSubmit = (values: { emailOrUsername: string }) => {
    mutation.mutate(values);
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      <div className="hidden bg-muted lg:block relative">
        <div className="absolute inset-0 bg-zinc-900">
          <img
            src={BackgroundImage}
            alt="Security"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        </div>
        <div className="relative z-20 flex h-full flex-col justify-end p-10 text-white">
          <div className="mb-10">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Security is not a product, but a process.&rdquo;
              </p>
              <footer className="text-sm text-zinc-300">Bruce Schneier</footer>
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại đăng nhập
        </Button>

        <div className="mx-auto grid w-full max-w-[400px] gap-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight text-foreground">
              <KeyRound className="h-6 w-6" />
              Quên mật khẩu?
            </h1>
            <p className="text-muted-foreground text-sm">
              Đừng lo lắng, chúng tôi sẽ gửi cho bạn hướng dẫn thiết lập lại.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email hoặc Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="Nhập email của bạn"
                  className={`pl-9 ${
                    errors.emailOrUsername ? "border-red-500" : ""
                  }`}
                  {...register("emailOrUsername", {
                    required: "Email hoặc Username là bắt buộc",
                  })}
                />
              </div>
              {errors.emailOrUsername && (
                <span className="text-xs text-red-500">
                  {errors.emailOrUsername.message as string}
                </span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer !text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Gửi mã đặt lại
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
