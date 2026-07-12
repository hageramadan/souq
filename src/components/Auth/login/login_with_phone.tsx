"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import PhoneInput from "@/components/contact/PhoneInput";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

export default function LoginWithPhone() {
  const { t } = useTranslation();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithPhone, loading, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: "",
    countryCode: "+20",
  });

  const [errors, setErrors] = useState<{
    phone?: string;
    password?: string;
  }>({});

  // إذا كان المستخدم مسجل دخول بالفعل، نوجهه للصفحة الرئيسية
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // عرض رسالة إذا تم التسجيل بنجاح
  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      toast.success(t("auth.registerSuccess"), {
        duration: 5000,
        position: "top-center",
      });
    }
  }, [searchParams, t]);

  // معالج تغيير رقم الهاتف
  const handlePhoneChange = (phoneNumber: string, countryCode: string) => {
    setFormData({
      ...formData,
      phoneNumber: phoneNumber,
      countryCode: countryCode,
    });

    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // ✅ التحقق من رقم الهاتف - فقط أن الحقل ليس فارغاً
    if (!formData.phoneNumber) {
      newErrors.phone = t("auth.phoneRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setIsSubmitting(true);

    // استخدام API حقيقي عبر الـ Context
    const result = await loginWithPhone(
      formData.phoneNumber,
      formData.countryCode,
    );

    if (result.success) {
      toast.success(result.message || t("auth.loginSuccess"), {
        duration: 3000,
        position: "top-center",
      });

      // ✅ التوجيه إلى صفحة OTP بعد تسجيل الدخول
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;
      setTimeout(() => {
        router.push(
          `/auth/verify-otp/phone?phone=${encodeURIComponent(fullPhone)}&isLogin=true`,
        );
      }, 1500);
    } else {
      toast.error(result.message || t("auth.loginError"), {
        duration: 4000,
        position: "top-center",
      });
    }

    setIsSubmitting(false);
  };

  const isLoading = loading || isSubmitting;

  return (
    <>
      <div className="bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="max-w-md mx-auto">
            {/* بطاقة تسجيل الدخول */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {/* العنوان */}
              <div className="text-center mb-3 md:mb-8">
                <h1 className="text-xl font-bold text-gray-800 mb-2">
                  {t("auth.loginTitle")}
                </h1>
                <p className="text-gray-500 text-sm">
                  {t("auth.loginSubtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* رقم الهاتف */}
                <div className="mb-5">
                  <label className="block text-gray-700 font-medium mb-2">
                    {t("auth.phoneLabel")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    value={`${formData.countryCode}${formData.phoneNumber}`}
                    onChange={handlePhoneChange}
                    required={true}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* زر تسجيل الدخول */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center gap-2 px-4 py-3 bg-[#2DA5F3] text-white rounded-[8px] hover:bg-[#37afff] transition font-medium ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("auth.loggingIn")}
                    </>
                  ) : (
                    t("auth.login")
                  )}
                </button>

                {/* رابط إنشاء حساب جديد */}
                <div className="text-center mt-6 pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    {t("auth.noAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/auth/register/phone")}
                      className="text-[#23A6F0] font-medium hover:underline"
                    >
                      {t("auth.createAccount")}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
