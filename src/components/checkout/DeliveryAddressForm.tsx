// components/checkout/DeliveryAddressForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Home, MapPin, Building, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Address } from "@/types/address";

interface SavedAddress {
  id: number;
  street: string;
  city: string;
  governorate: string;
  building: string;
  floor: string;
  apartment: string;
  isDefault?: boolean;
  latitude?: string | null;
  longitude?: string | null;
  city_id?: string | number;
}

interface DeliveryAddressFormProps {
  show: boolean;
  addressData: {
    street: string;
    city: string;
    governorate: string;
    buildingNo: string;
    floorNo: string;
    apartmentNo: string;
  };
  onAddressChange: (data: any) => void;
  onAddressSaved?: (address: any) => void;
  onAddressSelected?: (addressId: number) => void;
  onCitySelected?: (cityId: string) => void;
  isGuest?: boolean;
  t: any; // ✅ إضافة t
}

const EGYPT_GOVERNORATES = [
  "القاهرة", "الإسكندرية", "الجيزة", "الدقهلية", "الشرقية",
  "المنوفية", "القليوبية", "البحيرة", "كفر الشيخ", "الغربية",
  "الأقصر", "أسوان", "سوهاج", "قنا", "المنيا", "بني سويف",
  "الفيوم", "دمياط", "بورسعيد", "السويس", "الإسماعيلية",
  "مطروح", "شمال سيناء", "جنوب سيناء", "البحر الأحمر", "الوادي الجديد",
];

interface Governorate {
  id: string;
  name: string;
  provider: string;
}

interface City {
  id: string;
  name: string;
  provider: string;
  delivery_fee: number;
}

export default function DeliveryAddressForm({
  show,
  addressData,
  onAddressChange,
  onAddressSaved,
  onAddressSelected,
  onCitySelected,
  isGuest = false,
  t, // ✅ استقبال t
}: DeliveryAddressFormProps) {
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<number | null>(null);
  const [selectedAddressDetails, setSelectedAddressDetails] = useState<SavedAddress | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingGovernorates, setIsLoadingGovernorates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const hasFetchedAddressesRef = useRef(false);
  
  const API_URL = 'https://admin.souqkaber.com/api';

  const getFieldValue = (value: string): string => {
    return value && value.trim() !== "" ? value.trim() : "1";
  };

  const fetchSavedAddresses = async () => {
    if (isGuest) return;
    if (isFetchingRef.current && hasFetchedAddressesRef.current) return;
    
    setIsLoadingAddresses(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await fetch(`${API_URL}/addresses`, {
        headers: {
          'Accept': 'application/json',
          'content-type':'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      
      if (result.result === true && Array.isArray(result.data)) {
        const addresses: SavedAddress[] = result.data.map((addr: Address) => ({
          id: addr.id,
          street: addr.street,
          city: addr.city.name,
          governorate: addr.city.governate?.name || "",
          building: addr.building,
          floor: addr.floor,
          apartment: addr.apartment,
          latitude: addr.latitude,
          longitude: addr.longitude,
          city_id: addr.city.id,
        }));
        setSavedAddresses(addresses);
        hasFetchedAddressesRef.current = true;
      }
    } catch (error) {
      console.error("❌ Error fetching addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const fetchGovernorates = async () => {
    if (isFetchingRef.current && hasFetchedRef.current) return;
    
    setIsLoadingGovernorates(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/governates`, {
        headers: {
          'Accept': 'application/json',
          'content-type':'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      
      if (result.result === true && result.data && Array.isArray(result.data.governates)) {
        setGovernorates(result.data.governates);
      } else {
        setGovernorates(EGYPT_GOVERNORATES.map((name, index) => ({
          id: String(index + 1),
          name,
          provider: "local"
        })));
      }
    } catch (error) {
      console.error("❌ Error fetching governorates:", error);
      setGovernorates(EGYPT_GOVERNORATES.map((name, index) => ({
        id: String(index + 1),
        name,
        provider: "local"
      })));
    } finally {
      setIsLoadingGovernorates(false);
    }
  };

  const fetchCitiesByGovernorate = async (governorateId: string) => {
    if (!governorateId) {
      setCities([]);
      return;
    }

    setIsLoadingCities(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/governates/${governorateId}/cities`, {
        headers: {
          'Accept': 'application/json',
          'content-type':'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      
      if (result.result === true && Array.isArray(result.data)) {
        setCities(result.data);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error("❌ Error fetching cities:", error);
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  useEffect(() => {
    if (addressData.governorate) {
      const selectedGov = governorates.find(gov => gov.name === addressData.governorate);
      if (selectedGov) {
        fetchCitiesByGovernorate(selectedGov.id);
      }
    } else {
      setCities([]);
    }
  }, [addressData.governorate, governorates]);

  useEffect(() => {
    if (!show || hasFetchedRef.current || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    const fetchData = async () => {
      try {
        await fetchGovernorates();
        hasFetchedRef.current = true;
        if (!isGuest) {
          await fetchSavedAddresses();
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, [show, isGuest]);

  const getCityIdByName = (cityName: string): string | null => {
    const city = cities.find(c => c.name === cityName);
    return city?.id || null;
  };

  const handleCitySelect = (value: string | null) => {
    if (!value) return;
    const selectedCity = cities.find(c => c.name === value);
    if (selectedCity && onCitySelected) {
      onCitySelected(String(selectedCity.id));
    }
    updateAddress("city", value);
  };

  const saveAddressToAPI = async () => {
    setSaveError(null);
    
    if (!addressData.governorate) {
      setSaveError(t('checkout.selectGovernorate'));
      return null;
    }
    
    if (!addressData.city) {
      setSaveError(t('checkout.selectCity'));
      return null;
    }
    
    setIsSavingAddress(true);
    
    try {
      const cityId = getCityIdByName(addressData.city);
      
      if (!cityId) {
        setSaveError(t('checkout.cityNotFound'));
        return null;
      }
      
      if (onCitySelected) {
        onCitySelected(cityId);
      }
      
      const token = localStorage.getItem('auth_token');
      const addressToSave = {
        city_id: cityId,
        street: getFieldValue(addressData.street),
        building: getFieldValue(addressData.buildingNo),
        floor: getFieldValue(addressData.floorNo),
        apartment: getFieldValue(addressData.apartmentNo),
        latitude: null,
        longitude: null,
        type: 'home',
      };
      
      const response = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'content-type':'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(addressToSave),
      });
      
      const result = await response.json();
      
      if (result.result === true) {
        await fetchSavedAddresses();
        setAddressSaved(true);
        
        if (onAddressSaved && result.data) {
          onAddressSaved(result.data);
        }
        
        if (onAddressSelected && result.data && result.data.id) {
          onAddressSelected(result.data.id);
        }
        
        return result.data;
      } else {
        setSaveError(result.message || t('checkout.saveAddressError'));
        return null;
      }
    } catch (error) {
      console.error("❌ Error saving address:", error);
      setSaveError(t('checkout.serverError'));
      return null;
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleManualSave = async () => {
    if (useSavedAddress) {
      setSaveError(t('checkout.cannotSaveUsedAddress'));
      return;
    }
    
    if (!addressData.governorate || !addressData.city) {
      setSaveError(t('checkout.selectCityFirst'));
      return;
    }
  
    const savedAddress = await saveAddressToAPI();
    
    if (savedAddress && savedAddress.id && onAddressSelected) {
      onAddressSelected(savedAddress.id);
    }
  };

  if (!show) return null;

  const getGovernoratesList = () => {
    return governorates.map(gov => gov.name);
  };

  const getCitiesList = () => {
    return cities.map(city => city.name);
  };

  const updateAddress = (field: string, value: string | null) => {
    if (!useSavedAddress) {
      setAddressSaved(false);
      setSaveError(null);
    }
    onAddressChange({ ...addressData, [field]: value || "" });
  };

  const handleSelectSavedAddress = (addressId: number) => {
    setSelectedSavedAddressId(addressId);
    const address = savedAddresses.find((a) => a.id === addressId);
    if (address) {
      setSelectedAddressDetails(address);
      if (onCitySelected && address.city_id) {
        onCitySelected(String(address.city_id));
      }
      onAddressChange({
        street: address.street,
        city: address.city,
        governorate: address.governorate,
        buildingNo: address.building,
        floorNo: address.floor,
        apartmentNo: address.apartment,
      });
      setAddressSaved(true);
      setSaveError(null);
      if (onAddressSelected) {
        onAddressSelected(addressId);
      }
    }
  };

  const clearSelectedAddress = () => {
    setSelectedSavedAddressId(null);
    setSelectedAddressDetails(null);
    setUseSavedAddress(false);
    setAddressSaved(false);
    setSaveError(null);
    onAddressChange({
      street: "",
      city: "",
      governorate: "",
      buildingNo: "",
      floorNo: "",
      apartmentNo: "",
    });
  };

  // ✅ استخدام الترجمة للنصوص
  const loadingText = t('checkout.loading');
  const selectGovernorateText = t('checkout.selectGovernorate');
  const selectCityText = t('checkout.selectCity');
  const selectCityFirstText = t('checkout.selectCityFirst');
  const noCitiesText = t('checkout.noCities');
  const saveAddressText = t('checkout.saveAddress');
  const savingText = t('checkout.saving');
  const addressSavedText = t('checkout.addressSaved');
  const cityUpdatedText = t('checkout.cityUpdated');
  const useSavedAddressText = t('checkout.useSavedAddress');
  const selectFromSavedText = t('checkout.selectFromSaved');
  const selectedText = t('checkout.selected');
  const orText = t('checkout.or');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4">{t('checkout.deliveryAddress')}</h2>
      
      {!useSavedAddress && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('checkout.governorate')} <span className="text-[#23A6F0]">*</span>
              </label>
              <Select
                value={addressData.governorate}
                onValueChange={(value) => updateAddress("governorate", value)}
                disabled={isLoadingGovernorates}
              >
                <SelectTrigger className="w-full bg-white rounded-[8px]">
                  <SelectValue placeholder={isLoadingGovernorates ? loadingText : selectGovernorateText} />
                </SelectTrigger>
                <SelectContent>
                  {getGovernoratesList().map((gov) => (
                    <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('checkout.city')} <span className="text-[#23A6F0]">*</span>
              </label>
              <Select
                value={addressData.city}
                onValueChange={handleCitySelect}
                disabled={!addressData.governorate || isLoadingCities}
              >
                <SelectTrigger className="w-full bg-white rounded-[8px]">
                  <SelectValue 
                    placeholder={
                      !addressData.governorate 
                        ? selectCityFirstText
                        : isLoadingCities 
                        ? loadingText 
                        : selectCityText
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCities ? (
                    <div className="p-4 text-center text-gray-500">{loadingText}</div>
                  ) : getCitiesList().length === 0 ? (
                    <div className="p-4 text-center text-gray-500">{noCitiesText}</div>
                  ) : (
                    getCitiesList().map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('checkout.streetName')}</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={addressData.street}
                  onChange={(e) => updateAddress("street", e.target.value)}
                  placeholder={t('checkout.streetPlaceholder')}
                  className="w-full ps-10 p-3 border border-gray-200 rounded-[8px] focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('checkout.apartment')}</label>
              <div className="relative">
                <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={addressData.apartmentNo}
                  onChange={(e) => updateAddress("apartmentNo", e.target.value)}
                  placeholder={t('checkout.apartmentPlaceholder')}
                  className="w-full ps-10 p-3 border border-gray-200 rounded-[8px] focus:border-black focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('checkout.floor')}</label>
              <div className="relative">
                <Home className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={addressData.floorNo}
                  onChange={(e) => updateAddress("floorNo", e.target.value)}
                  placeholder={t('checkout.floorPlaceholder')}
                  className="w-full ps-10 p-3 border border-gray-200 rounded-[8px] focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {!isGuest && !addressSaved && (
            <div className="pt-2 mt-3">
              <button
                onClick={handleManualSave}
                disabled={isSavingAddress || !addressData.governorate || !addressData.city}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-[8px] bg-[#2DA5F3] hover:bg-[#3fadf7] transition disabled:opacity-50"
              >
                {isSavingAddress ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{savingText}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{saveAddressText}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {isGuest && addressData.city && (
            <div className="pt-2 mt-2">
              <div className="p-3 bg-green-50 rounded-[8px] border border-green-200">
                <p className="text-sm font-medium text-green-800">
                  ✅ {cityUpdatedText}: {addressData.city}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {t('checkout.deliveryFeeUpdated')}
                </p>
              </div>
            </div>
          )}

          {saveError && (
            <div className="pt-2 mt-2">
              <div className="p-3 bg-blue-50 rounded-[8px] border border-red-200">
                <p className="text-sm font-medium text-red-800">{saveError}</p>
              </div>
            </div>
          )}

          {!isGuest && addressSaved && (
            <div className="pt-2 mt-2">
              <div className="p-3 bg-blue-50 rounded-[8px] border border-blue-200">
                <p className="text-sm font-medium text-blue-800">{addressSavedText}</p>
              </div>
            </div>
          )}
        </>
      )}

      {!isGuest && savedAddresses.length > 0 && (
        <>
          <div className="border-t border-gray-200 my-4 relative">
            <span className="absolute bottom-[-10px] left-[50%] bg-white px-2">{orText}</span>
          </div>
          
          <div className="mb-5 p-4 bg-gray-50 rounded-[8px]">
            <div className="flex items-center gap-2 cursor-pointer mb-3">
              <Checkbox
                id="useSavedAddress"
                checked={useSavedAddress}
                onCheckedChange={(checked) => {
                  setUseSavedAddress(checked as boolean);
                  if (!checked) {
                    clearSelectedAddress();
                  } else {
                    setSelectedSavedAddressId(null);
                    setSelectedAddressDetails(null);
                  }
                }}
              />
              <Label htmlFor="useSavedAddress" className="text-sm font-medium text-gray-700 cursor-pointer">
                {useSavedAddressText}
              </Label>
            </div>

            {useSavedAddress && (
              <div className="mt-3 space-y-3 ps-2">
                {isLoadingAddresses ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    {selectedAddressDetails ? (
                      <div className="p-4 bg-white rounded-[8px] border-2 border-[#23A6F0] relative">
                        <button
                          onClick={clearSelectedAddress}
                          className="absolute top-2 left-2 p-1 hover:bg-gray-100 rounded-full transition"
                          title={t('checkout.clearSelection')}
                        >
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="ps-8">
                          <p className="font-medium text-gray-800">{selectedAddressDetails.street}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {selectedAddressDetails.building && `${t('checkout.building')} ${selectedAddressDetails.building} `}
                            {selectedAddressDetails.floor && `${t('checkout.floor')} ${selectedAddressDetails.floor} `}
                            {selectedAddressDetails.apartment && `${t('checkout.apartment')} ${selectedAddressDetails.apartment}`}
                          </p>
                          <p className="text-sm text-gray-500">{selectedAddressDetails.city}، {selectedAddressDetails.governorate}</p>
                          <div className="mt-2">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              ✓ {selectedText}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      savedAddresses.map((address) => (
                        <label
                          key={address.id}
                          className={`flex items-start gap-3 p-3 rounded-[8px] border cursor-pointer transition-all ${
                            selectedSavedAddressId === address.id
                              ? "border-[#23A6F0] bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                          onClick={() => handleSelectSavedAddress(address.id)}
                        >
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={selectedSavedAddressId === address.id}
                            onChange={() => handleSelectSavedAddress(address.id)}
                            className="mt-0.5 w-4 h-4 text-[#23A6F0]"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{address.street}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {address.building && `${t('checkout.building')} ${address.building} `}
                              {address.floor && `${t('checkout.floor')} ${address.floor} `}
                              {address.apartment && `${t('checkout.apartment')} ${address.apartment}`}
                            </p>
                            <p className="text-sm text-gray-500">{address.city}، {address.governorate}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}