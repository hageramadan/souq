// components/contact/PhoneInput.tsx
"use client";

import { useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";

interface PhoneInputProps {
  value: string;
  onChange: (phone: string, countryCode: string) => void;
  required?: boolean;
}

interface CountryCode {
  code: string;
  countryKey: string; // ✅ مفتاح للترجمة بدلاً من النص الثابت
  countryCode: string;
  placeholder: string;
  example: string;
  pattern: RegExp;
  minLength: number;
  maxLength: number;
  startsWith: string[];
  startsWithoutZero?: string[];
  allowLeadingZero?: boolean;
}

// ✅ بيانات الدول مع مفاتيح الترجمة
const countryCodes: CountryCode[] = [
  { 
    code: "+20", 
    countryKey: "Egypt",
    countryCode: "EG",
    placeholder: "01234567890",
    example: "01234567890",
    pattern: /^(01[0125][0-9]{8})|(1[0125][0-9]{8})$/,
    minLength: 11,
    maxLength: 11,
    startsWith: ["010", "011", "012", "015"],
    startsWithoutZero: ["10", "11", "12", "15"],
    allowLeadingZero: true
  },
  { 
    code: "+966", 
    countryKey: "SaudiArabia",
    countryCode: "SA",
    placeholder: "0512345678",
    example: "0512345678",
    pattern: /^(05[0-9]{8})|(5[0-9]{8})$/,
    minLength: 9,
    maxLength: 10,
    startsWith: ["05"],
    startsWithoutZero: ["5"],
    allowLeadingZero: true
  },
  { 
    code: "+964", 
    countryKey: "Iraq",
    countryCode: "IQ",
    placeholder: "07701234567",
    example: "07701234567",
    pattern: /^(07[0-9]{9})|(7[0-9]{9})$/,
    minLength: 11,
    maxLength: 11,
    startsWith: ["07"],
    startsWithoutZero: ["7"],
    allowLeadingZero: true
  },
  { 
    code: "+971", 
    countryKey: "UAE",
    countryCode: "AE",
    placeholder: "0501234567",
    example: "0501234567",
    pattern: /^(05[0-9]{8})|(5[0-9]{8})$/,
    minLength: 9,
    maxLength: 9,
    startsWith: ["05"],
    startsWithoutZero: ["5"],
    allowLeadingZero: true
  },
];

// ✅ دالة مساعدة لتنسيق رسالة الخطأ (مدعومة بالترجمة)
const getErrorMessage = (
  country: CountryCode, 
  type: 'prefix' | 'pattern' | 'length', 
  t: any,
  getCountryName: (country: CountryCode) => string
): string => {
  const countryName = getCountryName(country);
  const prefixList = country.startsWith.join(" أو ");
  
  switch (type) {
    case 'prefix':
      return t('contact.validation.mustStartWith')
        .replace('{country}', countryName)
        .replace('{prefixes}', prefixList);
    case 'pattern':
      return t('contact.validation.invalidExample')
        .replace('{example}', country.example);
    case 'length':
      return t('contact.validation.mustBeDigits')
        .replace('{length}', country.minLength.toString())
        .replace('{example}', country.example);
    default:
      return t('contact.invalid');
  }
};

export default function PhoneInput({ value, onChange, required = false }: PhoneInputProps) {
  const { t } = useTranslation();

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [error, setError] = useState("");
  const [localPhoneNumber, setLocalPhoneNumber] = useState("");
  const [isTouched, setIsTouched] = useState(false);

  // استخراج كود الدولة والرقم من القيمة الأولية
  useEffect(() => {
    if (value) {
      let matchedCountry: CountryCode | undefined;
      let phoneNumber = value;
      
      for (const country of countryCodes) {
        if (value.startsWith(country.code)) {
          matchedCountry = country;
          phoneNumber = value.replace(country.code, "");
          break;
        }
      }
      
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        const cleanNumber = phoneNumber.replace(/[\s\-]/g, "");
        setLocalPhoneNumber(cleanNumber);
      } else if (value) {
        const cleanNumber = value.replace(/[\s\-]/g, "");
        setLocalPhoneNumber(cleanNumber);
      }
    }
  }, [value]);

  // ✅ الحصول على اسم الدولة المترجم
  const getCountryName = (country: CountryCode): string => {
    return t(`countries.${country.countryKey}`) || country.countryKey;
  };

  // التحقق من الرقم حسب الدولة
  const validatePhoneNumber = (phoneNumber: string, country: CountryCode): boolean => {
    if (!phoneNumber && required) {
      setError(t('contact.phoneRequired'));
      return false;
    }
    
    if (!phoneNumber) {
      setError("");
      return false;
    }
    
    // إزالة المسافات والشرطات
    const cleanNumber = phoneNumber.replace(/[\s\-]/g, "");
    
    // التحقق من أن الإدخال أرقام فقط
    if (!/^\d+$/.test(cleanNumber)) {
      setError(t('contact.onlyDigits'));
      return false;
    }

    // ✅ التحقق من البداية (مع أو بدون 0)
    let isValidPrefix = false;
    const actualNumber = cleanNumber;

    // التحقق من البادئة مع 0 أو بدون 0
    const prefixesWithZero = country.startsWith || [];
    const prefixesWithoutZero = country.startsWithoutZero || [];

    // نتحقق من جميع البادئات (مع وبدون 0)
    const allPrefixes = [...prefixesWithZero, ...prefixesWithoutZero];
    
    isValidPrefix = allPrefixes.some(prefix => cleanNumber.startsWith(prefix));
    
    if (!isValidPrefix) {
      setError(getErrorMessage(country, 'prefix', t, getCountryName));
      return false;
    }

    // ✅ التحقق من الطول (يقبل 10 أو 11 رقم)
    const isValidLength = cleanNumber.length === country.minLength || 
                         cleanNumber.length === country.minLength - 1;
    
    if (!isValidLength) {
      setError(getErrorMessage(country, 'length', t, getCountryName));
      return false;
    }

    // ✅ التحقق من الـ Pattern (يقبل مع أو بدون 0)
    const patternValid = country.pattern.test(cleanNumber);
    
    if (!patternValid) {
      setError(getErrorMessage(country, 'pattern', t, getCountryName));
      return false;
    }
    
    setError("");
    return true;
  };

  const handleCountrySelect = (countryCode: string | null) => {
    if (!countryCode) return;
    const country = countryCodes.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      setError("");
      setIsTouched(true);
      
      if (localPhoneNumber) {
        const isValid = validatePhoneNumber(localPhoneNumber, country);
        onChange(localPhoneNumber, country.code);
      } else {
        onChange("", country.code);
      }
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // إزالة أي أحرف غير رقمية
    const numbersOnly = rawValue.replace(/[^\d]/g, "");
    
    // تحديث الحالة المحلية
    setLocalPhoneNumber(numbersOnly);
    setIsTouched(true);
    
    // التحقق من الصحة
    validatePhoneNumber(numbersOnly, selectedCountry);
    
    // إرسال التغيير للمكون الأب
    onChange(numbersOnly, selectedCountry.code);
  };

  const handleBlur = () => {
    setIsTouched(true);
    if (localPhoneNumber) {
      validatePhoneNumber(localPhoneNumber, selectedCountry);
    } else if (required) {
      setError(t('contact.phoneRequired'));
    }
  };

  // تنسيق الرقم للعرض
  const formatDisplayNumber = (number: string, country: CountryCode): string => {
    return number;
  };

  return (
    <div className="w-full">
      <div>
        <div className="relative flex flex-row-reverse items-stretch" dir="ltr">
          <div className="flex-1 relative">
            <input
              type="tel"
              value={formatDisplayNumber(localPhoneNumber, selectedCountry)}
              onChange={handleNumberChange}
              onBlur={handleBlur}
              required={required}
              placeholder={selectedCountry.placeholder}
              inputMode="numeric"
              className={`w-full px-4 h-full border rounded-r-xl focus:ring-black focus:border-black rounded-l-none focus:outline-none foucs:ring-2 transition bg-white text-left font-mono text-base
                ${error && isTouched && localPhoneNumber 
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500 foucs:ring-2" 
                  : !error && localPhoneNumber && (localPhoneNumber.length === selectedCountry.minLength || localPhoneNumber.length === selectedCountry.minLength - 1)
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500 foucs:ring-2"
                  : "border-gray-200 focus:border-[#000000] focus:ring-[#000000] foucs:ring-2"
                }`}
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              dir="ltr"
            />
          </div>
          
          <div className="relative">
            <Select value={selectedCountry.code} onValueChange={handleCountrySelect}>
              <SelectTrigger 
                className="!h-12 bg-white border-gray-200 rounded-l-xl rounded-r-none border-r-0 focus:ring-0 focus:border-gray-200 min-w-[110px]"
                style={{ 
                  borderTopRightRadius: 0, 
                  borderBottomRightRadius: 0,
                  boxShadow: 'none'
                }}
              >
                <div className="flex items-center gap-2">
                  <ReactCountryFlag
                    countryCode={selectedCountry.countryCode}
                    svg
                    style={{
                      width: '24px',
                      height: '16px',
                      objectFit: 'cover'
                    }}
                    title={getCountryName(selectedCountry)}
                  />
                  <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
                  <span className="text-xs text-gray-500 hidden sm:inline">({getCountryName(selectedCountry)})</span>
                </div>
              </SelectTrigger>
              <SelectContent 
                align="center" 
                side="bottom" 
                sideOffset={4}
                className="min-w-[220px]"
              >
                {countryCodes.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-3 py-1">
                      <ReactCountryFlag
                        countryCode={country.countryCode}
                        svg
                        style={{
                          width: '28px',
                          height: '20px',
                          objectFit: 'cover'
                        }}
                        title={getCountryName(country)}
                      />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold text-gray-800">
                          {getCountryName(country)}
                        </span>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>{country.code}</span>
                          <span>•</span>
                          <span>{country.minLength} {t('contact.digits')}</span>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* رسالة الخطأ */}
        {error && isTouched && (
          <p className="text-red-500 text-sm mt-1">
            ⚠ {error}
          </p>
        )}
        
        {/* رسالة النجاح */}
        {!error && localPhoneNumber && (localPhoneNumber.length === selectedCountry.minLength || localPhoneNumber.length === selectedCountry.minLength - 1) && (
          <p className="text-green-600 text-sm mt-1">
            ✓ {t('contact.valid')} {getCountryName(selectedCountry)}
          </p>
        )}
        
        {/* معلومات المساعدة - تظهر أثناء الكتابة */}
        {!error && localPhoneNumber && localPhoneNumber.length < selectedCountry.minLength - 1 && localPhoneNumber.length > 0 && (
          <p className="text-blue-500 text-xs mt-1">
            📝 {t('contact.typed')} {localPhoneNumber.length} {t('contact.of')} {selectedCountry.minLength} {t('contact.digits')}
          </p>
        )}
      </div>
    </div>
  );
}