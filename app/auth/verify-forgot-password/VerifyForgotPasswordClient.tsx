"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { verifyForgotPassword } from "@/services/api";

export default function VerifyForgotPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(59);
  const [canResend, setCanResend] = useState(false);
  
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      toast.error("البريد الإلكتروني مطلوب للتحقق");
      setTimeout(() => router.push("/auth/forgot-password"), 2000);
    }
  }, [email, router]);

  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("يرجى إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }

    setIsLoading(true);

    const result = await verifyForgotPassword({ otp: otpValue, email });

    if (result.result) {
      toast.success("تم التحقق بنجاح! ✅");
      
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } else {
      toast.error(result.message || "رمز التحقق غير صحيح");
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    
    const { forgotPassword } = await import("@/services/api");
    const result = await forgotPassword({ email });

    if (result.result) {
      toast.success("تم إرسال رمز جديد إلى بريدك الإلكتروني");
      setCanResend(false);
      setTimeLeft(59);
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } else {
      toast.error(result.message || "فشل إعادة إرسال الرمز");
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

          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-800 mb-2">التحقق من البريد الإلكتروني</h1>
            <p className="text-gray-500 text-sm">
              أدخل الرقم المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني
            </p>
            <p className="text-gray-700 font-medium mt-2 break-all">{email}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-between gap-2 mb-6 flex-row-reverse">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-[8px] focus:border-[#ff3c27] focus:ring-2 focus:ring-[#ff3c27]/20 outline-none transition-all disabled:opacity-50"
                  maxLength={1}
                />
              ))}
            </div>

            <div className="text-center mb-6">
              {!canResend ? (
                <p className="text-gray-500 text-sm">
                  لم تستلم الرمز؟{" "}
                  <span className="text-[#ff3c27] font-medium">
                    إعادة الإرسال ({timeLeft.toString().padStart(2, "0")} ثانية)
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-[#ff3c27] font-medium hover:underline disabled:opacity-50"
                >
                  لم تستلم الرمز؟ إعادة إرسال
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-black text-white rounded-[8px] hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isLoading ? "جاري التحقق..." : "تحقق"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}