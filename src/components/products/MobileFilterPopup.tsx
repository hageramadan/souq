// components/products/MobileFilterPopup.tsx
'use client';

import { useEffect } from 'react';
import ProductFilters from './FilterSidebar';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileFilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: any) => void;
  currentFilters?: any;
}

export default function MobileFilterPopup({ 
  isOpen, 
  onClose, 
  onFilterChange,
  currentFilters 
}: MobileFilterPopupProps) {
  const { language } = useLanguage();

  // منع التمرير في الخلفية عند فتح البوب أب
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* الخلفية المظللة */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* محتوى البوب أب */}
      <div className="fixed inset-y-0 start-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        {/* الرأس */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            الفلترة
          </h2>
          <button
            onClick={onClose}
            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* المحتوى */}
        <div className="h-full overflow-y-auto pb-20">
          <div className="px-4 py-6">
            <ProductFilters 

              onFilterChange={(filters) => {
                
                onFilterChange(filters);
                // يمكنك إغلاق البوب أب تلقائياً بعد تطبيق الفلتر
                // onClose();
              }} 
              lang={language}
            />
          </div>
        </div>

        {/* زر إغلاق في الأسفل (اختياري) */}
        <div className="fixed bottom-0 end-0 start-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-[8px]  hover:bg-blue-700 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}