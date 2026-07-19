// components/checkout/types.ts

export interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  discount?: number;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;                    // الرقم الكامل مع كود الدولة (مثال: +201012345678)
  phoneNumber?: string;             // الرقم فقط بدون كود الدولة
  phoneCountryCode?: string;        // كود الدولة (مثال: +20)
  email?: string; 
  deliveryAddress: {
    street: string;
    city: string;
    governorate: string;
    buildingNo: string;
    floorNo: string;
    apartmentNo: string;
  };
  notes: string;
  deliveryMethod: "pickup" | "delivery" ;
  paymentMethod: "cash" | "card" | "mada" | "wallet";
  isGuest?: boolean; 
}

// ✅ واجهة جديدة لملخص سلة التسوق
export interface CartSummary {
   subtotal: number;
  discount: number;
  couponDiscount?: number;        // ✅ خصم الكوبون
  couponCode?: string;            // ✅ كود الكوبون المطبق
   deliveryFee: number | null | undefined; 
  total: number;
}

// باقي الواجهات تبقى كما هي
export interface ContactInfoFormProps {
  formData: CheckoutFormData;
  onFormChange: (data: Partial<CheckoutFormData>) => void;
}

export interface DeliveryMethodFormProps {
  deliveryMethod: "pickup" | "delivery" | null;
  onDeliveryMethodChange: (method: "pickup" | "delivery") => void;
}

export interface PaymentMethodFormProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

export interface NotesFormProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

// ✅ تعديل OrderSummaryProps لاستخدام cartSummary
export interface OrderSummaryProps {
  cartItems: CartItem[]; // يمكن الاحتفاظ بالمنتجات لعرضها
  cartSummary: CartSummary;
   deliveryMethod: "pickup" | "delivery" ; 
   currencySymbol?: string;
}

export interface DeliveryAddressFormProps {
  show: boolean;
  addressData: CheckoutFormData['deliveryAddress'];
  onAddressChange: (address: CheckoutFormData['deliveryAddress']) => void;
  onAddressSaved: (address: any) => void;
  onAddressSelected: (addressId: number) => void;
}