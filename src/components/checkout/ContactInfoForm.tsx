// // components/checkout/ContactInfoForm.tsx
// "use client";

// import { useState } from "react";
// import { ContactInfoFormProps } from "./types";
// import PhoneInput from "@/components/contact/PhoneInput";
// import { Mail } from "lucide-react";
// import { useTranslation } from "@/hooks/useTranslation";

// // دالة التحقق من الاسم الكامل
// const validateFullName = (name: string, t: any): string | null => {
//   if (!name.trim()) {
//     return t('checkout.fullNameRequired');
//   }
//   if (name.trim().length < 3) {
//     return t('checkout.fullNameMinLength');
//   }
//   if (name.trim().length > 100) {
//     return t('checkout.fullNameMaxLength');
//   }
//   return null;
// };

// // ✅ دالة التحقق من البريد الإلكتروني
// const validateEmail = (email: string, t: any): string | null => {
//   if (!email.trim()) {
//     return t('checkout.emailRequired');
//   }
//   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//     return t('checkout.emailInvalid');
//   }
//   return null;
// };

// interface ContactInfoFormExtendedProps extends ContactInfoFormProps {
//   isGuest?: boolean;
// }

// export default function ContactInfoForm({ 
//   formData, 
//   onFormChange,
//   isGuest = false
// }: ContactInfoFormExtendedProps) {
//   const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  
//   const [nameError, setNameError] = useState<string | null>(null);
//   const [isNameTouched, setIsNameTouched] = useState(false);
//   const [emailError, setEmailError] = useState<string | null>(null);
//   const [isEmailTouched, setIsEmailTouched] = useState(false);

//   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     onFormChange({ fullName: value });
    
//     if (isNameTouched) {
//       const error = validateFullName(value, t);
//       setNameError(error);
//     }
//   };

//   const handleNameBlur = () => {
//     setIsNameTouched(true);
//     const error = validateFullName(formData.fullName, t);
//     setNameError(error);
//   };

//   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     onFormChange({ email: value });
    
//     if (isEmailTouched) {
//       const error = validateEmail(value, t);
//       setEmailError(error);
//     }
//   };

//   const handleEmailBlur = () => {
//     setIsEmailTouched(true);
//     const error = validateEmail(formData.email || "", t);
//     setEmailError(error);
//   };

//   const handlePhoneChange = (phoneNumber: string, countryCode: string) => {
//     const fullPhone = `${countryCode}${phoneNumber}`;
//     onFormChange({ 
//       phone: fullPhone,
//       phoneNumber: phoneNumber,
//       phoneCountryCode: countryCode
//     });
//   };

//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
//       <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//         {t('checkout.contactInfo')}
//       </h2>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             {t('checkout.fullName')} <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             value={formData.fullName}
//             onChange={handleNameChange}
//             onBlur={handleNameBlur}
//             placeholder={t('checkout.fullNamePlaceholder')}
//             className={`w-full px-4 py-3 border rounded-[8px] focus:outline-none  focus:ring-[#23A6F0]  transition ${
//               nameError && isNameTouched
//                 ? "border-red-500 focus:ring-red-500"
//                 : "border-gray-200"
//             }`}
//           />
//           {nameError && isNameTouched && (
//             <p className="text-red-500 text-sm mt-1">{nameError}</p>
//           )}
//         </div>
        
//         <div className="h-auto">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             {t('checkout.phone')} <span className="text-red-500">*</span>
//           </label>
//           <PhoneInput
//             value={formData.phone || ""}
//             onChange={handlePhoneChange}
//             required={true}
//           />
//         </div>
//       </div>

//       {isGuest && (
//         <div className="mt-4">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             {t('checkout.email')} <span className="text-red-500">*</span>
//           </label>
//           <div className="relative">
//             <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="email"
//               value={formData.email || ""}
//               onChange={handleEmailChange}
//               onBlur={handleEmailBlur}
//               placeholder={t('checkout.emailPlaceholder')}
//               className={`w-full ps-12 pe-4 py-3 border rounded-[8px] focus:outline-none  focus:ring-[#23A6F0]  transition ${
//                 emailError && isEmailTouched
//                   ? "border-red-500 focus:ring-red-500"
//                   : "border-gray-200"
//               }`}
//             />
//           </div>
//           {emailError && isEmailTouched && (
//             <p className="text-red-500 text-sm mt-1">{emailError}</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// components/checkout/ContactInfoForm.tsx
"use client";

import { useState } from "react";
import { ContactInfoFormProps } from "./types";
import PhoneInput from "@/components/contact/PhoneInput";
import { Mail } from "lucide-react";

// دالة التحقق من الاسم الكامل
const validateFullName = (name: string, t: any): string | null => {
  if (!name.trim()) {
    return t('checkout.fullNameRequired');
  }
  if (name.trim().length < 3) {
    return t('checkout.fullNameMinLength');
  }
  if (name.trim().length > 100) {
    return t('checkout.fullNameMaxLength');
  }
  return null;
};

// دالة التحقق من البريد الإلكتروني
const validateEmail = (email: string, t: any): string | null => {
  if (!email.trim()) {
    return t('checkout.emailRequired');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return t('checkout.emailInvalid');
  }
  return null;
};

interface ContactInfoFormExtendedProps extends ContactInfoFormProps {
  isGuest?: boolean;
  t: any; // ✅ إضافة t
}

export default function ContactInfoForm({ 
  formData, 
  onFormChange,
  isGuest = false,
  t // ✅ استقبال t
}: ContactInfoFormExtendedProps) {
  const [nameError, setNameError] = useState<string | null>(null);
  const [isNameTouched, setIsNameTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailTouched, setIsEmailTouched] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFormChange({ fullName: value });
    
    if (isNameTouched) {
      const error = validateFullName(value, t);
      setNameError(error);
    }
  };

  const handleNameBlur = () => {
    setIsNameTouched(true);
    const error = validateFullName(formData.fullName, t);
    setNameError(error);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFormChange({ email: value });
    
    if (isEmailTouched) {
      const error = validateEmail(value, t);
      setEmailError(error);
    }
  };

  const handleEmailBlur = () => {
    setIsEmailTouched(true);
    const error = validateEmail(formData.email || "", t);
    setEmailError(error);
  };

  const handlePhoneChange = (phoneNumber: string, countryCode: string) => {
    const fullPhone = `${countryCode}${phoneNumber}`;
    onFormChange({ 
      phone: fullPhone,
      phoneNumber: phoneNumber,
      phoneCountryCode: countryCode
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        {t('checkout.contactInfo')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.fullName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            placeholder={t('checkout.fullNamePlaceholder')}
            className={`w-full px-4 py-3 border rounded-[8px] focus:outline-none  focus:ring-[#23A6F0]  transition ${
              nameError && isNameTouched
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200"
            }`}
          />
          {nameError && isNameTouched && (
            <p className="text-red-500 text-sm mt-1">{nameError}</p>
          )}
        </div>
        
        <div className="h-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.phone')} <span className="text-red-500">*</span>
          </label>
          <PhoneInput
            value={formData.phone || ""}
            onChange={handlePhoneChange}
            required={true}
          />
        </div>
      </div>

      {isGuest && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.email')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email || ""}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder={t('checkout.emailPlaceholder')}
              className={`w-full ps-12 pe-4 py-3 border rounded-[8px] focus:outline-none  focus:ring-[#23A6F0]  foucs:ring-2  transition ${
                emailError && isEmailTouched
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200"
              }`}
            />
          </div>
          {emailError && isEmailTouched && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </div>
      )}
    </div>
  );
}