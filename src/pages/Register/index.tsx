/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  register as registerService,
  verifyOtp,
  resendOtp,
} from "../../services/auth";
import { notifySuccess, notifyError } from "../../utils/toastConfig";
import type { AxiosError } from "axios";
import {
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  GraduationCap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import BackgroundImage from "@/assets/background-image.avif";
import LoadingScreen from "@/components/Loading/LoadingScreen";
const Register: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [userEmail, setUserEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRestoringState, setIsRestoringState] = useState(true);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [otpValue, setOtpValue] = useState("");

  const registerMutation = useMutation({
    mutationFn: registerService,
    onSuccess: (data, variables) => {
      if (data.success) {
        notifySuccess(data.message || "OTP sent to your email!");
        setUserEmail(variables.email);
        setStep("verify");
        localStorage.setItem("registerStep", "verify");
        localStorage.setItem("userEmail", variables.email);
        const expiry = Date.now() + 5 * 60 * 1000;
        localStorage.setItem("otpExpiry", expiry.toString());
        setTimeLeft(300);
      }
    },
    onError: (err: AxiosError<any>) =>
      notifyError(err?.response?.data?.message || "Đăng ký không thành công!"),
  });

  const verifyMutation = useMutation({
    mutationFn: (values: { email: string; otpCode: string }) =>
      verifyOtp(values),
    onSuccess: (data) => {
      if (data.success) {
        notifySuccess("Tài khoản đã được xác minh thành công!");
        localStorage.removeItem("otpExpiry");
        localStorage.removeItem("registerStep");
        localStorage.removeItem("userEmail");
        navigate("/login");
      }
    },
    onError: (err: AxiosError<any>) =>
      notifyError(err?.response?.data?.message || "OTP không hợp lệ"),
  });

  const resendMutation = useMutation({
    mutationFn: () => resendOtp({ email: userEmail }),
    onSuccess: (data) => {
      if (data.success) {
        notifySuccess("OTP mới được gửi!");
        const expiry = Date.now() + 5 * 60 * 1000;
        localStorage.setItem("otpExpiry", expiry.toString());
        setTimeLeft(300);
      }
    },
  });

  useEffect(() => {
    const savedStep = localStorage.getItem("registerStep");
    const savedEmail = localStorage.getItem("userEmail");
    if (savedStep === "verify" && savedEmail) {
      setStep("verify");
      setUserEmail(savedEmail);
    }

    const expiryStr = localStorage.getItem("otpExpiry");
    if (expiryStr) {
      const diff = Math.floor((parseInt(expiryStr) - Date.now()) / 1000);
      if (diff > 0) setTimeLeft(diff);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    setIsRestoringState(false);
    return () => clearInterval(timer);
  }, []);

  const resetRegistration = () => {
    localStorage.removeItem("otpExpiry");
    localStorage.removeItem("registerStep");
    localStorage.removeItem("userEmail");
    setStep("register");
    setUserEmail("");
    setTimeLeft(0);
    setOtpValue("");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const onRegisterSubmit = (data: any) => {
    registerMutation.mutate(data);
  };

  const onVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length === 6) {
      verifyMutation.mutate({ email: userEmail, otpCode: otpValue });
    }
  };

  if (isRestoringState || verifyMutation.isSuccess) {
    return (
      <LoadingScreen
        message={
          verifyMutation.isSuccess
            ? "Thiết lập hoàn tất. Đang chuyển hướng..."
            : "Đang khởi tạo đăng ký..."
        }
      />
    );
  }
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      <div className="hidden bg-muted lg:block relative">
        <div className="absolute inset-0 bg-zinc-700">
          <img
            src={BackgroundImage}
            alt="Students collaborating"
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
                &ldquo;The beautiful thing about learning is that no one can
                take it away from you.&rdquo;
              </p>
              <footer className="text-sm text-zinc-300">B.B. King</footer>
            </blockquote>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 md:top-8 md:left-8 cursor-pointer"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="mr-2 h-4 w-4 " /> Quay lại đăng nhập
        </Button>
        <div className="mx-auto grid w-full max-w-[450px] gap-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {step === "register"
                ? "Tạo một tài khoản"
                : "Xác minh email của bạn"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {step === "register"
                ? "Nhập thông tin chi tiết của bạn bên dưới để tạo tài khoản"
                : `Chúng tôi đã gửi một mã đến ${userEmail}`}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className={`h-2 w-16 rounded-full transition-colors ${
                step === "register" ? "bg-primary" : "bg-primary/20"
              }`}
            />
            <div
              className={`h-2 w-16 rounded-full transition-colors ${
                step === "verify" ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>

          {step === "register" && (
            <form
              onSubmit={handleSubmit(onRegisterSubmit)}
              className="grid gap-4 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="grid gap-2">
                <Label htmlFor="userName">Username</Label>
                <Input
                  id="userName"
                  placeholder="johndoe"
                  {...register("userName", {
                    required: "Tên người dùng là bắt buộc",
                  })}
                  className={errors.userName ? "border-red-500" : ""}
                />
                {errors.userName && (
                  <span className="text-xs text-red-500">
                    {errors.userName.message as string}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email", {
                    required: "Email là bắt buộc",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Địa chỉ email không hợp lệ",
                    },
                  })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <span className="text-xs text-red-500">
                    {errors.email.message as string}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tạo mật khẩu"
                    {...register("password", {
                      required: "Cần có mật khẩu",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự",
                      },
                    })}
                    className={
                      errors.password ? "border-red-500 pr-10" : "pr-10"
                    }
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
                    {errors.password.message as string}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu của bạn"
                    {...register("confirmPassword", {
                      validate: (val: string) => {
                        if (watch("password") != val) {
                          return "Mật khẩu của bạn không khớp";
                        }
                      },
                    })}
                    className={
                      errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? (
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
                className="w-full bg-black !text-white hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Tiếp tục
              </Button>
            </form>
          )}
          {step === "verify" && (
            <form
              onSubmit={onVerifySubmit}
              className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-primary/5 p-4 rounded-full">
                  <Mail className="h-8 w-8 text-primary" />
                </div>

                <div className="flex justify-center w-full">
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={(value) => setOtpValue(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                      <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nhập mã gồm 6 chữ số được gửi đến email của bạn.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-black !text-white hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                disabled={otpValue.length < 6 || verifyMutation.isPending}
              >
                {verifyMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Xác minh tài khoản
              </Button>

              <Separator />

              <div className="flex flex-col items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    Không nhận được mã?
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => resendMutation.mutate()}
                    disabled={timeLeft > 0 || resendMutation.isPending}
                  >
                    {timeLeft > 0
                      ? `Gửi lại ${formatTime(timeLeft)}`
                      : "Gửi lại OTP"}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetRegistration}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Nhập sai email? Hãy thay đổi
                </Button>
              </div>
            </form>
          )}
          <div className="text-center text-sm mt-2">
            Đã có tài khoản?{" "}
            <span
              onClick={() => navigate("/login")}
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              Đăng nhập
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
