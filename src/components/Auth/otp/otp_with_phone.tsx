"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

export default function OTPWithPhone() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTPWithPhone, resendOTPToPhone, isAuthenticated } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(59);
  const [canResend, setCanResend] = useState(false);
  
  // استقبال country_code و phone منفصلين
  const fullPhone = searchParams.get("phone") || "";
  const isLogin = searchParams.get("isLogin") === "true";
  const isRegister = searchParams.get("isRegister") === "true";
  
  // استخراج country_code و phone من الرقم الكامل
  let countryCode = "+20";
  let phoneNumber = fullPhone;
  
  if (fullPhone.startsWith("+20")) {
    countryCode = "+20";
    phoneNumber = fullPhone.substring(3);
  } else if (fullPhone.startsWith("+966")) {
    countryCode = "+966";
    phoneNumber = fullPhone.substring(4);
  } else if (fullPhone.startsWith("+971")) {
    countryCode = "+971";
    phoneNumber = fullPhone.substring(4);
  } else if (fullPhone.startsWith("+")) {
    const match = fullPhone.match(/^\+(\d{1,4})(.+)$/);
    if (match) {
      countryCode = `+${match[1]}`;
      phoneNumber = match[2];
    }
  }

  // التحقق من وجود رقم الهاتف
  useEffect(() => {
    if (!fullPhone) {
      toast.error(t('otp.phoneRequired'));
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  }, [fullPhone, router, t]);

  // إذا كان المستخدم مسجل دخول بالفعل
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // مؤقت إعادة الإرسال
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

  // ✅ دالة معالجة اللصق (Paste)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const pastedData = e.clipboardData.getData("text");
    const cleanedData = pastedData.replace(/\s/g, "").replace(/[^0-9]/g, "");
    
    if (cleanedData.length >= 6) {
      const otpDigits = cleanedData.slice(0, 6).split("");
      const newOtp = [...otp];
      otpDigits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      
      const lastFilledIndex = Math.min(otpDigits.length, 5);
      if (lastFilledIndex < 5) {
        document.getElementById(`otp-${lastFilledIndex + 1}`)?.focus();
      } else {
        document.getElementById(`otp-${lastFilledIndex}`)?.focus();
      }
    } else {
      const otpDigits = cleanedData.split("");
      const newOtp = [...otp];
      otpDigits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      
      const lastFilledIndex = Math.min(otpDigits.length, 5);
      if (lastFilledIndex < 5) {
        document.getElementById(`otp-${lastFilledIndex + 1}`)?.focus();
      }
      
      if (cleanedData.length > 0 && cleanedData.length < 6) {
        toast.error(t('otp.pasteIncomplete'), {
          duration: 2000,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error(t('otp.enterFullCode'));
      return;
    }

    setIsLoading(true);

    const result = await verifyOTPWithPhone(otpValue, phoneNumber, countryCode);

    if (result.success) {
      toast.success(t('otp.verifySuccess'), {
        duration: 2000,
      });
      
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } else {
      toast.error(result.message || t('otp.verifyError'));
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    if (!canResend) {
      toast.error(t('otp.waitBeforeResend'));
      return;
    }
    
    setIsLoading(true);

    const result = await resendOTPToPhone(phoneNumber, countryCode);

    if (result.success) {
      toast.success(result.message || t('otp.resendSuccess'), {
        duration: 3000,
      });
      setCanResend(false);
      setTimeLeft(59);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 100);
    } else {
      toast.error(result.message || t('otp.resendError'), {
        duration: 4000,
      });
    }

    setIsLoading(false);
  };

  // تحديد النص المناسب حسب نوع العملية
  const getTitle = () => {
    if (isLogin) return t('otp.loginTitle');
    if (isRegister) return t('otp.registerTitle');
    return t('otp.defaultTitle');
  };

  const getSubtitle = () => {
    if (isLogin) return t('otp.loginSubtitle');
    if (isRegister) return t('otp.registerSubtitle');
    return t('otp.defaultSubtitle');
  };

  return (
    <>
      <div className=" bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center p-4">
        <div className="lg:max-w-md w-full bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-3 md:mb-8">
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              {getTitle()}
            </h1>
            <p className="text-gray-500 text-sm">
              {getSubtitle()}
            </p>
            <p className="text-gray-700 font-medium mt-2 direction-ltr" dir="ltr">
              {`${countryCode} ${phoneNumber}`}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-between gap-0 lg:gap-2 mb-6 flex-row-reverse" dir="rtl">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className="w-10 h-10 md:w-14 md:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-[8px] focus:border-[#23A6F0]  focus:ring-[#23A6F0]/20 outline-none transition-all disabled:opacity-50"
                  maxLength={1}
                  dir="ltr"
                />
              ))}
            </div>

            <div className="text-center mb-6">
              {!canResend ? (
                <p className="text-gray-500 text-sm">
                  {t('otp.didNotReceive')}{" "}
                  <span className="text-[#23A6F0] font-semibold" >
                    {t('otp.resendIn')} 
                    <span className="ms-1 font-bold">{timeLeft.toString().padStart(2, "0")} {t('otp.seconds')}</span>
                    
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-[#23A6F0] font-medium hover:underline transition disabled:opacity-50"
                >
                  {t('otp.resendNow')}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#23A6F0] text-white rounded-[8px] hover:bg-[#33adf3] transition disabled:opacity-50 font-medium"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></span>
                  {t('otp.verifying')}
                </>
              ) : (
                t('otp.verify')
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}