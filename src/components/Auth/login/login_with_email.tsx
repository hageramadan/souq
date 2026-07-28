"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginWithEmail() {
  const router = useRouter();
  const { loginWithEmail, loading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error(Object.values(errors)[0]);
      return;
    }

    setIsSubmitting(true);
    const result = await loginWithEmail(formData.email, formData.password);

    if (result.success) {
      toast.success(result.message || "تم إرسال رمز التحقق إلى بريدك الإلكتروني! ✅", {
        duration: 3000,
      });
      
      setTimeout(() => {
        router.push(`/auth/verify-otp/email?email=${encodeURIComponent(formData.email)}&isLogin=true`);
      }, 1500);
    } else {
      toast.error(result.message || "فشل تسجيل الدخول");
    }
    setIsSubmitting(false);
  };

  const isLoading = loading || isSubmitting;

  return (
    <>
    
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-3 md:mb-8">
            <h1 className="text-xl font-bold text-gray-800 mb-2">تسجيل الدخول</h1>
            <p className="text-gray-500 text-sm">مرحباً بعودتك! يرجى تسجيل الدخول</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">البريد الإلكتروني *</label>
              <div className="relative">
                <FaEnvelope className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  disabled={isLoading}
                  className={`w-full px-4 py-2 ps-10 border rounded-[8px]   outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">كلمة المرور *</label>
              <div className="relative">
                <FaLock className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`w-full px-4 text-sm  py-2 ps-10 pe-10 border rounded-[8px]   outline-none ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* ✅ إضافة رابط نسيت كلمة المرور */}
            <div className="text-left mb-6">
              <button
                type="button"
                onClick={() => router.push("/auth/forgot-password")}
                className="text-sm text-[#ff3c27] hover:underline"
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-black text-white rounded-[8px] hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isLoading ? "  تسجيل الدخول..." : "تسجيل الدخول"}
            </button>

            <div className="text-center mt-6 pt-4 border-t">
              <p className="text-gray-600 text-sm">
                ليس لديك حساب؟{" "}
                <button
                  type="button"
                  onClick={() => router.push("/auth/register/email")}
                  className="text-[#ff3c27] font-medium hover:underline"
                >
                  إنشاء حساب جديد
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}