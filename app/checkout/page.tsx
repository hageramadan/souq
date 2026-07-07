"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle, User, Mail, Phone, MapPin, Building, Home, AlertCircle, Eye, EyeOff } from "lucide-react";
import {
  CartItem,
  CheckoutFormData,
  CartSummary,
} from "@/components/checkout/types";
import { useCartContext } from "@/contexts/CartContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// استيراد المكونات
import ContactInfoForm from "@/components/checkout/ContactInfoForm";
import DeliveryMethodForm from "@/components/checkout/DeliveryMethodForm";
import DeliveryAddressForm from "@/components/checkout/DeliveryAddressForm";
import PaymentMethodForm from "@/components/checkout/PaymentMethodForm";
import NotesForm from "@/components/checkout/NotesForm";
import OrderSummary from "@/components/checkout/OrderSummary";

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

// دالة جلب الهيدرز مع التوكن و X-Guest-Token
const getHeaders = (): HeadersInit => {
  const token = getToken();
  const guestToken = getGuestToken();
  
  const headers: HeadersInit = {
    "Accept": "application/json",
    'content-type': 'application/json',
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (guestToken) {
    headers["X-Guest-Token"] = guestToken;
  }
  
  return headers;
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

// ✅ دالة التحقق من رقم الهاتف حسب الدولة
const validatePhoneNumberByCountry = (
  phoneNumber: string,
  countryCode: string,
): { isValid: boolean; error: string } => {
  const cleanNumber = phoneNumber.replace(/[\s\-]/g, "");

  if (!cleanNumber) {
    return { isValid: false, error: "رقم الهاتف مطلوب" };
  }

  if (!/^\d+$/.test(cleanNumber)) {
    return { isValid: false, error: "يجب أن يحتوي رقم الهاتف على أرقام فقط" };
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
      name: "مصر",
      minLength: 11,
      maxLength: 11,
      startsWith: ["010", "011", "012", "015"],
      pattern: /^01[0125][0-9]{8}$/,
    },
    "+966": {
      name: "السعودية",
      minLength: 9,
      maxLength: 9,
      startsWith: ["05"],
      pattern: /^05[0-9]{8}$/,
    },
    "+964": {
      name: "العراق",
      minLength: 11,
      maxLength: 11,
      startsWith: ["07"],
      pattern: /^07[0-9]{9}$/,
    },
    "+971": {
      name: "الإمارات",
      minLength: 9,
      maxLength: 9,
      startsWith: ["05"],
      pattern: /^05[0-9]{8}$/,
    },
  };

  const rule = rules[countryCode];
  if (!rule) {
    return { isValid: false, error: "كود الدولة غير صالح" };
  }

  if (cleanNumber.length !== rule.minLength) {
    return {
      isValid: false,
      error: `رقم الهاتف في ${rule.name} يجب أن يكون ${rule.minLength} أرقام (الطول الحالي: ${cleanNumber.length})`,
    };
  }

  const startsWithValid = rule.startsWith.some((prefix) =>
    cleanNumber.startsWith(prefix),
  );
  if (!startsWithValid) {
    return {
      isValid: false,
      error: `رقم الهاتف في ${rule.name} يجب أن يبدأ بـ (${rule.startsWith.join(" أو ")})`,
    };
  }

  if (!rule.pattern.test(cleanNumber)) {
    return {
      isValid: false,
      error: `رقم الهاتف غير صحيح لدولة ${rule.name}`,
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

// تحويل بيانات السلة
const transformCartItems = (cart: any): CartItem[] => {
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

    let brandName = "ماركة";
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

export default function CheckoutPage() {
  const {
    cart,
    isLoading: cartLoading,
    refetchCart,
    updateCart,
    isGuest,
  } = useCartContext();
  const router = useRouter();
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

  // ✅ حالة خيار إنشاء حساب (Checkbox)
  const [createAccount, setCreateAccount] = useState(false);
  const [accountData, setAccountData] = useState<AccountData>({
    email: "",
    phone: "",
    name: "",
    password: "", // ✅ فارغ
    password_confirmation: "", // ✅ فارغ
  });
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});
  const [isSendingAccount, setIsSendingAccount] = useState(false);

  // ✅ استخدم useRef لتخزين cityId بشكل فوري
  const selectedCityIdRef = useRef<string | null>(null);
  
  // ✅ منع الاستدعاء المتكرر للـ API
  const isFetchingRef = useRef<boolean>(false);
  
  // ✅ تتبع آخر قيمة لـ deliveryMethod لمنع الاستدعاء المتكرر
  const lastDeliveryMethodRef = useRef<string | null>(null);
  
  // ✅ تتبع آخر قيمة لـ cityId لمنع الاستدعاء المتكرر
  const lastFetchedCityIdRef = useRef<string | null>(null);

  const cartItems = useMemo(() => transformCartItems(cart), [cart]);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    phone: "",
    phoneNumber: "",
    phoneCountryCode: "+20",
    email: "", // ✅ إضافة حقل email
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
    };
  }, [cart, formData.deliveryMethod, selectedCityId]);

  // ✅ التعديل المهم: لا تقم بإعادة التوجيه إلى الرئيسية عند فراغ السلة إذا كان الطلب قد تم بنجاح
  useEffect(() => {
    if (isOrderCompleted) return;

    if (!cartLoading && (!cart || cart.items?.length === 0)) {
      router.replace("/");
    }
  }, [cart, cartLoading, router, isOrderCompleted]);

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

  // ✅ دالة لاستقبال address_id بعد حفظ العنوان
  const handleAddressSaved = useCallback(
    async (address: any) => {
      if (isFetchingRef.current) return;

      if (address && address.id) {
        setSelectedAddressId(address.id);
        toast.success("تم حفظ العنوان بنجاح");

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
    [selectedCityId, formData.deliveryMethod, updateCart],
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

  // ✅ دالة التحقق من بيانات الحساب (بدون التحقق من كلمة المرور)
  const validateAccountData = (): boolean => {
    const errors: Record<string, string> = {};

    if (!accountData.email.trim()) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
      errors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!accountData.phone.trim()) {
      errors.phone = "رقم الهاتف مطلوب";
    } else {
      const phoneValidation = validatePhoneNumberByCountry(
        accountData.phone.replace(/[\s\-]/g, ""),
        "+20",
      );
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error;
      }
    }

    if (!accountData.name.trim()) {
      errors.name = "الاسم مطلوب";
    } else if (accountData.name.trim().length < 3) {
      errors.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    }

    // ✅ لا نتحقق من كلمة المرور لأنها ستُرسل فارغة

    setAccountErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ دالة إرسال بيانات الحساب للباك اند (مع كلمة المرور الفارغة)
  const sendAccountDataToBackend = useCallback(async () => {
    if (!createAccount || isSendingAccount) return;
    
    // التحقق من صحة البيانات (بدون كلمة المرور)
    if (!validateAccountData()) {
      toast.error("يرجى تصحيح الأخطاء في بيانات الحساب");
      return;
    }

    setIsSendingAccount(true);
    
    try {
      // ✅ إرسال البيانات للباك اند مع كلمة مرور فارغة
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name: accountData.name,
          email: accountData.email,
          phone: accountData.phone,
          password: accountData.password || "", // ✅ فارغ
          password_confirmation: accountData.password_confirmation || "", // ✅ فارغ
        }),
      });

      const data = await response.json();
      
      if (data.result === true) {
        toast.success("تم إنشاء الحساب بنجاح!");
        // ✅ حفظ التوكن إذا رجعه الباك اند
        if (data.data?.token) {
          localStorage.setItem("auth_token", data.data.token);
        }
      } else {
        toast.error(data.message || "فشل إنشاء الحساب");
        setCreateAccount(false); // إلغاء التحديد
      }
    } catch (error) {
      console.error("❌ Error creating account:", error);
      toast.error("حدث خطأ أثناء إنشاء الحساب");
      setCreateAccount(false); // إلغاء التحديد
    } finally {
      setIsSendingAccount(false);
    }
  }, [createAccount, accountData, isSendingAccount]);

  // ✅ عند تغيير حالة الـ Checkbox (تشغيل/إيقاف)
  const handleCreateAccountToggle = useCallback(async (checked: boolean) => {
    setCreateAccount(checked);
    
    if (checked) {
      // ✅ عند التفعيل: تعبئة البيانات من النموذج مع كلمة مرور فارغة
      setAccountData((prev) => ({
        ...prev,
        name: formData.fullName || "",
        phone: formData.phone || "",
        email: formData.email || "",
        password: "", // ✅ فارغ
        password_confirmation: "", // ✅ فارغ
      }));
      
      // ✅ إرسال البيانات فوراً عند التفعيل
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

  // ✅ تحضير بيانات الطلب (معدل لدعم الضيف)
  const prepareOrderData = useCallback(() => {
    const paymentMethodMap: Record<string, string> = {
      cash: "cash",
      card: "online",
      mada: "online",
      wallet: "online",
    };

    const deliveryMethodMap: Record<string, string> = {
      delivery: "delivery",
      pickup: "receive",
    };

    // ✅ بناء orderData الأساسي
    const orderData: any = {
      payment_method: paymentMethodMap[formData.paymentMethod] || "cash",
      delivery_method: deliveryMethodMap[formData.deliveryMethod] || "delivery",
      notes: formData.notes || "",
      create_account: createAccount,
    };

    // ✅ إذا كان الضيف يريد إنشاء حساب، أضف بيانات الحساب (مع كلمة مرور فارغة)
    if (createAccount && isGuest) {
      orderData.account = {
        email: accountData.email,
        phone: accountData.phone,
        name: accountData.name,
        password: accountData.password || "", // ✅ فارغ
        password_confirmation: accountData.password_confirmation || "", // ✅ فارغ
      };
    }

    // ✅ إضافة payment_gateway فقط إذا كانت طريقة الدفع هي المحفظة
    if (formData.paymentMethod === "wallet") {
      orderData.payment_gateway = "wallet";
    }

    // ✅ بيانات إضافية للضيف
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

    // ✅ إذا كان المستخدم مسجل دخول ولديه عنوان
    if (!isGuest && formData.deliveryMethod === "delivery") {
      if (selectedAddressId) {
        orderData.address_id = selectedAddressId;
      }
    }

 
    return orderData;
  }, [formData, selectedAddressId, createAccount, isGuest, accountData]);

  // ✅ إرسال الطلب (معدل)
  const handleSubmit = async () => {
    if (isSubmitting || isOrderCompleted) return;

    // ✅ التحقق من البيانات الأساسية
    if (!formData.fullName.trim()) {
      toast.error("الرجاء إدخال الاسم الكامل");
      return;
    }

    const phoneValidation = validatePhoneNumberByCountry(
      formData.phoneNumber ||
        formData.phone.replace(formData.phoneCountryCode || "", ""),
      formData.phoneCountryCode || "+20",
    );

    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error);
      return;
    }

    if (formData.deliveryMethod === "delivery" && !selectedAddressId && isGuest) {
      const address = formData.deliveryAddress;
      if (!address.street || !address.city) {
        toast.error("الرجاء إدخال بيانات العنوان بالكامل");
        return;
      }
    }

    if (formData.deliveryMethod === "delivery" && !selectedAddressId && !isGuest) {
      toast.error("الرجاء حفظ العنوان أو اختيار عنوان محفوظ أولاً");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = prepareOrderData();
      const response = await createOrder(orderData);

      if (response.result === true && response.data) {
        const completedOrder: CompletedOrderResult = {
          orderNumber: response.data.order_number,
          itemsCount: cartItems.length,
          total: response.data.total_amount,
        };

        setOrderResult(completedOrder);
        setIsOrderCompleted(true);
        setShowSuccessPopup(true);

        refetchCart().catch((err) => {
          console.error("❌ Error refetching cart after order success:", err);
        });
      } else {
        toast.error(response.message || "حدث خطأ أثناء إنشاء الطلب");
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
      toast.error("حدث خطأ أثناء إنشاء الطلب");
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
        <p className="text-gray-500 mb-4">سلة التسوق فارغة</p>
        <Link
          href="/products"
          className="bg-[#23A6F0] text-white px-6 py-2 rounded-[8px] "
        >
          تسوق الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l min-h-[80vh] from-[#bdcbf12a] to-[#feecea3b]">
      <div className="container page-with-padding mx-auto mb-3">
        <div className="mb-6">
          <h1 className="text-xl md:text-xl font-bold text-gray-800 mb-4">
            إتمام الطلب
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/cart" className="hover:text-[#23A6F0] transition">
              سلة التسوق
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#23A6F0] font-medium">إتمام الطلب</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ContactInfoForm
              formData={formData}
              onFormChange={handleFormChange}
              isGuest={isGuest}
            />

            <DeliveryMethodForm
              deliveryMethod={formData.deliveryMethod}
              onDeliveryMethodChange={(method) =>
                handleFormChange({ deliveryMethod: method })
              }
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
              />
            )}

            <PaymentMethodForm
              paymentMethod={formData.paymentMethod}
              onPaymentMethodChange={(method) =>
                handleFormChange({ paymentMethod: method as any })
              }
            />

            <NotesForm
              notes={formData.notes}
              onNotesChange={(notes) => handleFormChange({ notes })}
            />

            {/* ✅ Checkbox إنشاء حساب للضيف (بدون حقول كلمة المرور) */}
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
                      إنشاء حساب جديد
                      {isSendingAccount && (
                        <span className="text-xs text-gray-400 mr-2">جاري الإرسال...</span>
                      )}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      سيتم إنشاء حساب باستخدام بياناتك (البريد الإلكتروني، رقم الهاتف، الاسم)
                    </p>
                    
                    {/* ✅ عرض بيانات الحساب عند التفعيل (بدون كلمة المرور) */}
                    {/* {createAccount && !isSendingAccount && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">الاسم:</span> {accountData.name || "..."}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">البريد الإلكتروني:</span> {accountData.email || "..."}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">رقم الهاتف:</span> {accountData.phone || "..."}
                        </p>
                       
                        {Object.keys(accountErrors).length > 0 && (
                          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                            {Object.entries(accountErrors).map(([key, error]) => (
                              <p key={key} className="text-xs text-red-600">• {error}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
               
                    {createAccount && !isSendingAccount && accountData.name && accountData.email && accountData.phone && Object.keys(accountErrors).length === 0 && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-xs text-green-600">✅ تم إنشاء الحساب بنجاح</p>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isOrderCompleted}
              className="hidden md:block w-full bg-[#2DA5F3] hover:bg-[#3fadf7] text-white py-3 rounded-[8px] font-semibold text-lg transition disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
            </button>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              cartSummary={cartSummary}
              deliveryMethod={formData.deliveryMethod}
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isOrderCompleted}
              className="block md:hidden w-full bg-[#2DA5F3] hover:bg-[#3fadf7] text-white py-3 rounded-[8px] font-semibold text-lg transition disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
            </button>
          </div>
        </div>
      </div>

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
        />
      )}
    </div>
  );
}

// ✅ Popup النجاح
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
}

function SuccessPopup({
  isOpen,
  onClose,
  onGoToOrders,
  onGoToHome,
  orderNumber,
  orderDetails,
  isGuest = false,
}: SuccessPopupProps) {
  if (!isOpen) return null;

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
            تم إتمام طلبك بنجاح
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            شكراً لتسوقك معنا، طلبك قيد التحضير الآن.
          </p>
        </div>

        <div className="p-1">
          <div className="bg-gray-50 rounded-[8px] p-2 text-center mb-2">
            <p className="text-xs text-gray-500 mb-1">رقم الطلب</p>
            <p className="text-xl font-bold text-gray-800">#{orderNumber}</p>
          </div>
        </div>

        <div className={`grid ${isGuest ? 'grid-cols-1' : 'grid-cols-2'} gap-2 md:gap-5 mx-auto px-4 md:px-5 mb-5`}>
          <button
            onClick={onGoToHome}
            className="w-full py-2 md:py-3 rounded-[8px] font-medium border transition"
          >
            العودة إلى الرئيسية
          </button>
          {!isGuest && (
            <button
              onClick={onGoToOrders}
              className="w-full bg-[#2DA5F3] text-white py-2 rounded-[8px] font-medium hover:bg-[#d41c19] transition"
            >
              متابعة الطلبات
            </button>
          )}
        </div>
      </div>
    </div>
  );
}