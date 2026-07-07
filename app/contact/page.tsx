// app/contact/page.tsx
"use client";

import { useState, useEffect } from "react";
import ContactForm from "@/components/contact/ContactForm";
import ServicesSection from "@/components/contact/ServicesSection";
import { useLanguage } from "@/contexts/LanguageContext";

// ✅ دالة للحصول على الترجمات حسب اللغة
const getTranslations = (lang: string) => {
  if (lang === 'en') {
    return {
      title: "Contact Us",
      subtitle: "We'd love to hear from you! Fill out the form and we'll get back to you as soon as possible.",
    };
  }
  // Arabic (default)
  return {
    title: "تواصل معنا",
    subtitle: "نحن سعداء بتواصلك معنا! املأ النموذج وسنرد عليك في أقرب وقت ممكن.",
  };
};

export default function ContactPage() {
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // ✅ دالة مساعدة للحصول على النص المناسب
  const getText = (ar: string, en: string) => {
    if (!isClient) return ar; // على السيرفر استخدم العربية دائماً
    return language === 'en' ? en : ar;
  };
  
  // ✅ استخدم getText بدلاً من getTranslations
  const title = getText('تواصل معنا', 'Contact Us');
  const subtitle = getText(
    'نحن سعداء بتواصلك معنا! املأ النموذج وسنرد عليك في أقرب وقت ممكن.',
    "We'd love to hear from you! Fill out the form and we'll get back to you as soon as possible."
  );

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto">
        {/* عنوان الصفحة */}
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
            {title}
          </h1>
          {/* <p className="text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mt-7">
          <ContactForm />
          <ServicesSection />
        </div>
      </div>
    </div>
  );
}