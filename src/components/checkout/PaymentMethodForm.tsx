// components/checkout/PaymentMethodForm.tsx
"use client";

import { CreditCard, DollarSign, Wallet, Landmark } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface PaymentMethodFormProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

export default function PaymentMethodForm({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodFormProps) {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  const [isWalletAvailable, setIsWalletAvailable] = useState(true);

  useEffect(() => {
    if (isWalletAvailable && !paymentMethod) {
      onPaymentMethodChange("wallet");
    }
  }, [isWalletAvailable, paymentMethod, onPaymentMethodChange]);

  const getPaymentGateway = (method: string) => {
    switch (method) {
      case "wallet": return "wallet";
      case "cash": return "cash";
      case "card": return "card";
      case "mada": return "mada";
      default: return "";
    }
  };

  const handlePaymentChange = (method: string) => {
    onPaymentMethodChange(method);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        {t('checkout.paymentMethod')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label
          className={`flex items-center gap-3 p-4 border rounded-[8px] cursor-pointer transition ${
            paymentMethod === "wallet"
              ? "border-[#23A6F0] bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          } ${!isWalletAvailable ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="wallet"
            checked={paymentMethod === "wallet"}
            onChange={() => handlePaymentChange("wallet")}
            className="w-4 h-4 text-[#23A6F0] focus:ring-[#23A6F0]"
            disabled={!isWalletAvailable}
          />
          <Wallet className="w-5 h-5 text-orange-600" />
          <div>
            <p className="font-medium text-gray-800">{t('checkout.wallet')}</p>
            {!isWalletAvailable && (
              <p className="text-xs text-gray-500 mt-1">{t('checkout.walletUnavailable')}</p>
            )}
          </div>
        </label>

        <label
          className={`flex items-center gap-3 p-4 border rounded-[8px] cursor-pointer transition ${
            paymentMethod === "cash"
              ? "border-[#23A6F0] bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cash"
            checked={paymentMethod === "cash"}
            onChange={() => handlePaymentChange("cash")}
            className="w-4 h-4 text-[#23A6F0] focus:ring-[#23A6F0]"
          />
          <DollarSign className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-gray-800">{t('checkout.cashOnDelivery')}</p>
          </div>
        </label>
      </div>
    </div>
  );
}