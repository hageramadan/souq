// app/account/orders/checkout/success/page.tsx
import { Suspense } from "react";
import CheckoutSuccessContent from "./CheckoutSuccessContent";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D93CA] mx-auto"></div>
         
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}