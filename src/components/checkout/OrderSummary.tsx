// components/checkout/OrderSummary.tsx
"use client";

import { OrderSummaryProps } from "./types";
import { useTranslation } from "@/hooks/useTranslation";

export default function OrderSummary({ 
  cartItems, 
  cartSummary,
  deliveryMethod 
}: OrderSummaryProps) {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  
  const { 
    subtotal, 
    discount, 
    total, 
    deliveryFee, 
    couponDiscount = 0,
    couponCode = ""
  } = cartSummary;

  const discountPercentage = discount > 0 && (subtotal + discount) > 0
    ? Math.round((discount / (subtotal + discount)) * 100)
    : 0;

  const getDeliveryFeeDisplay = () => {
    if (!deliveryMethod) return "--";
    if (deliveryMethod === "pickup") return "--";
    if (deliveryFee === undefined || deliveryFee === null) return "--";
    if (deliveryFee === 0) return "--";
    return `${t('checkout.currency')} ${deliveryFee.toFixed(2)}`;
  };

  const isDeliveryFeeUndefined = () => {
    if (!deliveryMethod || deliveryMethod === "pickup") return true;
    return deliveryFee === undefined || deliveryFee === null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-20 mb-4 md:mb-0">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        {t('checkout.orderSummary')}
      </h2>

      <div className="space-y-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout.subtotal')}</span>
          <span className="text-gray-800">{t('checkout.currency')} {subtotal?.toFixed(2) || "0.00"}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span>{t('checkout.discount')}</span>
              <span className="text-xs">(-{discountPercentage}%)</span>
            </span>
            <span className="text-[#23A6F0]">-{t('checkout.currency')} {discount.toFixed(2)}</span>
          </div>
        )}
        
        {couponDiscount > 0 && couponCode && (
          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span>{t('checkout.couponDiscount')}</span>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {couponCode}
              </span>
            </span>
            <span className="text-[#23A6F0]">-{t('checkout.currency')} {couponDiscount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout.deliveryFee')}</span>
          <span className={`font-semibold ${
            isDeliveryFeeUndefined() ? "text-gray-400" : "text-gray-800"
          }`}>
            {getDeliveryFeeDisplay()}
          </span>
        </div>
        
        <div className="flex justify-between pt-3 border-t border-gray-200">
          <span className="text-lg font-bold text-gray-900">{t('checkout.total')}</span>
          <span className="text-lg font-bold">
            {t('checkout.currency')} {total?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>
    </div>
  );
}