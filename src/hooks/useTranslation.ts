// hooks/useTranslation.ts
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// ✅ استيراد ملفات الترجمه
import ar from '../../public/locales/ar.json';
import en from '../../public/locales/en.json';



const translations = { ar, en };

export function useTranslation() {
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // ✅ دالة لاستبدال المتغيرات في النص
  const replaceVariables = (text: string, variables?: Record<string, string | number>): string => {
    if (!variables) return text;
    
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    return result;
  };
  
  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    // ✅ على السيرفر استخدم العربية دائماً
    if (!isClient) {
      const keys = key.split('.');
      let result: any = translations.ar;
      for (const k of keys) {
        if (result && result[k] !== undefined) {
          result = result[k];
        } else {
          return key; // لو مش موجود، يرجع المفتاح نفسه
        }
      }
      const text = typeof result === 'string' ? result : key;
      return replaceVariables(text, variables);
    }
    
    // ✅ على العميل استخدم اللغة المناسبة
    const lang = language === 'en' ? 'en' : 'ar';
    const keys = key.split('.');
    let result: any = translations[lang];
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        return key;
      }
    }
    const text = typeof result === 'string' ? result : key;
    return replaceVariables(text, variables);
  }, [isClient, language]);
  
  return { t, language, isClient };
}