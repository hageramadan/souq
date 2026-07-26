// app/checkout/page.tsx (أو components/checkout/CheckoutPage.tsx)
"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, CheckCircle, User, Mail, Phone, MapPin, Building, Home, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  CartItem,
  CheckoutFormData,
  CartSummary,
} from "@/components/checkout/types";
import { useCartContext } from "@/contexts/CartContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

// استيراد المكونات
import ContactInfoForm from "@/components/checkout/ContactInfoForm";
import DeliveryMethodForm from "@/components/checkout/DeliveryMethodForm";
import DeliveryAddressForm from "@/components/checkout/DeliveryAddressForm";
import PaymentMethodForm from "@/components/checkout/PaymentMethodForm";
import NotesForm from "@/components/checkout/NotesForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { getHeaders } from "@/services/api";

const API_URL = "https://admin.souqkaber.com/api";

// دالة جلب التوكن
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// ✅ دالة جلب الـ guest_token
const getGuestToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("guest_cart_token");
  }
  return null;
};

// ✅ دالة جلب السلة مع البارامترات (delivery_method و city_id)
const fetchCartWithParams = async (
  deliveryMethod: string,
  cityId?: string,
): Promise<any> => {
  try {
    const params = new URLSearchParams();

    if (deliveryMethod === "delivery") {
      params.append("delivery_method", "delivery");
    } else {
      params.append("delivery_method", "receive");
    }

    if (deliveryMethod === "delivery" && cityId) {
      params.append("city_id",  String(cityId));
    }

    const url = `${API_URL}/cart/preview?${params.toString()}`;
   

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    const data = await response.json();
   

    if (data.result === true && data.data && data.data.cart) {
    
      return data.data.cart;
    }

    return null;
  } catch (error) {
    console.error("❌ Error fetching cart with params:", error);
    throw error;
  }
};

// ✅ دالة التحقق من رقم الهاتف حسب الدولة (معدلة للترجمة)
const validatePhoneNumberByCountry = (
  phoneNumber: string,
  countryCode: string,
  t: any,
): { isValid: boolean; error: string } => {
  const cleanNumber = phoneNumber.replace(/[\s\-]/g, "");

  if (!cleanNumber) {
    return { isValid: false, error: t('checkout.phoneRequired') };
  }

  if (!/^\d+$/.test(cleanNumber)) {
    return { isValid: false, error: t('checkout.phoneDigitsOnly') };
  }

  const rules: Record<
    string,
    {
      minLength: number;
      maxLength: number;
      startsWith: string[];
      pattern: RegExp;
      name: string;
    }
  > = {
    "+20": {
      name: t('checkout.egypt'),
      minLength: 11,
      maxLength: 11,
      startsWith: ["010", "011", "012", "015"],
      pattern: /^01[0125][0-9]{8}$/,
    },
    "+966": {
      name: t('checkout.saudi'),
      minLength: 9,
      maxLength: 10,
      startsWith: ["05"],
      pattern: /^05[0-9]{8}$/,
    },
    "+964": {
      name: t('checkout.iraq'),
      minLength: 11,
      maxLength: 11,
      startsWith: ["07"],
      pattern: /^07[0-9]{9}$/,
    },
    "+971": {
      name: t('checkout.uae'),
      minLength: 9,
      maxLength: 9,
      startsWith: ["05"],
      pattern: /^05[0-9]{8}$/,
    },
  };

  const rule = rules[countryCode];
  if (!rule) {
    return { isValid: false, error: t('checkout.invalidCountryCode') };
  }

  if (cleanNumber.length !== rule.minLength) {
    return {
      isValid: false,
      error: t('checkout.phoneLengthError', { 
        country: rule.name, 
        length: rule.minLength,
        current: cleanNumber.length 
      }),
    };
  }

  const startsWithValid = rule.startsWith.some((prefix) =>
    cleanNumber.startsWith(prefix),
  );
  if (!startsWithValid) {
    return {
      isValid: false,
      error: t('checkout.phoneStartsWithError', { 
        country: rule.name, 
        prefixes: rule.startsWith.join(" أو ") 
      }),
    };
  }

  if (!rule.pattern.test(cleanNumber)) {
    return {
      isValid: false,
      error: t('checkout.phoneInvalidForCountry', { country: rule.name }),
    };
  }

  return { isValid: true, error: "" };
};

// دالة إنشاء الطلب
const createOrder = async (orderData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/orders/checkout`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error creating order:", error);
    throw error;
  }
};

// دالة الحصول على رسالة الخطأ حسب السبب (مترجمة)
const getErrorMessage = (reason: string | null, t: any): string => {
  const messages: Record<string, string> = {
    'payment_declined': t('checkout.paymentDeclined') || 'تم رفض الدفع من قبل البنك أو جهة الإصدار',
    'insufficient_funds': t('checkout.insufficientFunds') || 'الرصيد غير كافٍ لإتمام العملية',
    'card_expired': t('checkout.cardExpired') || 'البطاقة منتهية الصلاحية',
    'invalid_card': t('checkout.invalidCard') || 'بيانات البطاقة غير صحيحة',
    'technical_error': t('checkout.technicalError') || 'حدث خطأ تقني أثناء معالجة الدفع',
    'timeout': t('checkout.timeout') || 'انتهت مهلة الدفع، يرجى المحاولة مرة أخرى',
    'cancelled_by_user': t('checkout.cancelledByUser') || 'تم إلغاء الدفع من قبلك',
    'fraud_suspected': t('checkout.fraudSuspected') || 'تم رفض العملية للاشتباه في احتيال',
    'authentication_failed': t('checkout.authenticationFailed') || 'فشل التحقق من الهوية',
  };

  if (reason && messages[reason]) {
    return messages[reason];
  }
  return t('checkout.paymentError') || 'حدثت مشكلة أثناء معالجة الدفع. يرجى المحاولة مرة أخرى أو استخدام طريقة دفع أخرى.';
};

// تحويل بيانات السلة
const transformCartItems = (cart: any, t: any): CartItem[] => {
  if (!cart || !cart.items) return [];

  return cart.items.map((item: any) => {
    let color = "";
    let size = "";

    if (item.variant && item.variant.attributes) {
      for (const attr of item.variant.attributes) {
        const attrName = attr.attribute_type?.name;
        if (attrName === "اللون") {
          color = attr.value || "";
        } else if (attrName === "مقاس" || attrName === "المقاس") {
          size = attr.value || "";
        }
      }
    }

    let brandName = t('checkout.defaultBrand');
    if (item.product.brand) {
      if (typeof item.product.brand === "string") {
        brandName = item.product.brand;
      } else if (
        typeof item.product.brand === "object" &&
        item.product.brand.name
      ) {
        brandName = item.product.brand.name;
      }
    }

    const cleanImageUrl = (url: string) => {
      if (!url) return "/images/placeholder.jpg";
      if (url.startsWith("/storage")) {
        return `https://admin.souqkaber.com${url}`;
      }
      return url;
    };

    return {
      id: item.id,
      name: item.product.name,
      brand: brandName,
      price: item.final_price,
      originalPrice: item.product.pricing?.has_discount
        ? item.product.pricing.price
        : undefined,
      image: cleanImageUrl(item.product.images?.[0] || ""),
      color: color,
      size: size,
      quantity: item.quantity,
      discount: item.discount_amount || undefined,
      currency: item.product?.currency || {
        code: "EGP",
        symbol: "ج.م",
        name: "Egyptian Pound",
        rate: 1
      }
    };
  });
};

// ✅ نوع بيانات الطلب الناجح
interface CompletedOrderResult {
  orderNumber: string | number;
  itemsCount: number;
  total: number;
}

// ✅ واجهة بيانات إنشاء الحساب (مع كلمة المرور ولكن مخفية)
interface AccountData {
  email: string;
  phone: string;
  name: string;
  password: string;
  password_confirmation: string;
}

export default function CheckoutClient() {
  const { t } = useTranslation();
  const {
    cart,
    isLoading: cartLoading,
    refetchCart,
    updateCart,
    isGuest,
  } = useCartContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orderResult, setOrderResult] = useState<CompletedOrderResult | null>(
    null,
  );
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<string | null>(null);
  
  // ✅ إضافة state لحفظ قيمة paymentGateway
  const [showRedirectPopup, setShowRedirectPopup] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  
  // ✅ حالة خيار إنشاء حساب (Checkbox)
  const [createAccount, setCreateAccount] = useState(false);
  const [accountData, setAccountData] = useState<AccountData>({
    email: "",
    phone: "",
    name: "",
    password: "",
    password_confirmation: "",
  });
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});
  const [isSendingAccount, setIsSendingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ استخدم useRef لتخزين cityId بشكل فوري
  const selectedCityIdRef = useRef<string | null>(null);
  
  // ✅ منع الاستدعاء المتكرر للـ API
  const isFetchingRef = useRef<boolean>(false);
  
  // ✅ تتبع آخر قيمة لـ deliveryMethod لمنع الاستدعاء المتكرر
  const lastDeliveryMethodRef = useRef<string | null>(null);
  
  // ✅ تتبع آخر قيمة لـ cityId لمنع الاستدعاء المتكرر
  const lastFetchedCityIdRef = useRef<string | null>(null);

  // ✅ الحصول على رمز العملة من السلة
  const currencySymbol = useMemo(() => {
    return cart?.currency?.symbol || "ج.م";
  }, [cart]);

  const cartItems = useMemo(() => transformCartItems(cart, t), [cart, t]);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    phone: "",
    phoneNumber: "",
    phoneCountryCode: "+20",
    email: "",
    deliveryAddress: {
      street: "",
      city: "",
      governorate: "",
      buildingNo: "",
      floorNo: "",
      apartmentNo: "",
    },
    notes: "",
    deliveryMethod: "delivery",
    paymentMethod: "cash",
  });

  const cartSummary: CartSummary = useMemo(() => {
    const subtotal = cart?.subtotal || 0;
    const discount = cart?.discount_amount || 0;
    
    let deliveryFee;
    
    if (formData.deliveryMethod === "pickup") {
      deliveryFee = null;
    } else if (formData.deliveryMethod === "delivery") {
      if (!selectedCityId) {
        deliveryFee = undefined;
      } else {
        if (cart?.delivery_fee !== undefined && cart?.delivery_fee !== null) {
          deliveryFee = cart.delivery_fee;
        } else {
          deliveryFee = cart ? undefined : 0;
        }
      }
    } else {
      deliveryFee = undefined;
    }
    
    const total = cart?.total_amount || 0;

    return {
      subtotal,
      discount,
      deliveryFee,
      total,
      currencySymbol,
    };
  }, [cart, formData.deliveryMethod, selectedCityId, currencySymbol]);

  // ✅ التحقق من وجود order_number في URL (عند العودة من Paymob)
  useEffect(() => {
    const orderNumber = searchParams.get('order_number');
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    
    if (orderNumber) {
      if (status === 'success' || status === 'paid' || status === null) {
        toast.dismiss();
        toast.success(t('checkout.paymentSuccess'), {
          duration: 3000,
          position: 'top-center',
        });
        
        setTimeout(() => {
          router.push(`/account/orders?order=${orderNumber}`);
        }, 2000);
        
        setIsOrderCompleted(true);
        return;
      }
      
      if (status === 'failed') {
        toast.error(`❌ ${t('checkout.paymentFailed')}: ${getErrorMessage(reason, t)}`, {
          duration: 5000,
          position: 'top-center',
        });
        
        setTimeout(() => {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }, 3000);
        
        setIsOrderCompleted(true);
        return;
      }
    }
  }, [searchParams, router, t]);

  // ✅ التعديل المهم: لا تقم بإعادة التوجيه إلى الرئيسية عند فراغ السلة إذا كان الطلب قد تم بنجاح
  useEffect(() => {
    const orderNumber = searchParams.get('order_number');
    if (orderNumber) {
      setIsOrderCompleted(true);
      return;
    }

    if (isOrderCompleted) return;

    if (!cartLoading && (!cart || cart.items?.length === 0)) {
      router.replace("/");
    }
  }, [cart, cartLoading, router, isOrderCompleted, searchParams]);

  // ✅ استدعاء الـ API عند تغيير طريقة التوصيل أو المدينة (محسّن)
  useEffect(() => {
    if (isOrderCompleted) return;
    if (!cart || cart.items?.length === 0) return;
    
    if (isFetchingRef.current) return;

    const currentDeliveryMethod = formData.deliveryMethod;
    const currentCityId = selectedCityIdRef.current;

    const deliveryMethodChanged = lastDeliveryMethodRef.current !== currentDeliveryMethod;
    const cityIdChanged = lastFetchedCityIdRef.current !== currentCityId;

    if (!deliveryMethodChanged && !cityIdChanged) {
      return;
    }

    lastDeliveryMethodRef.current = currentDeliveryMethod;
    lastFetchedCityIdRef.current = currentCityId;

    const fetchCart = async () => {
      try {
        isFetchingRef.current = true;
        
        if (currentDeliveryMethod === "delivery" && currentCityId) {
          const cartData = await fetchCartWithParams("delivery", currentCityId);
          if (cartData) {
            updateCart(cartData);
          }
        } 
        else if (currentDeliveryMethod === "pickup") {
          const cartData = await fetchCartWithParams("pickup");
          if (cartData) {
            updateCart(cartData);
          }
        } 
        else if (currentDeliveryMethod === "delivery" && !currentCityId) {
          const cartData = await fetchCartWithParams("delivery");
          if (cartData) {
            updateCart(cartData);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching cart:", error);
      } finally {
        isFetchingRef.current = false;
      }
    };

    const timeoutId = setTimeout(fetchCart, 300);
    
    return () => {
      clearTimeout(timeoutId);
      isFetchingRef.current = false;
    };
  }, [formData.deliveryMethod, selectedCityId, isOrderCompleted, cart, updateCart]);

  const handleFormChange = useCallback((data: Partial<CheckoutFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // ✅ دالة لاستقبال paymentGateway من PaymentMethodForm
  const handlePaymentGatewayChange = useCallback((gateway: string | null) => {
    setPaymentGateway(gateway);
  }, []);

  // ✅ دالة لاستقبال address_id بعد حفظ العنوان
  const handleAddressSaved = useCallback(
    async (address: any) => {
      if (isFetchingRef.current) return;

      if (address && address.id) {
        setSelectedAddressId(address.id);
        toast.success(t('checkout.addressSaved'));

        try {
          let cityId = selectedCityIdRef.current;

          if (!cityId) {
            cityId = selectedCityId;
          }

          if (!cityId) {
            cityId = address.city?.id || address.city_id;
          }

          if (cityId && formData.deliveryMethod === "delivery") {
            isFetchingRef.current = true;
            const cartData = await fetchCartWithParams(
              "delivery",
              String(cityId),
            );
            if (cartData) {
              updateCart(cartData);
            }
          }
        } catch (error) {
          console.error("❌ Error updating cart after address save:", error);
        } finally {
          isFetchingRef.current = false;
        }
      }
    },
    [selectedCityId, formData.deliveryMethod, updateCart, t],
  );

  // ✅ دالة لاستقبال address_id من عنوان محفوظ تم اختياره
  const handleAddressSelected = useCallback(
    async (addressId: number) => {
      if (isFetchingRef.current) return;
      
      setSelectedAddressId(addressId);

      try {
        const cityId = selectedCityIdRef.current;

        if (cityId && formData.deliveryMethod === "delivery") {
          isFetchingRef.current = true;
          const cartData = await fetchCartWithParams(
            "delivery",
            String(cityId),
          );
          if (cartData) {
            updateCart(cartData);
          }
        }
      } catch (error) {
        console.error("❌ Error updating cart after address selection:", error);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [formData.deliveryMethod, updateCart],
  );

  const handleCitySelected = useCallback((cityId: string) => {
    selectedCityIdRef.current = cityId;
    setSelectedCityId(cityId);
  }, []);

  // دالة إغلاق Popup التوجيه
  const closeRedirectPopup = useCallback(() => {
    setShowRedirectPopup(false);
    setRedirectUrl(null);
  }, []);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      const paymentStarted = sessionStorage.getItem("payment_started");

      if (!paymentStarted) return;

      if (event.persisted) {
        sessionStorage.removeItem("payment_started");
        window.location.replace("/");
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // ✅ دالة التحقق من بيانات الحساب (معدلة للترجمة)
  const validateAccountData = (): boolean => {
    const errors: Record<string, string> = {};

    if (!accountData.email.trim()) {
      errors.email = t('checkout.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
      errors.email = t('checkout.emailInvalid');
    }

    if (!accountData.phone.trim()) {
      errors.phone = t('checkout.phoneRequired');
    } else {
      const phoneValidation = validatePhoneNumberByCountry(
        accountData.phone.replace(/[\s\-]/g, ""),
        "+20",
        t,
      );
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error;
      }
    }

    if (!accountData.name.trim()) {
      errors.name = t('checkout.nameRequired');
    } else if (accountData.name.trim().length < 3) {
      errors.name = t('checkout.nameMinLength');
    }

    setAccountErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ دالة إرسال بيانات الحساب للباك اند (معدلة للترجمة)
  const sendAccountDataToBackend = useCallback(async () => {
    if (!createAccount || isSendingAccount) return;
    
    if (!validateAccountData()) {
      toast.error(t('checkout.correctAccountErrors'));
      return;
    }

    setIsSendingAccount(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name: accountData.name,
          email: accountData.email,
          phone: accountData.phone,
          password: accountData.password || "",
          password_confirmation: accountData.password_confirmation || "",
        }),
      });

      const data = await response.json();
      
      if (data.result === true) {
        toast.success(t('checkout.accountCreated'));
        if (data.data?.token) {
          localStorage.setItem("auth_token", data.data.token);
        }
      } else {
        toast.error(data.message || t('checkout.accountCreationFailed'));
        setCreateAccount(false);
      }
    } catch (error) {
      console.error("❌ Error creating account:", error);
      toast.error(t('checkout.accountCreationError'));
      setCreateAccount(false);
    } finally {
      setIsSendingAccount(false);
    }
  }, [createAccount, accountData, isSendingAccount, t]);

  // ✅ عند تغيير حالة الـ Checkbox (تشغيل/إيقاف)
  const handleCreateAccountToggle = useCallback(async (checked: boolean) => {
    setCreateAccount(checked);
    
    if (checked) {
      setAccountData((prev) => ({
        ...prev,
        name: formData.fullName || "",
        phone: formData.phone || "",
        email: formData.email || "",
        password: "",
        password_confirmation: "",
      }));
      
      setTimeout(() => {
        sendAccountDataToBackend();
      }, 100);
    }
  }, [formData.fullName, formData.phone, formData.email, sendAccountDataToBackend]);

  // ✅ تحديث بيانات الحساب عند تغيير النموذج (للمزامنة)
  useEffect(() => {
    if (createAccount) {
      setAccountData((prev) => ({
        ...prev,
        name: formData.fullName || prev.name,
        phone: formData.phone || prev.phone,
        email: formData.email || prev.email,
      }));
    }
  }, [formData.fullName, formData.phone, formData.email, createAccount]);

  // ✅ تحضير بيانات الطلب (معدل)
  const prepareOrderData = useCallback(() => {
    const paymentMethodMap: Record<string, string> = {
      cash: "cash",
      card: "card",
      mada: "online",
      wallet: "online",
    };

    const deliveryMethodMap: Record<string, string> = {
      delivery: "delivery",
      pickup: "receive",
    };

    const orderData: any = {
      payment_method: paymentMethodMap[formData.paymentMethod] || "cash",
      delivery_method: deliveryMethodMap[formData.deliveryMethod] || "delivery",
      notes: formData.notes || "",
      create_account: createAccount,
    };

    // ✅ إضافة payment_gateway حسب طريقة الدفع
    if (formData.paymentMethod === "wallet") {
      orderData.payment_gateway = "wallet";
    }
    if (formData.paymentMethod === "card") {
      orderData.payment_gateway = "paymob";
    }

    // ✅ إذا تم اختيار بوابة دفع معينة من الـ state
    if (paymentGateway) {
      orderData.payment_gateway = paymentGateway;
    }

    if (createAccount && isGuest) {
      orderData.account = {
        email: accountData.email,
        phone: accountData.phone,
        name: accountData.name,
        password: accountData.password || "",
        password_confirmation: accountData.password_confirmation || "",
      };
    }

    if (isGuest) {
      const guestEmail = formData.email || accountData.email || "";
      
      const additionalData: any = {
        name: formData.fullName,
        phone: formData.phone,
        email: guestEmail,
        street: formData.deliveryAddress.street || "N/A",
        building: formData.deliveryAddress.buildingNo || "N/A",
        floor: formData.deliveryAddress.floorNo || "N/A",
        apartment: formData.deliveryAddress.apartmentNo || "N/A",
      };

      if (formData.deliveryMethod === "delivery") {
        const cityId = selectedCityIdRef.current || "1";
        additionalData.city_id = cityId;
      }

      orderData.additional_data = additionalData;
    }

    if (!isGuest && formData.deliveryMethod === "delivery") {
      if (selectedAddressId) {
        orderData.address_id = selectedAddressId;
      }
    }

    return orderData;
  }, [formData, selectedAddressId, createAccount, isGuest, accountData, paymentGateway]);

  // ✅ إرسال الطلب (محدث مع Popup التوجيه)
  const handleSubmit = async () => {
    if (isSubmitting || isOrderCompleted) return;

    if (!formData.fullName.trim()) {
      toast.error(t('checkout.fullNameRequired'));
      return;
    }

    const phoneValidation = validatePhoneNumberByCountry(
      formData.phoneNumber ||
        formData.phone.replace(formData.phoneCountryCode || "", ""),
      formData.phoneCountryCode || "+20",
      t,
    );

    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error);
      return;
    }

    if (formData.deliveryMethod === "delivery" && !selectedAddressId && isGuest) {
      const address = formData.deliveryAddress;
      if (!address.street || !address.city) {
        toast.error(t('checkout.addressRequired'));
        return;
      }
    }

    if (formData.deliveryMethod === "delivery" && !selectedAddressId && !isGuest) {
      toast.error(t('checkout.saveAddressFirst'));
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = prepareOrderData();
      const response = await createOrder(orderData);

      if (response.result === true && response.data) {
        // ✅ التحقق من وجود redirect_url
        if (response.data.redirect_url) {
          sessionStorage.setItem("payment_started", "true");

          setRedirectUrl(response.data.redirect_url);
          setShowRedirectPopup(true);

          setTimeout(() => {
            setShowRedirectPopup(false);
            window.location.href = response.data.redirect_url;
          }, 3000);

          return;
        }

        const orderNumber = response.data.order?.order_number || response.data.order_number;
        
        const completedOrder: CompletedOrderResult = {
          orderNumber: orderNumber || 'N/A',
          itemsCount: cartItems.length,
          total: response.data.total_amount || response.data.order?.total_amount || 0,
        };

        setOrderResult(completedOrder);
        setIsOrderCompleted(true);
        setShowSuccessPopup(true);

        refetchCart().catch((err) => {
          console.error("❌ Error refetching cart after order success:", err);
        });
      } else {
        toast.error(response.message || t('checkout.orderCreationError'));
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
      toast.error(t('checkout.orderCreationError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePopup = useCallback(() => {
    setShowSuccessPopup(false);
    router.push("/");
  }, [router]);

  const handleGoToOrders = useCallback(() => {
    setShowSuccessPopup(false);
    router.push("/account/orders");
  }, [router]);

  const handleGoToHome = useCallback(() => {
    setShowSuccessPopup(false);
    router.push("/");
  }, [router]);

  // ✅ عرض حالة الطلب المكتمل مع order_number في URL
  if (isOrderCompleted && searchParams.get('order_number')) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('checkout.paymentSuccess')}</h2>
          <p className="text-gray-500 mb-4">
            {t('checkout.orderNumber')}: <span className="font-bold text-[#23A6F0]">{searchParams.get('order_number')}</span>
          </p>
          <p className="text-gray-400 text-sm mb-6">{t('checkout.redirecting')}</p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-[#23A6F0] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="" />
      </div>
    );
  }

  if (!isOrderCompleted && (!cart || cart.items?.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">{t('checkout.emptyCart')}</p>
        <Link
          href="/products"
          className="bg-[#23A6F0] text-white px-6 py-2 rounded-[8px]"
        >
          {t('checkout.shopNow')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l min-h-[80vh] from-[#bdcbf12a] to-[#feecea3b]">
      <div className="container page-with-padding mx-auto mb-3">
        <div className="mb-6">
          <h1 className="text-xl md:text-xl font-bold text-gray-800 mb-4">
            {t('checkout.checkoutTitle')}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/cart" className="hover:text-[#23A6F0] transition">
              {t('checkout.cart')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#23A6F0] font-medium">{t('checkout.checkoutTitle')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ContactInfoForm
              formData={formData}
              onFormChange={handleFormChange}
              isGuest={isGuest}
              t={t}
            />

            <DeliveryMethodForm
              deliveryMethod={formData.deliveryMethod}
              onDeliveryMethodChange={(method) =>
                handleFormChange({ deliveryMethod: method })
              }
              t={t}
            />

            {formData.deliveryMethod === "delivery" && (
              <DeliveryAddressForm
                show={true}
                addressData={formData.deliveryAddress}
                onAddressChange={(address) =>
                  handleFormChange({ deliveryAddress: address })
                }
                onAddressSaved={handleAddressSaved}
                onAddressSelected={handleAddressSelected}
                onCitySelected={handleCitySelected}
                isGuest={isGuest}
                t={t}
              />
            )}

            <PaymentMethodForm
              paymentMethod={formData.paymentMethod}
              onPaymentMethodChange={(method) =>
                handleFormChange({ paymentMethod: method as any })
              }
              onPaymentGatewayChange={handlePaymentGatewayChange}
            />

            <NotesForm
              notes={formData.notes}
              onNotesChange={(notes) => handleFormChange({ notes })}
              t={t}
            />

            {/* ✅ Checkbox إنشاء حساب للضيف */}
            {isGuest && (
              <div className="bg-white rounded-[8px] p-4 border border-gray-200 mb-2 md:mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type="checkbox"
                      id="createAccount"
                      checked={createAccount}
                      onChange={(e) => handleCreateAccountToggle(e.target.checked)}
                      disabled={isSendingAccount}
                      className="w-5 h-5 rounded border-gray-300 text-[#23A6F0] focus:ring-[#23A6F0] cursor-pointer disabled:opacity-50"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="createAccount"
                      className="font-semibold text-gray-800 text-sm cursor-pointer flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-[#23A6F0]" />
                      {t('checkout.createAccount')}
                      {isSendingAccount && (
                        <span className="text-xs text-gray-400 mr-2">{t('checkout.sending')}</span>
                      )}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('checkout.createAccountDescription')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isOrderCompleted}
              className="hidden md:block w-full bg-[#2DA5F3] hover:bg-[#3fadf7] text-white py-3 rounded-[8px] font-semibold text-lg transition disabled:opacity-50"
            >
              {isSubmitting ? t('checkout.processing') : t('checkout.confirmOrder')}
            </button>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              cartSummary={cartSummary}
              deliveryMethod={formData.deliveryMethod}
              currencySymbol={currencySymbol}
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isOrderCompleted}
              className="block md:hidden w-full bg-[#2DA5F3] hover:bg-[#3fadf7] text-white py-3 rounded-[8px] font-semibold text-lg transition disabled:opacity-50"
            >
              {isSubmitting ? t('checkout.processing') : t('checkout.confirmOrder')}
            </button>
          </div>
        </div>
      </div>

      {/* Popup التوجيه إلى بوابة الدفع */}
      {showRedirectPopup && redirectUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t('checkout.redirectingToPayment')}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {t('checkout.redirectingToPaymentDesc')}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-300"></div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              {t('checkout.redirectingAuto')}
            </p>
          </div>
        </div>
      )}

      {showSuccessPopup && orderResult && (
        <SuccessPopup
          isOpen={showSuccessPopup}
          onClose={handleClosePopup}
          onGoToOrders={handleGoToOrders}
          onGoToHome={handleGoToHome}
          orderNumber={orderResult.orderNumber}
          orderDetails={{
            itemsCount: orderResult.itemsCount,
            total: orderResult.total,
          }}
          isGuest={isGuest}
          phone={formData.phone || ""}
          email={formData.email || accountData.email || ""}
          currencySymbol={currencySymbol}
          t={t}
        />
      )}
    </div>
  );
}

// ✅ Popup النجاح (محدث للترجمة والعملة)
interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToOrders: () => void;
  onGoToHome: () => void;
  orderNumber: string | number;
  orderDetails: {
    itemsCount: number;
    total: number;
  };
  isGuest: boolean;
  phone?: string;
  email?: string;
  currencySymbol?: string;
  t: any;
}

function SuccessPopup({
  isOpen,
  onClose,
  onGoToOrders,
  onGoToHome,
  orderNumber,
  orderDetails,
  isGuest = false,
  phone = "",
  email = "",
  currencySymbol = "ج.م",
  t,
}: SuccessPopupProps) {
  if (!isOpen) return null;

  const cleanPhone = phone.replace(/^\+?20\s*/, "").trim();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        <div className="p-6 text-center border-b border-gray-100">
          <div className="flex justify-center mb-3">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {t('checkout.orderSuccess')}
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            {t('checkout.thankYouMessage')}
          </p>
        </div>

        <div className="p-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center mb-3">
            <p className="text-xs text-gray-500 mb-1">{t('checkout.orderNumber')}</p>
            <p className="text-xl font-bold text-gray-800">#{orderNumber}</p>
          </div>

          {isGuest && (phone || email) && (
            <div className="bg-blue-50 rounded-xl p-3 text-center mb-3 border border-blue-100">
              <p className="text-xs text-gray-500 mb-2">{t('checkout.accountCreatedInfo')}</p>
              <div className="space-y-1 text-sm text-gray-700">
                {email && (
                  <p className="flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3 text-blue-500" />
                    <span>{email}</span>
                  </p>
                )}
                {cleanPhone && (
                  <p className="flex items-center justify-center gap-1">
                    <Phone className="w-3 h-3 text-blue-500" />
                    <span>+20 {cleanPhone}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`grid ${isGuest ? 'grid-cols-1' : 'grid-cols-2'} gap-2 md:gap-5 mx-auto px-4 md:px-5 mb-5`}>
          <button
            onClick={onGoToHome}
            className="w-full py-2 md:py-3 rounded-[8px] font-medium border transition"
          >
            {t('checkout.backToHome')}
          </button>
          {!isGuest && (
            <button
              onClick={onGoToOrders}
              className="w-full bg-[#2DA5F3] text-white py-2 rounded-[8px] font-medium hover:bg-[#d41c19] transition"
            >
              {t('checkout.myOrders')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}