// components/checkout/CheckoutForm.tsx
"use client";

import { useState } from "react";
import { CheckoutFormData } from "./types";
import ContactInfoForm from "./ContactInfoForm";
import DeliveryMethodForm from "./DeliveryMethodForm";
import DeliveryAddressForm from "./DeliveryAddressForm";
import PaymentMethodForm from "./PaymentMethodForm";
import NotesForm from "./NotesForm";
import SuccessPopup from "./SuccessPopup";
import { useTranslation } from "@/hooks/useTranslation";

interface CheckoutFormProps {
  formData: CheckoutFormData;
  onFormChange: (data: Partial<CheckoutFormData>) => void;
  onSubmit: () => Promise<void>;
  total: number;
  isSubmitting?: boolean;
   isGuest?: boolean;
}

export default function CheckoutForm({ 
  formData, 
  onFormChange, 
  onSubmit, 
  total,
  isSubmitting: externalIsSubmitting = false,
  isGuest = false, 
}: CheckoutFormProps) {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  
  const [showPopup, setShowPopup] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  const isSubmitting = externalIsSubmitting || internalIsSubmitting;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setInternalIsSubmitting(true);
    
    try {
      await onSubmit();
      
      const newOrderNumber = `#${Math.floor(10000 + Math.random() * 90000)}`;
      setOrderNumber(newOrderNumber);
      
      setShowPopup(true);
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const orderDetails = {
    itemsCount: 0,
    total: total,
    deliveryDate: getDeliveryDate(formData.deliveryMethod, t),
    address: formData.deliveryMethod === "delivery" && formData.deliveryAddress 
      ? `${formData.deliveryAddress.city} - ${formData.deliveryAddress.governorate}`
      : undefined
  };

  return (
    <>
      <ContactInfoForm 
        formData={formData} 
        onFormChange={onFormChange} 
        isGuest={formData.isGuest}
         t={t} 
      />
      
      <DeliveryMethodForm 
        deliveryMethod={formData.deliveryMethod}
        onDeliveryMethodChange={(method) => onFormChange({ deliveryMethod: method })}
        t={t}
      />
      
      <DeliveryAddressForm 
        show={formData.deliveryMethod === "delivery"}
        addressData={formData.deliveryAddress || {
          street: "",
          city: "",
          governorate: "",
          buildingNo: "",
          floorNo: "",
          apartmentNo: ""
        }}
        onAddressChange={(address) => onFormChange({ deliveryAddress: address })}
        onAddressSaved={() => {}}
        onAddressSelected={() => {}}
        isGuest={formData.isGuest}
        t={t}
      />
      
      <PaymentMethodForm 
        paymentMethod={formData.paymentMethod}
        onPaymentMethodChange={(method) => onFormChange({ paymentMethod: method as "cash" | "card" | "mada" | "wallet" })}
        
      />
      
      <NotesForm 
        notes={formData.notes}
        onNotesChange={(notes) => onFormChange({ notes })}
        t={t}
      />
      
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !formData.deliveryMethod}
        className={`w-full md:mb-4 text-white py-3 rounded-[8px] font-semibold text-lg transition ${
          isSubmitting || !formData.deliveryMethod
            ? "bg-gray-400 cursor-not-allowed opacity-70"
            : "bg-[#000000] hover:bg-gray-800"
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('checkout.processing')}
          </span>
        ) : (
          t('checkout.confirmOrder')
        )}
      </button>
      
      {!formData.deliveryMethod && (
        <p className="text-xs text-amber-600 text-center mt-2">
          ⚠️ {t('checkout.selectDeliveryMethod')}
        </p>
      )}

      <SuccessPopup
        isOpen={showPopup}
        onClose={handleClosePopup}
        orderNumber={orderNumber}
        orderDetails={orderDetails}
        t={t}
      />
    </>
  );
}

// دالة مساعدة لحساب تاريخ التوصيل المتوقع
function getDeliveryDate(deliveryMethod: "pickup" | "delivery" | null, t: any): string {
  if (deliveryMethod === "delivery") {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString(t('common.lang') === 'en' ? "en-US" : "ar-EG", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  } else if (deliveryMethod === "pickup") {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString(t('common.lang') === 'en' ? "en-US" : "ar-EG", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  }
  return t('checkout.undefined');
}