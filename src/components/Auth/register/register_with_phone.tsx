"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {FaUser} from "react-icons/fa";
import toast from "react-hot-toast";
import PhoneInput from "@/components/contact/PhoneInput";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

export default function RegisterWithPhone() {
  const { t } = useTranslation();
  const router = useRouter();
  const { registerWithPhone, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    countryCode: "+20",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

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

    // التحقق من الاسم
    if (!formData.name.trim()) {
      newErrors.name = t('auth.nameRequired');
    } else if (formData.name.trim().length < 3) {
      newErrors.name = t('auth.nameMinLength');
    }

    // التحقق من رقم الهاتف
    const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    
    if (!formData.phoneNumber) {
      newErrors.phone = t('auth.phoneRequired');
    } else if (!phoneRegex.test(fullPhone.replace(/\s/g, ""))) {
      newErrors.phone = t('auth.phoneInvalid');
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
    const result = await registerWithPhone(
      formData.name,
      formData.phoneNumber,
      formData.countryCode
    );

    if (result.success) {
      toast.success(result.message || t('auth.registerSuccess'), {
        duration: 4000,
        position: "top-center",
      });

      // ✅ التوجيه مباشرة إلى صفحة OTP للهاتف
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;
      setTimeout(() => {
        router.push(`/auth/verify-otp/phone?phone=${encodeURIComponent(fullPhone)}&isRegister=true`);
      }, 1500);
    } else {
      toast.error(result.message || t('auth.registerError'), {
        duration: 4000,
        position: "top-center",
      });
    }

    setIsSubmitting(false);
  };

  const clearFieldError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className=" bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-md mx-auto">
          {/* بطاقة تسجيل حساب جديد */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            {/* العنوان */}
            <div className="text-center mb-3 md:mb-8">
              <h1 className="text-xl font-bold text-gray-800 mb-2">
                {t('auth.registerTitle')}
              </h1>
              <p className="text-gray-500 text-sm">
                {t('auth.registerSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* الاسم */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('auth.nameLabel')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      clearFieldError("name");
                    }}
                    placeholder={t('auth.namePlaceholder')}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 ps-10 border text-base focus:border-[#5aafff] focus:ring-[#5aafff] rounded-[8px]   outline-none transition-colors ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } ${isLoading ? "opacity-50" : ""}`}
                    
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* رقم الهاتف */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t('auth.phoneLabel')} <span className="text-red-500">*</span>
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

              {/* زر إنشاء الحساب */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 px-4 py-3 bg-[#2DA5F3] text-white rounded-[8px] hover:bg-[#37afff] transition font-medium ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    {/* <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> */}
                    {t('auth.creatingAccount')}
                  </>
                ) : (
                  t('auth.createAccount')
                )}
              </button>

              {/* رابط تسجيل الدخول */}
              <div className="text-center mt-6 pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  {t('auth.haveAccount')}{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/auth/login")}
                    className="text-[#23A6F0] font-medium hover:underline"
                  >
                    {t('auth.login')}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}