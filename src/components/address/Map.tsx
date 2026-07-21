// components/address/Map.tsx
'use client';

import { useState } from 'react';
import { FaMapPin } from 'react-icons/fa';
import { useTranslation } from '@/hooks/useTranslation';

interface MapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

export default function Map({ onLocationSelect }: MapProps) {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Simulated map component - In production, integrate with Google Maps or Leaflet
  const handleMapClick = () => {
    setIsLoading(true);
    // Simulate getting location from map
    setTimeout(() => {
      const mockLocation = {
        lat: 30.0444,
        lng: 31.2357,
        address: t('map.mockAddress')
      };
      setSelectedLocation(mockLocation.address);
      onLocationSelect(mockLocation);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="relative">
      <div 
        onClick={handleMapClick}
        className="bg-gray-100 rounded-[8px] h-64 relative cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition"
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Mock Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
              <div className="text-center">
                <FaMapPin className="text-red-500 text-2xl mx-auto mb-2" />
                <p className="text-gray-600 text-sm">{t('map.clickToSelectLocation')}</p>
                {selectedLocation && (
                  <p className="text-green-600 text-xs mt-2 font-medium">{selectedLocation}</p>
                )}
              </div>
            </div>
            
            {/* Mock Grid Lines for Map Effect */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 end-0 w-full h-px bg-gray-300 opacity-30"></div>
              <div className="absolute top-2/4 end-0 w-full h-px bg-gray-300 opacity-30"></div>
              <div className="absolute top-3/4 end-0 w-full h-px bg-gray-300 opacity-30"></div>
              <div className="absolute end-1/4 top-0 w-px h-full bg-gray-300 opacity-30"></div>
              <div className="absolute end-2/4 top-0 w-px h-full bg-gray-300 opacity-30"></div>
              <div className="absolute end-3/4 top-0 w-px h-full bg-gray-300 opacity-30"></div>
            </div>
          </>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        ℹ️ {t('map.clickInstruction')}
      </p>
    </div>
  );
}