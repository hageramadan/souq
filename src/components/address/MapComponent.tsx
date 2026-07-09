// components/address/MapComponent.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '@/hooks/useTranslation';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

function LocationMarker({ onLocationSelect, initialLocation, t }: any) {
  const [position, setPosition] = useState(initialLocation || null);
  const [address, setAddress] = useState('');

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      getAddressFromCoordinates(lat, lng);
    },
  });

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      const data = await response.json();
      const formattedAddress = data.display_name || `${lat}, ${lng}`;
      setAddress(formattedAddress);
      onLocationSelect({ lat, lng, address: formattedAddress });
    } catch (error) {
      console.error('Error getting address:', error);
      const fallbackAddress = `${t('mapComponent.latitude')}: ${lat.toFixed(6)}, ${t('mapComponent.longitude')}: ${lng.toFixed(6)}`;
      setAddress(fallbackAddress);
      onLocationSelect({ lat, lng, address: fallbackAddress });
    }
  };

  useEffect(() => {
    if (initialLocation && !position) {
      setPosition(initialLocation);
      getAddressFromCoordinates(initialLocation.lat, initialLocation.lng);
      map.flyTo(initialLocation, 13);
    }
  }, [initialLocation, map, position]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div className="text-right">
          <p className="font-semibold text-sm">{t('mapComponent.selectedLocation')}</p>
          <p className="text-xs text-gray-600 mt-1">{address || t('mapComponent.fetchingAddress')}</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapComponent({ onLocationSelect, initialLocation }: LocationMapProps) {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialLocation) {
      setUserLocation(initialLocation);
      setIsLoading(false);
      return;
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError(t('mapComponent.locationError'));
          setIsLoading(false);
          setUserLocation({ lat: 30.0444, lng: 31.2357 });
        }
      );
    } else {
      setError(t('mapComponent.browserNotSupported'));
      setIsLoading(false);
      setUserLocation({ lat: 30.0444, lng: 31.2357 });
    }
  }, [initialLocation, t]);

  if (isLoading) {
    return (
      <div className="bg-gray-100 rounded-[8px] h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">{t('mapComponent.loadingMap')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {error && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-[8px] text-yellow-700 text-sm">
          ⚠️ {error}
        </div>
      )}
      <div className="rounded-[8px] overflow-hidden border border-gray-200">
        <MapContainer
          center={userLocation || [30.0444, 31.2357]}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            onLocationSelect={onLocationSelect} 
            initialLocation={userLocation}
            t={t}
          />
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        {t('mapComponent.clickToSelect')}
      </p>
    </div>
  );
}