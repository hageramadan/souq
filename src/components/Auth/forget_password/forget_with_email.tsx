"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { forgotPassword } from "@/services/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
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

    setIsLoading(true);

    const result = await forgotPassword({ email });

    if (result.result) {
      toast.success(result.message || "تم إرسال رمز التحقق إلى بريدك الإلكتروني! ✅", {
        duration: 3000,
      });
      
      // ✅ التوجيه إلى صفحة التحقق من OTP
      setTimeout(() => {
        router.push(`/auth/verify-forgot-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } else {
      toast.error(result.message || "فشل إرسال رمز التحقق");
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* <Toaster position="top-center" /> */}
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* زر الرجوع */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="text-sm">رجوع</span>
          </button>

          <div className="text-center mb-3 md:mb-8">
            <h1 className="text-xl font-bold text-gray-800 mb-2">نسيت كلمة المرور</h1>
            <p className="text-gray-500 text-sm">
              أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق لإعادة تعيين كلمة المرور
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({});
                  }}
                  placeholder="example@email.com"
                  disabled={isLoading}
                  className={`w-full px-4 py-2 ps-10 border rounded-[8px]   outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } ${isLoading ? "opacity-50" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-black text-white rounded-[8px] hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isLoading ? "جاري الإرسال..." : "التالي"}
            </button>

            <div className="text-center mt-6 pt-4 border-t">
              <p className="text-gray-600 text-sm">
                تذكرت كلمة المرور؟{" "}
                <button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="text-[#ff3c27] font-medium hover:underline"
                >
                  تسجيل الدخول
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}