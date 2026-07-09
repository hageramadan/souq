// components/address/LocationMap.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useTranslation } from '@/hooks/useTranslation';

// Dynamic import for the map component to avoid SSR issues
const MapComponent = dynamic(
  () => import('./MapComponent'),
  {
    ssr: false,
    loading: () => {
      // ✅ استخدام hook داخل الـ loading component
      // ملاحظة: لا يمكن استخدام hooks داخل دالة loading مباشرة
      // لذلك سنستخدم مكون منفصل
      return <MapLoadingFallback />;
    },
  }
);

// ✅ مكون منفصل لعرض حالة التحميل مع الترجمة
function MapLoadingFallback() {
  
  
  return (
    <div className="bg-gray-100 rounded-[8px] h-80 flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="animate-spin text-2xl text-blue-500 mx-auto mb-3" />
        {/* <p className="text-gray-600">{t('locationMap.loadingMap')}</p> */}
      </div>
    </div>
  );
}

interface LocationMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

export default function LocationMap(props: LocationMapProps) {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-gray-100 rounded-[8px] h-80 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-2xl text-blue-500 mx-auto mb-3" />
          <p className="text-gray-600">{t('locationMap.loadingMap')}</p>
        </div>
      </div>
    );
  }

  return <MapComponent {...props} />;
}