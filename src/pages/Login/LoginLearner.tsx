/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loginLearner, loginWithGoogle } from "../../services/auth";
import { notifyError, notifySuccess } from "../../utils/toastConfig";
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

const SYSTEM_DOMAIN = "https://system-flearn.netlify.app";

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
            notifyError(
              "Account has Staff privileges. Please login at the System Portal."
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
      notifyError(err?.response?.data?.message || "Login failed"),
  });

  const googleMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data: any) => handleAuthSuccess(data.data),
    onError: () => notifyError("Google login failed"),
  });

  const handleAuthSuccess = (data: any) => {
    const roles = data.roles || [];
    const isStaff = roles.some((r: string) =>
      ["admin", "manager", "teacher"].includes(r.toLowerCase())
    );
    if (isStaff) {
      notifyError("You are a Staff member. Please use the System Portal.");
      setTimeout(() => {
        window.location.href = SYSTEM_DOMAIN;
      }, 1500);
      return;
    }

    localStorage.setItem("FLEARN_ACCESS_TOKEN", data.accessToken);
    localStorage.setItem("FLEARN_REFRESH_TOKEN", data.refreshToken);
    localStorage.setItem("FLEARN_USER_ROLES", JSON.stringify(data.roles));
    updateAuth();
    notifySuccess("Welcome back to Flearn!");
    navigate("/learner");
  };

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (isCheckingAuth || mutation.isSuccess || googleMutation.isSuccess) {
    return <LoadingScreen message="Verifying secure session..." />;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#06b6d4',
          borderRadius: 16,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      }}>
      <div className="min-h-screen flex bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

        {/* Left Hero Section */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-12 relative z-10">
          <div className="max-w-lg text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-cyan-200">Flearn</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed mb-8">
              Master new skills, connect with expert teachers, and unlock your full learning
              potential.
            </p>
            <p className="text-lg opacity-80">
              Join thousands of learners already growing with Flearn
            </p>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
              {/* Logo */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Learner Sign In</h2>
                <p className="text-gray-600 mt-2">
                  Welcome back! Please login to your learner account
                </p>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={mutation.mutate}>
                <Form.Item
                  name="usernameOrEmail"
                  rules={[{ required: true, message: 'Please enter your username or email!' }]}>
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Username or Email"
                    className="h-14 text-lg rounded-xl border-gray-300 hover:border-cyan-500 focus:border-cyan-500"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please enter your password!' }]}>
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Password"
                    className="h-14 text-lg rounded-xl border-gray-300 hover:border-cyan-500 focus:border-cyan-500"
                  />
                </Form.Item>

                <div className="flex justify-between items-center mb-6">
                  <Form.Item
                    name="rememberMe"
                    valuePropName="checked"
                    noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                  <Button
                    type="link"
                    onClick={() => navigate('/forgot-password')}
                    className="text-cyan-600 font-medium hover:text-cyan-700">
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={mutation.isPending || googleMutation.isPending}
                  className="h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  Sign In
                </Button>

                <div className="text-center my-6 text-gray-500 font-medium">
                  — or continue with —
                </div>

                <div
                  id="googleSignInDiv"
                  className="flex justify-center"
                />

                <div className="text-center mt-8">
                  <span className="text-gray-600">New to Flearn? </span>
                  <Button
                    type="link"
                    onClick={() => navigate('/register')}
                    className="text-cyan-600 font-semibold hover:text-cyan-700">
                    Create a learner account
                  </Button>
                  <br />
                  <span className="text-gray-600">Staff member? </span>
                  <Button
                    type="link"
                    onClick={() => navigate('/dashboard/login')}
                    className="text-cyan-600 font-semibold hover:text-cyan-700">
                    Go to Dashboard Login
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLearner;
