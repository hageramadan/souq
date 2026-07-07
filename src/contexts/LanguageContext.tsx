// contexts/LanguageContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { updateUserLocale as apiUpdateUserLocale, UpdateProfileResponse } from '@/services/api';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  updateUserLocale: (locale: string) => Promise<UpdateProfileResponse>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ✅ دالة مساعدة للحصول على اللغة من localStorage (خارج الـ Component)
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('user_language');
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
      return savedLanguage;
    }
  }
  return 'ar';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ✅ استخدام قيمة أولية مباشرة بدون useEffect
  const [language, setLanguage] = useState<string>(getInitialLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const isInitialized = useRef(false);

  // ✅ تحديث HTML attributes عند تغير اللغة فقط
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // ✅ حفظ اللغة في localStorage عند تغيرها
    if (isInitialized.current) {
      localStorage.setItem('user_language', language);
    }
  }, [language]);

  // ✅ تهيئة HTML attributes عند التحميل الأول
  useEffect(() => {
    const initialLang = getInitialLanguage();
    
    // ✅ تحديث HTML attributes
    document.documentElement.lang = initialLang;
    document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
    
    // ✅ التأكد من أن اللغة في localStorage صحيحة
    localStorage.setItem('user_language', initialLang);
    
    isInitialized.current = true;
  }, []);

  // ✅ تحديث اللغة وحفظها
  const setLanguageAndStore = (lang: string) => {
    if (lang === 'ar' || lang === 'en') {
      setLanguage(lang);
      localStorage.setItem('user_language', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  // ✅ دالة تحديث اللغة في الباك اند
  const updateUserLocale = async (locale: string): Promise<UpdateProfileResponse> => {
    setIsLoading(true);
    try {
   
      const response = await apiUpdateUserLocale(locale);
      
      if (response.result && response.errNum === 200) {
        setLanguageAndStore(locale);
       
      } else {
        console.error('❌ Failed to update language in backend:', response.message);
        const savedLanguage = localStorage.getItem('user_language') || 'ar';
        setLanguageAndStore(savedLanguage);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error updating language:', error);
      const savedLanguage = localStorage.getItem('user_language') || 'ar';
      setLanguageAndStore(savedLanguage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetLanguage = (lang: string) => {
    if (lang === 'ar' || lang === 'en') {
      setLanguageAndStore(lang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        updateUserLocale,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};