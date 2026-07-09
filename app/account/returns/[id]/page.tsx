// // // app/account/returns/[id]/page.tsx
// // "use client";

// // import { useState, useEffect } from "react";
// // import { useParams, useRouter } from "next/navigation";
// // import {
// //   Package,
// //   Truck,
// //   CheckCircle,
// //   Clock,
// //   PackageCheck,
// //   XCircle,
// //   ChevronRight,
// //   DollarSign,
// //   RefreshCw,
// //   AlertCircle
// // } from "lucide-react";
// // import { GrMoney } from "react-icons/gr";
// // import Image from "next/image";
// // import Link from "next/link";
// // import { IoCopyOutline } from "react-icons/io5";
// // import { FaLocationDot } from "react-icons/fa6";
// // import toast from "react-hot-toast";

// // // ========== تعريف الأنواع ==========
// // interface ReturnProductItem {
// //   id: number;
// //   product: {
// //     id: number;
// //     name: string;
// //     images: string[];
// //     pricing?: {
// //       final_price: number;
// //     };
// //   };
// //   title: string;
// //   variant_id: number | null;
// //   quantity: number;
// //   unit_price: number;
// //   discount_amount: number;
// //   total_price: number;
// //   images: string[];
// //   variant?: {
// //     id: number;
// //     sku: string | null;
// //     price: number;
// //     has_discount: boolean;
// //     discount_type: string | null;
// //     discount_value: string | null;
// //     price_after_discount: number;
// //     quantity: number;
// //     is_active: boolean;
// //     variant_image: string;
// //     attributes: Array<{
// //       id: number;
// //       attribute_type: {
// //         id: number;
// //         name: string;
// //       };
// //       value: string;
// //       meta: {
// //         color?: string;
// //       } | null;
// //     }>;
// //   };
// // }

// // interface AdditionalData {
// //   name?: string;
// //   phone?: string;
// //   email?: string;
// // }

// // interface ReturnOrder {
// //   id: number;
// //   order_number: string;
// //   status: string;
// //   status_label: string;
// //   payment_method: string;
// //   payment_status: string;
// //   delivery_method: string;
// //   subtotal: number;
// //   coupon_discount_amount: number;
// //   total_discount_amount: number;
// //   subtotal_after_discount: number;
// //   shipping_amount: number;
// //   tax_amount: number;
// //   total_amount: number;
// //   notes: string | null;
// //   additional_data?: AdditionalData | null;
// //   items: ReturnProductItem[];
// //   created_at: string;
// // }

// // interface ReturnDetails {
// //   id: number;
// //   returnNumber: string;
// //   status: "pending" | "approved" | "picked_up" | "inspected" | "refunded" | "rejected" | "cancelled";
// //   status_label: string;
// //   refund_method: string;
// //   notes: string | null;
// //   order: ReturnOrder;
// //   created_at: string;
// // }

// // // ========== إعدادات API ==========
// // const API_URL = 'https://admin.souqkaber.com/api';

// // const getToken = (): string | null => {
// //   if (typeof window !== 'undefined') {
// //     return localStorage.getItem('auth_token');
// //   }
// //   return null;
// // };

// // const getHeaders = (): HeadersInit => {
// //   const token = getToken();
// //   return {
// //     'Content-Type': 'application/json',
// //     ...(token && { 'Authorization': `Bearer ${token}` }),
// //   };
// // };

// // // صورة ثابتة للمنتجات التي لا تحتوي على صورة
// // const PLACEHOLDER_IMAGE = "/images/placeholder-product.jpg";

// // // ========== دالة جلب تفاصيل المرتجع ==========
// // const fetchReturnDetails = async (returnId: string): Promise<ReturnDetails | null> => {
// //   try {
// //     const response = await fetch(`${API_URL}/returns/${returnId}`, {
// //       method: 'GET',
// //       headers: getHeaders(),
// //     });
    
// //     if (response.status === 401) {
// //       if (typeof window !== 'undefined') {
// //         localStorage.removeItem('auth_token');
// //         localStorage.removeItem('user_data');
// //       }
// //       throw new Error('UNAUTHORIZED');
// //     }
    
// //     const data = await response.json();
    
// //     if (data.result === true && data.data) {
// //       return transformReturnDetails(data.data);
// //     }
// //     return null;
// //   } catch (error) {
// //     console.error("❌ Error fetching return details:", error);
    
// //     if (error instanceof Error && error.message === 'UNAUTHORIZED') {
// //       toast.error("جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى", {
// //         duration: 3000,
// //         position: "top-center",
// //       });
// //       if (typeof window !== 'undefined') {
// //         window.location.href = '/auth/login';
// //       }
// //       return null;
// //     }
    
// //     toast.error("حدث خطأ في جلب تفاصيل المرتجع");
// //     return null;
// //   }
// // };

// // // ========== تحويل بيانات المرتجع ==========
// // const transformReturnDetails = (apiReturn: any): ReturnDetails => {
// //   return {
// //     id: apiReturn.id,
// //     returnNumber: `#R${String(apiReturn.id).padStart(5, '0')}`,
// //     status: apiReturn.status,
// //     status_label: apiReturn.status_label,
// //     refund_method: apiReturn.refund_method,
// //     notes: apiReturn.notes,
// //     order: {
// //       id: apiReturn.order.id,
// //       order_number: apiReturn.order.order_number,
// //       status: apiReturn.order.status,
// //       status_label: apiReturn.order.status_label,
// //       payment_method: apiReturn.order.payment_method,
// //       payment_status: apiReturn.order.payment_status,
// //       delivery_method: apiReturn.order.delivery_method,
// //       subtotal: apiReturn.order.subtotal,
// //       coupon_discount_amount: apiReturn.order.coupon_discount_amount,
// //       total_discount_amount: apiReturn.order.total_discount_amount,
// //       subtotal_after_discount: apiReturn.order.subtotal_after_discount,
// //       shipping_amount: apiReturn.order.shipping_amount,
// //       tax_amount: apiReturn.order.tax_amount,
// //       total_amount: apiReturn.order.total_amount,
// //       notes: apiReturn.order.notes,
// //       additional_data: apiReturn.order.additional_data,
// //       items: apiReturn.order.items || [],
// //       created_at: apiReturn.order.created_at,
// //     },
// //     created_at: apiReturn.created_at,
// //   };
// // };

// // // ========== تنسيق التاريخ ==========
// // const formatDate = (dateString: string): string => {
// //   const date = new Date(dateString);
// //   return date.toLocaleDateString("ar-EG", {
// //     year: "numeric",
// //     month: "long",
// //     day: "numeric",
// //   });
// // };

// // // ========== تنظيف رابط الصورة ==========
// // const cleanImageUrl = (url: string): string => {
// //   if (!url) return PLACEHOLDER_IMAGE;
// //   if (url.startsWith("/storage")) {
// //     return `https://admin.souqkaber.com${url}`;
// //   }
// //   return url;
// // };

// // // ========== ترجمة طريقة استرداد المبلغ ==========
// // const translateRefundMethod = (method: string): string => {
// //   const methodMap: Record<string, string> = {
// //     "wallet": "محفظة التطبيق",
// //     "bank": "تحويل بنكي",
// //     "card": "بطاقة الدفع",
// //   };
// //   return methodMap[method] || method;
// // };

// // // ========== الحصول على اسم المستخدم ==========
// // const getUserName = (order: ReturnOrder): string => {
// //   if (order.additional_data?.name) {
// //     return order.additional_data.name;
// //   }
// //   return "غير متوفر";
// // };

// // // ========== استخراج المقاس واللون ==========
// // const getSize = (item: ReturnProductItem): string | null => {
// //   if (!item.variant?.attributes) return null;
// //   const sizeAttr = item.variant.attributes.find(
// //     (attr) => attr.attribute_type.name === "مقاس"
// //   );
// //   return sizeAttr?.value || null;
// // };

// // const getColor = (item: ReturnProductItem): { name: string; hex: string | null } | null => {
// //   if (!item.variant?.attributes) return null;
// //   const colorAttr = item.variant.attributes.find(
// //     (attr) => attr.attribute_type.name === "اللون"
// //   );
// //   if (!colorAttr) return null;
  
// //   return {
// //     name: colorAttr.value,
// //     hex: colorAttr.meta?.color || null,
// //   };
// // };

// // // ========== حالة المرتجع مع التنسيق ==========
// // const returnStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
// //   pending: { label: "قيد المراجعة", color: "status-return-pending", icon: Clock },
// //   approved: { label: "تم الموافقة", color: "status-return-approved", icon: CheckCircle },
// //   picked_up: { label: "تم الاستلام", color: "status-return-picked", icon: Truck },
// //   inspected: { label: "قيد الفحص", color: "status-return-inspected", icon: PackageCheck },
// //   refunded: { label: "تم الاسترداد", color: "status-return-refunded", icon: DollarSign },
// //   rejected: { label: "مرفوض", color: "status-return-rejected", icon: XCircle },
// //   cancelled: { label: "ملغي", color: "status-return-cancelled", icon: AlertCircle }
// // };

// // export default function ReturnDetailsPage() {
// //   const params = useParams();
// //   const router = useRouter();
// //   const returnId = params.id as string;
  
// //   const [returnData, setReturnData] = useState<ReturnDetails | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [returnNotes, setReturnNotes] = useState("");
// //   const [copied, setCopied] = useState(false);

// //   useEffect(() => {
// //     const token = getToken();
// //     if (!token) {
// //       toast.error("يرجى تسجيل الدخول أولاً", {
// //         duration: 3000,
// //         position: "top-center",
// //       });
// //       router.push('/auth/login');
// //       return;
// //     }
    
// //     const loadReturnDetails = async () => {
// //       setLoading(true);
// //       const data = await fetchReturnDetails(returnId);
// //       setReturnData(data);
// //       if (data?.notes) {
// //         setReturnNotes(data.notes);
// //       }
// //       setLoading(false);
// //     };
    
// //     if (returnId) {
// //       loadReturnDetails();
// //     }
// //   }, [returnId, router]);

// //   const copyReturnNumber = () => {
// //     if (returnData) {
// //       navigator.clipboard.writeText(returnData.returnNumber);
// //       setCopied(true);
// //       toast.success("تم نسخ رقم المرتجع", {
// //         duration: 2000,
// //         position: "top-center",
// //       });
// //       setTimeout(() => setCopied(false), 2000);
// //     }
// //   };

// //   const copyOrderNumber = () => {
// //     if (returnData) {
// //       navigator.clipboard.writeText(returnData.order.order_number);
// //       toast.success("تم نسخ رقم الطلب", {
// //         duration: 2000,
// //         position: "top-center",
// //       });
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
// //         <div className="container mx-auto px-4 py-8 text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23A6F0] mx-auto"></div>
// //           <p className="text-gray-500 mt-4">جاري تحميل تفاصيل المرتجع...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (!returnData) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
// //         <div className="container mx-auto px-4 py-8 text-center">
// //           <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
// //           <h2 className="text-xl font-bold text-gray-800 mb-2">المرتجع غير موجود</h2>
// //           <p className="text-gray-500 mb-4">عذراً، لا يمكننا العثور على هذا المرتجع</p>
// //           <Link href="/account/returns" className="inline-block bg-[#23A6F0] text-white px-6 py-2 rounded-[8px] hover:bg-[#36abf0] transition">
// //             العودة إلى المرتجعات
// //           </Link>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const status = returnStatusConfig[returnData.status] || returnStatusConfig.pending;
// //   const StatusIcon = status.icon;
// //   const totalRefund = returnData.order?.total_amount || 0;
// //   const itemsCount = returnData.order?.items?.length || 0;
// //   const userName = getUserName(returnData.order);

// //   return (
// //     <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
// //       <div className="container mx-auto mb-3 px-4 md:px-8">
// //         {/* Breadcrumb */}
// //         <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
// //           <Link href="/account" className="hover:text-[#23A6F0] transition">حسابي</Link>
// //           <ChevronRight className="w-4 h-4" />
// //           <Link href="/account/returns" className="hover:text-[#23A6F0] transition">المرتجعات</Link>
// //           <ChevronRight className="w-4 h-4" />
// //           <span className="text-[#23A6F0] font-medium">تفاصيل المرتجع</span>
// //         </div>
        
// //         <h1 className="text-[20px] font-bold mb-2 md:text-xl text-[#180100] md:mb-4">تفاصيل المرتجع</h1>
        
// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //           {/* العمود الأيمن */}
// //           <div className="lg:col-span-2 space-y-6">
// //             {/* معلومات المرتجع الأساسية */}
// //             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
// //               <div className="flex flex-col gap-3">
// //                 <div className="flex justify-between items-start">
// //                   <div className="flex flex-wrap items-center gap-2 sm:gap-4">
// //                     <div className="flex gap-2 sm:gap-4 items-center text-base sm:text-[20px] font-bold text-[#180100]">
// //                       <h1 className="text-sm sm:text-base">رقم المرتجع</h1>
// //                       <div className="flex gap-1 sm:gap-2 items-center">
// //                         <p className="font-bold text-gray-800 text-sm sm:text-base">
// //                           {returnData.returnNumber}
// //                         </p>
// //                         <IoCopyOutline 
// //                           className={`w-4 h-4 sm:w-5 sm:h-5 cursor-pointer transition ${copied ? 'text-green-500' : 'hover:text-[#23A6F0]'}`}
// //                           onClick={copyReturnNumber}
// //                         />
// //                       </div>
// //                     </div>
// //                     <div className="flex gap-2 sm:gap-4 items-center text-sm sm:text-base text-gray-500">
// //                       <span className="hidden sm:inline">|</span>
// //                       <h1 className="text-xs sm:text-sm">الطلب</h1>
// //                       <div className="flex gap-1 sm:gap-2 items-center">
// //                         <p className="text-gray-600 text-xs sm:text-sm">{returnData.order.order_number}</p>
// //                         <IoCopyOutline 
// //                           className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-[#23A6F0] transition"
// //                           onClick={copyOrderNumber}
// //                         />
// //                       </div>
// //                     </div>
// //                   </div>
// //                   <div className={`px-2 sm:px-3 py-1 rounded-full sm:text-sm text-[10px] font-medium flex items-center gap-1 sm:gap-1.5 ${status.color}`}>
// //                     <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
// //                     {status.label}
// //                   </div>
// //                 </div>
// //                 <p className="text-sm sm:text-[18px] text-[#333333]">{formatDate(returnData.created_at)}</p>
// //               </div>
// //             </div>
            
// //             <br />
            
// //             {/* المنتجات مع المقاس واللون */}
// //             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
// //               <h2 className="text-lg font-bold text-gray-800 mb-4">المنتجات ({itemsCount})</h2>
// //               <div className="space-y-4">
// //                 {returnData.order.items.map((item, idx) => {
// //                   // ✅ استخدام صورة المتغير أولاً إذا كانت موجودة
// //                   const variantImage = item.variant?.variant_image 
// //                     ? cleanImageUrl(item.variant.variant_image) 
// //                     : null;
                  
// //                   const productImage = item.images && item.images.length > 0 
// //                     ? cleanImageUrl(item.images[0]) 
// //                     : PLACEHOLDER_IMAGE;

// //                   // ✅ اختيار الصورة المناسبة (أولوية لصورة المتغير)
// //                   const displayImage = variantImage || productImage;
                  
// //                   // استخراج المقاس واللون
// //                   const size = getSize(item);
// //                   const color = getColor(item);
                  
// //                   return (
// //                     <div key={idx} className="flex flex-col md:flex-row items-center gap-4 border border-gray-200 rounded-[8px] p-3">
// //                       <div className="w-20 h-20 bg-gray-100  rounded-[8px]  overflow-hidden flex-shrink-0 relative">
// //                         <Image
// //                           src={displayImage}
// //                           alt={item.title}
// //                           width={80}
// //                           height={80}
// //                           className="object-cover w-full h-full"
// //                           onError={(e) => {
// //                             (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
// //                           }}
// //                         />
// //                         {/* ✅ إشارة صغيرة توضح أن هذه صورة المتغير */}
// //                         {/* {variantImage && (
// //                           <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded-tl-md">
// //                             المتغير
// //                           </span>
// //                         )} */}
// //                       </div>
// //                       <div className="flex-1 md:text-right text-center">
// //                         <div className="flex flex-col md:flex-row gap-3 md:justify-between items-center md:items-start">
// //                           <div>
// //                             <p className="font-bold text-gray-800">{item.title}</p>
                            
// //                             {/* عرض المقاس واللون */}
// //                             <div className="flex flex-wrap gap-2 mt-1.5">
// //                               {size && (
// //                                 <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
// //                                   <span className="font-medium">المقاس:</span>
// //                                   <span>{size}</span>
// //                                 </span>
// //                               )}
                              
// //                               {color && (
// //                                 <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
// //                                   <span className="font-medium">اللون:</span>
// //                                   <span>{color.name}</span>
// //                                   {color.hex && (
// //                                     <span 
// //                                       className="w-3 h-3 rounded-full border border-gray-300 inline-block"
// //                                       style={{ backgroundColor: color.hex }}
// //                                     />
// //                                   )}
// //                                 </span>
// //                               )}
// //                             </div>
                            
// //                             <div className="flex gap-1 md:gap-3 mt-2 text-xs text-black font-bold">
// //                               <span>الكمية: <span className="text-gray-500">x{item.quantity}</span></span>
// //                               <span>السعر: <span className="text-gray-500">EGP {item.unit_price.toFixed(2)}</span></span>
// //                             </div>
// //                           </div>
// //                           <div className="text-left">
// //                             <p className="font-bold text-[#23A6F0]">EGP {item.total_price.toFixed(2)}</p>
// //                             {item.discount_amount > 0 && (
// //                               <p className="text-xs text-gray-400">الخصم: {item.discount_amount.toFixed(2)}</p>
// //                             )}
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   );
// //                 })}
// //               </div>
// //             </div>
            
// //             <br />
            
// //             {/* ملخص المرتجع */}
// //             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
// //               <h2 className="text-xl font-bold text-gray-800 mb-4">ملخص المرتجع</h2>
// //               <div className="space-y-3">
// //                 <div className="flex justify-between">
// //                   <span className="text-gray-500">المبلغ الإجمالي للطلب</span>
// //                   <span className="font-bold text-gray-800">EGP {returnData.order.subtotal.toFixed(2)}</span>
// //                 </div>
// //                 {returnData.order.coupon_discount_amount > 0 && (
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-500">خصم الكوبون</span>
// //                     <span className="font-bold text-[#23A6F0]">-EGP {returnData.order.coupon_discount_amount.toFixed(2)}</span>
// //                   </div>
// //                 )}
// //                 {returnData.order.total_discount_amount > 0 && (
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-500">الخصم الكلي</span>
// //                     <span className="font-bold text-[#23A6F0]">-EGP {returnData.order.total_discount_amount.toFixed(2)}</span>
// //                   </div>
// //                 )}
// //                 <div className="flex justify-between">
// //                   <span className="text-gray-500">رسوم التوصيل</span>
// //                   <span className="font-bold text-gray-800">EGP {returnData.order.shipping_amount.toFixed(2)}</span>
// //                 </div>
// //                 {returnData.order.tax_amount > 0 && (
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-500">الضرائب</span>
// //                     <span className="font-bold text-gray-800">EGP {returnData.order.tax_amount.toFixed(2)}</span>
// //                   </div>
// //                 )}
// //                 <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
// //                   <span className="text-lg font-bold text-gray-800">المبلغ المسترد</span>
// //                   <span className="text-xl font-bold text-[#23A6F0]">EGP {totalRefund.toFixed(2)}</span>
// //                 </div>
// //                 {returnData.refund_method && returnData.status === "refunded" && (
// //                   <div className="flex justify-end">
// //                     <p className="text-xs text-gray-500">
// //                       تم الاسترداد عبر: {translateRefundMethod(returnData.refund_method)}
// //                     </p>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>

// //           {/* العمود الأيسر */}
// //           <div className="space-y-6">
// //             {/* معلومات الاتصال */}
// //             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
// //               <h2 className="text-base font-bold text-gray-800 mb-4">معلومات الاتصال</h2>
// //               <div className="space-y-3">
// //                 <div className="flex justify-between items-center text-sm">
// //                   <span className="font-bold">الاسم الكامل</span>
// //                   <span className="font-medium text-gray-600">{userName}</span>
// //                 </div>
// //                 {returnData.order.additional_data?.phone && (
// //                   <div className="flex justify-between items-center text-sm">
// //                     <span className="font-bold">رقم الهاتف</span>
// //                     <span className="font-medium text-gray-600" dir="ltr">{returnData.order.additional_data.phone}</span>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
            
// //             <br />
            
// //             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
// //               <h2 className="text-base font-bold mb-4">طريقة الاستلام</h2>
// //               <span className="font-medium text-gray-800">
// //                 {returnData.order.delivery_method === "pickup" ? "استلام من الفرع" : "توصيل"}
// //               </span>
// //             </div>
            
// //             <br />
            
// //             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
// //               <h2 className="text-base font-bold mb-4">طريقة الدفع</h2>
// //               <div className="flex items-center gap-3 p-2 border border-gray-300  rounded-[8px] ">
// //                 <div className="w-10 h-10 bg-white rounded-[8px] flex items-center justify-center shadow-sm">
// //                   <GrMoney />
// //                 </div>
// //                 <div>
// //                   <p className="text-gray-500">{returnData.order.payment_method}</p>
// //                   <p className="text-xs text-gray-400">{returnData.order.payment_status}</p>
// //                 </div>
// //               </div>
// //             </div>
            
// //             <br />
            
// //             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
// //               <h2 className="text-base font-bold text-gray-800 mb-4">ملاحظات المرتجع</h2>
// //               <textarea
// //                 value={returnNotes || "لا توجد ملاحظات"}
// //                 onChange={(e) => setReturnNotes(e.target.value)}
// //                 className="w-full p-3 border border-gray-200  rounded-[8px]  focus:outline-none focus:border-[#23A6F0] resize-none bg-gray-50"
// //                 rows={3}
// //                 readOnly
// //               />
// //             </div>

// //             {/* <div className="flex gap-3 mt-3 md:mt-6">
// //               <Link 
// //                 href={`/account/orders/${returnData.order.id}`}
// //                 className="flex-1 border-2 border-[#000000] text-[#000000] py-3  rounded-[8px]  font-medium hover:bg-gray-50 transition text-center"
// //               >
// //                 عرض الطلب
// //               </Link>
// //             </div> */}
// //           </div>
// //         </div>
// //       </div>

// //       <style jsx global>{`
// //         .status-return-pending {
// //           background-color: #A0AEC03D;
// //           color: #A0AEC0;
// //         }
// //         .status-return-approved {
// //           background-color: #48BB783D;
// //           color: #48BB78;
// //         }
// //         .status-return-picked {
// //           background-color: #4299E13D;
// //           color: #4299E1;
// //         }
// //         .status-return-inspected {
// //           background-color: #A0AEC03D;
// //           color: #A0AEC0;
// //         }
// //         .status-return-refunded {
// //           background-color: #48BB783D;
// //           color: #48BB78;
// //         }
// //         .status-return-rejected {
// //           background-color: #F565653D;
// //           color: #F56565;
// //         }
// //         .status-return-cancelled {
// //           background-color: #A0AEC03D;
// //           color: #A0AEC0;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }

// // app/account/returns/[id]/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   Package,
//   Truck,
//   CheckCircle,
//   Clock,
//   PackageCheck,
//   XCircle,
//   ChevronRight,
//   DollarSign,
//   RefreshCw,
//   AlertCircle
// } from "lucide-react";
// import { GrMoney } from "react-icons/gr";
// import Image from "next/image";
// import Link from "next/link";
// import { IoCopyOutline } from "react-icons/io5";
// import { FaLocationDot } from "react-icons/fa6";
// import toast from "react-hot-toast";

// // ========== تعريف الأنواع ==========
// interface ReturnProductItem {
//   id: number;
//   product: {
//     id: number;
//     name: string;
//     images: string[];
//     pricing?: {
//       final_price: number;
//     };
//   };
//   title: string;
//   variant_id: number | null;
//   quantity: number;
//   unit_price: number;
//   discount_amount: number;
//   total_price: number;
//   images: string[];
//   variant?: {
//     id: number;
//     sku: string | null;
//     price: number;
//     has_discount: boolean;
//     discount_type: string | null;
//     discount_value: string | null;
//     price_after_discount: number;
//     quantity: number;
//     is_active: boolean;
//     variant_image: string;
//     attributes: Array<{
//       id: number;
//       attribute_type: {
//         id: number;
//         name: string;
//       };
//       value: string;
//       meta: {
//         color?: string;
//       } | null;
//     }>;
//   };
// }

// interface AdditionalData {
//   name?: string;
//   phone?: string;
//   email?: string;
// }

// interface ReturnOrder {
//   id: number;
//   order_number: string;
//   status: string;
//   status_label: string;
//   payment_method: string;
//   payment_status: string;
//   delivery_method: string;
//   subtotal: number;
//   coupon_discount_amount: number;
//   total_discount_amount: number;
//   subtotal_after_discount: number;
//   shipping_amount: number;
//   tax_amount: number;
//   total_amount: number;
//   notes: string | null;
//   additional_data?: AdditionalData | null;
//   items: ReturnProductItem[];
//   created_at: string;
// }

// interface ReturnDetails {
//   id: number;
//   returnNumber: string;
//   status: "pending" | "approved" | "picked_up" | "inspected" | "refunded" | "rejected" | "cancelled";
//   status_label: string;
//   refund_method: string;
//   notes: string | null;
//   order: ReturnOrder;
//   created_at: string;
// }

// // ========== إعدادات API ==========
// const API_URL = 'https://admin.souqkaber.com/api';

// const getToken = (): string | null => {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('auth_token');
//   }
//   return null;
// };

// const getHeaders = (): HeadersInit => {
//   const token = getToken();
//   return {
//     'Content-Type': 'application/json',
//     ...(token && { 'Authorization': `Bearer ${token}` }),
//   };
// };

// // صورة ثابتة للمنتجات التي لا تحتوي على صورة
// const PLACEHOLDER_IMAGE = "/images/placeholder-product.jpg";

// // ========== دالة جلب تفاصيل المرتجع ==========
// const fetchReturnDetails = async (returnId: string): Promise<ReturnDetails | null> => {
//   try {
//     const response = await fetch(`${API_URL}/returns/${returnId}`, {
//       method: 'GET',
//       headers: getHeaders(),
//     });
    
//     if (response.status === 401) {
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem('auth_token');
//         localStorage.removeItem('user_data');
//       }
//       throw new Error('UNAUTHORIZED');
//     }
    
//     const data = await response.json();
    
//     if (data.result === true && data.data) {
//       return transformReturnDetails(data.data);
//     }
//     return null;
//   } catch (error) {
//     console.error("❌ Error fetching return details:", error);
    
//     if (error instanceof Error && error.message === 'UNAUTHORIZED') {
//       toast.error("جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى", {
//         duration: 3000,
//         position: "top-center",
//       });
//       if (typeof window !== 'undefined') {
//         window.location.href = '/auth/login';
//       }
//       return null;
//     }
    
//     toast.error("حدث خطأ في جلب تفاصيل المرتجع");
//     return null;
//   }
// };

// // ========== تحويل بيانات المرتجع ==========
// const transformReturnDetails = (apiReturn: any): ReturnDetails => {
//   return {
//     id: apiReturn.id,
//     returnNumber: `#R${String(apiReturn.id).padStart(5, '0')}`,
//     status: apiReturn.status,
//     status_label: apiReturn.status_label,
//     refund_method: apiReturn.refund_method,
//     notes: apiReturn.notes,
//     order: {
//       id: apiReturn.order.id,
//       order_number: apiReturn.order.order_number,
//       status: apiReturn.order.status,
//       status_label: apiReturn.order.status_label,
//       payment_method: apiReturn.order.payment_method,
//       payment_status: apiReturn.order.payment_status,
//       delivery_method: apiReturn.order.delivery_method,
//       subtotal: apiReturn.order.subtotal,
//       coupon_discount_amount: apiReturn.order.coupon_discount_amount,
//       total_discount_amount: apiReturn.order.total_discount_amount,
//       subtotal_after_discount: apiReturn.order.subtotal_after_discount,
//       shipping_amount: apiReturn.order.shipping_amount,
//       tax_amount: apiReturn.order.tax_amount,
//       total_amount: apiReturn.order.total_amount,
//       notes: apiReturn.order.notes,
//       additional_data: apiReturn.order.additional_data,
//       items: apiReturn.order.items || [],
//       created_at: apiReturn.order.created_at,
//     },
//     created_at: apiReturn.created_at,
//   };
// };

// // ========== تنسيق التاريخ ==========
// const formatDate = (dateString: string): string => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString("ar-EG", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
// };

// // ========== تنظيف رابط الصورة ==========
// const cleanImageUrl = (url: string): string => {
//   if (!url) return PLACEHOLDER_IMAGE;
//   if (url.startsWith("/storage")) {
//     return `https://admin.souqkaber.com${url}`;
//   }
//   return url;
// };

// // ========== ترجمة طريقة استرداد المبلغ ==========
// const translateRefundMethod = (method: string): string => {
//   const methodMap: Record<string, string> = {
//     "wallet": "محفظة التطبيق",
//     "bank": "تحويل بنكي",
//     "card": "بطاقة الدفع",
//   };
//   return methodMap[method] || method;
// };

// // ========== الحصول على اسم المستخدم ==========
// const getUserName = (order: ReturnOrder): string => {
//   if (order.additional_data?.name) {
//     return order.additional_data.name;
//   }
//   return "غير متوفر";
// };

// // ========== دوال استخراج الخصائص (تم التعديل) ==========

// // جلب الذاكرة
// const getMemory = (item: ReturnProductItem): string | null => {
//   if (!item.variant?.attributes) return null;
//   const memoryAttr = item.variant.attributes.find(
//     (attr) =>attr.attribute_type.name === "الذاكرة" || attr.attribute_type.name === "RAM"
//   );
//   return memoryAttr?.value || null;
// };

// // جلب الهارد ديسك
// const getStorage = (item: ReturnProductItem): string | null => {
//   if (!item.variant?.attributes) return null;
//   const storageAttr = item.variant.attributes.find(
//     (attr) => attr.attribute_type.name === "هارد ديسك" || 
//       attr.attribute_type.name === "Hard disk"
//   );
//   return storageAttr?.value || null;
// };

// // جلب اللون
// const getColor = (item: ReturnProductItem): { name: string; hex: string | null } | null => {
//   if (!item.variant?.attributes) return null;
//   const colorAttr = item.variant.attributes.find(
//     (attr) => attr.attribute_type.name === "لون" || 
//       attr.attribute_type.name === "color"
//   );
//   if (!colorAttr) return null;
  
//   return {
//     name: colorAttr.value,
//     hex: colorAttr.meta?.color || null,
//   };
// };

// // ========== حالة المرتجع مع التنسيق ==========
// const returnStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
//   pending: { label: "قيد المراجعة", color: "status-return-pending", icon: Clock },
//   approved: { label: "تم الموافقة", color: "status-return-approved", icon: CheckCircle },
//   picked_up: { label: "تم الاستلام", color: "status-return-picked", icon: Truck },
//   inspected: { label: "قيد الفحص", color: "status-return-inspected", icon: PackageCheck },
//   refunded: { label: "تم الاسترداد", color: "status-return-refunded", icon: DollarSign },
//   rejected: { label: "مرفوض", color: "status-return-rejected", icon: XCircle },
//   cancelled: { label: "ملغي", color: "status-return-cancelled", icon: AlertCircle }
// };

// export default function ReturnDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const returnId = params.id as string;
  
//   const [returnData, setReturnData] = useState<ReturnDetails | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [returnNotes, setReturnNotes] = useState("");
//   const [copied, setCopied] = useState(false);

//   useEffect(() => {
//     const token = getToken();
//     if (!token) {
//       toast.error("يرجى تسجيل الدخول أولاً", {
//         duration: 3000,
//         position: "top-center",
//       });
//       router.push('/auth/login');
//       return;
//     }
    
//     const loadReturnDetails = async () => {
//       setLoading(true);
//       const data = await fetchReturnDetails(returnId);
//       setReturnData(data);
//       if (data?.notes) {
//         setReturnNotes(data.notes);
//       }
//       setLoading(false);
//     };
    
//     if (returnId) {
//       loadReturnDetails();
//     }
//   }, [returnId, router]);

//   const copyReturnNumber = () => {
//     if (returnData) {
//       navigator.clipboard.writeText(returnData.returnNumber);
//       setCopied(true);
//       toast.success("تم نسخ رقم المرتجع", {
//         duration: 2000,
//         position: "top-center",
//       });
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const copyOrderNumber = () => {
//     if (returnData) {
//       navigator.clipboard.writeText(returnData.order.order_number);
//       toast.success("تم نسخ رقم الطلب", {
//         duration: 2000,
//         position: "top-center",
//       });
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
//         <div className="container mx-auto px-4 py-8 text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23A6F0] mx-auto"></div>
//           <p className="text-gray-500 mt-4">جاري تحميل تفاصيل المرتجع...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!returnData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
//         <div className="container mx-auto px-4 py-8 text-center">
//           <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <h2 className="text-xl font-bold text-gray-800 mb-2">المرتجع غير موجود</h2>
//           <p className="text-gray-500 mb-4">عذراً، لا يمكننا العثور على هذا المرتجع</p>
//           <Link href="/account/returns" className="inline-block bg-[#23A6F0] text-white px-6 py-2 rounded-[8px] hover:bg-[#36abf0] transition">
//             العودة إلى المرتجعات
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const status = returnStatusConfig[returnData.status] || returnStatusConfig.pending;
//   const StatusIcon = status.icon;
//   const totalRefund = returnData.order?.total_amount || 0;
//   const itemsCount = returnData.order?.items?.length || 0;
//   const userName = getUserName(returnData.order);

//   return (
//     <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
//       <div className="container mx-auto mb-3 px-4 md:px-8">
//         {/* Breadcrumb */}
//         <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
//           <Link href="/account" className="hover:text-[#23A6F0] transition">حسابي</Link>
//           <ChevronRight className="w-4 h-4" />
//           <Link href="/account/returns" className="hover:text-[#23A6F0] transition">المرتجعات</Link>
//           <ChevronRight className="w-4 h-4" />
//           <span className="text-[#23A6F0] font-medium">تفاصيل المرتجع</span>
//         </div>
        
//         <h1 className="text-[20px] font-bold mb-2 md:text-xl text-[#180100] md:mb-4">تفاصيل المرتجع</h1>
        
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* العمود الأيمن */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* معلومات المرتجع الأساسية */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//               <div className="flex flex-col gap-3">
//                 <div className="flex justify-between items-start">
//                   <div className="flex flex-wrap items-center gap-2 sm:gap-4">
//                     <div className="flex gap-2 sm:gap-4 items-center text-base sm:text-[20px] font-bold text-[#180100]">
//                       <h1 className="text-sm sm:text-base">رقم المرتجع</h1>
//                       <div className="flex gap-1 sm:gap-2 items-center">
//                         <p className="font-bold text-gray-800 text-sm sm:text-base">
//                           {returnData.returnNumber}
//                         </p>
//                         <IoCopyOutline 
//                           className={`w-4 h-4 sm:w-5 sm:h-5 cursor-pointer transition ${copied ? 'text-green-500' : 'hover:text-[#23A6F0]'}`}
//                           onClick={copyReturnNumber}
//                         />
//                       </div>
//                     </div>
//                     <div className="flex gap-2 sm:gap-4 items-center text-sm sm:text-base text-gray-500">
//                       <span className="hidden sm:inline">|</span>
//                       <h1 className="text-xs sm:text-sm">الطلب</h1>
//                       <div className="flex gap-1 sm:gap-2 items-center">
//                         <p className="text-gray-600 text-xs sm:text-sm">{returnData.order.order_number}</p>
//                         <IoCopyOutline 
//                           className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-[#23A6F0] transition"
//                           onClick={copyOrderNumber}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                   <div className={`px-2 sm:px-3 py-1 rounded-full sm:text-sm text-[10px] font-medium flex items-center gap-1 sm:gap-1.5 ${status.color}`}>
//                     <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
//                     {status.label}
//                   </div>
//                 </div>
//                 <p className="text-sm sm:text-[18px] text-[#333333]">{formatDate(returnData.created_at)}</p>
//               </div>
//             </div>
            
//             <br />
            
//             {/* المنتجات مع المقاس واللون */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//               <h2 className="text-lg font-bold text-gray-800 mb-4">المنتجات ({itemsCount})</h2>
//               <div className="space-y-4">
//                 {returnData.order.items.map((item, idx) => {
//                   // ✅ استخدام صورة المتغير أولاً إذا كانت موجودة
//                   const variantImage = item.variant?.variant_image 
//                     ? cleanImageUrl(item.variant.variant_image) 
//                     : null;
                  
//                   const productImage = item.images && item.images.length > 0 
//                     ? cleanImageUrl(item.images[0]) 
//                     : PLACEHOLDER_IMAGE;

//                   // ✅ اختيار الصورة المناسبة (أولوية لصورة المتغير)
//                   const displayImage = variantImage || productImage;
                  
//                   // ========== استخدام الدوال الجديدة ==========
//                   const memory = getMemory(item);
//                   const storage = getStorage(item);
//                   const color = getColor(item);
                  
//                   return (
//                     <div key={idx} className="flex flex-col md:flex-row items-center gap-4 border border-gray-200 rounded-[8px] p-3">
//                       <div className="w-20 h-20 bg-gray-100  rounded-[8px]  overflow-hidden flex-shrink-0 relative">
//                         <Image
//                           src={displayImage}
//                           alt={item.title}
//                           width={80}
//                           height={80}
//                           className="object-cover w-full h-full"
//                           onError={(e) => {
//                             (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
//                           }}
//                         />
//                         {/* ✅ إشارة صغيرة توضح أن هذه صورة المتغير */}
//                         {/* {variantImage && (
//                           <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded-tl-md">
//                             المتغير
//                           </span>
//                         )} */}
//                       </div>
//                       <div className="flex-1 md:text-right text-center">
//                         <div className="flex flex-col md:flex-row gap-3 md:justify-between items-center md:items-start">
//                           <div>
//                             <p className="font-bold text-gray-800">{item.title}</p>
                            
//                             {/* ========== عرض جميع الخصائص ========== */}
//                             <div className="flex flex-wrap gap-2 mt-1.5">
//                               {/* عرض الذاكرة */}
//                               {memory && (
//                                 <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
//                                   <span className="font-medium">الذاكرة:</span>
//                                   <span>{memory}</span>
//                                 </span>
//                               )}
                              
//                               {/* عرض الهارد ديسك */}
//                               {storage && (
//                                 <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
//                                   <span className="font-medium">هارد ديسك:</span>
//                                   <span>{storage}</span>
//                                 </span>
//                               )}
                              
//                               {/* عرض اللون */}
//                               {color && (
//                                 <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
//                                   <span className="font-medium">اللون:</span>
//                                   <span>{color.name}</span>
//                                   {color.hex && (
//                                     <span 
//                                       className="w-3 h-3 rounded-full border border-gray-300 inline-block"
//                                       style={{ backgroundColor: color.hex }}
//                                     />
//                                   )}
//                                 </span>
//                               )}
//                             </div>
                            
//                             <div className="flex gap-1 md:gap-3 mt-2 text-xs text-black font-bold">
//                               <span>الكمية: <span className="text-gray-500">x{item.quantity}</span></span>
//                               <span>السعر: <span className="text-gray-500">EGP {item.unit_price.toFixed(2)}</span></span>
//                             </div>
//                           </div>
//                           <div className="text-left">
//                             <p className="font-bold text-[#23A6F0]">EGP {item.total_price.toFixed(2)}</p>
//                             {item.discount_amount > 0 && (
//                               <p className="text-xs text-gray-400">الخصم: {item.discount_amount.toFixed(2)}</p>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
            
//             <br />
            
//             {/* ملخص المرتجع */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-4">ملخص المرتجع</h2>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">المبلغ الإجمالي للطلب</span>
//                   <span className="font-bold text-gray-800">EGP {returnData.order.subtotal.toFixed(2)}</span>
//                 </div>
//                 {returnData.order.coupon_discount_amount > 0 && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">خصم الكوبون</span>
//                     <span className="font-bold text-[#23A6F0]">-EGP {returnData.order.coupon_discount_amount.toFixed(2)}</span>
//                   </div>
//                 )}
//                 {returnData.order.total_discount_amount > 0 && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">الخصم الكلي</span>
//                     <span className="font-bold text-[#23A6F0]">-EGP {returnData.order.total_discount_amount.toFixed(2)}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">رسوم التوصيل</span>
//                   <span className="font-bold text-gray-800">EGP {returnData.order.shipping_amount.toFixed(2)}</span>
//                 </div>
//                 {returnData.order.tax_amount > 0 && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">الضرائب</span>
//                     <span className="font-bold text-gray-800">EGP {returnData.order.tax_amount.toFixed(2)}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
//                   <span className="text-lg font-bold text-gray-800">المبلغ المسترد</span>
//                   <span className="text-xl font-bold text-[#23A6F0]">EGP {totalRefund.toFixed(2)}</span>
//                 </div>
//                 {returnData.refund_method && returnData.status === "refunded" && (
//                   <div className="flex justify-end">
//                     <p className="text-xs text-gray-500">
//                       تم الاسترداد عبر: {translateRefundMethod(returnData.refund_method)}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* العمود الأيسر */}
//           <div className="space-y-6">
//             {/* معلومات الاتصال */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//               <h2 className="text-base font-bold text-gray-800 mb-4">معلومات الاتصال</h2>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-bold">الاسم الكامل</span>
//                   <span className="font-medium text-gray-600">{userName}</span>
//                 </div>
//                 {returnData.order.additional_data?.phone && (
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="font-bold">رقم الهاتف</span>
//                     <span className="font-medium text-gray-600" dir="ltr">{returnData.order.additional_data.phone}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             <br />
            
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//               <h2 className="text-base font-bold mb-4">طريقة الاستلام</h2>
//               <span className="font-medium text-gray-800">
//                 {returnData.order.delivery_method === "pickup" ? "استلام من الفرع" : "توصيل"}
//               </span>
//             </div>
            
//             <br />
            
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//               <h2 className="text-base font-bold mb-4">طريقة الدفع</h2>
//               <div className="flex items-center gap-3 p-2 border border-gray-300  rounded-[8px] ">
//                 <div className="w-10 h-10 bg-white rounded-[8px] flex items-center justify-center shadow-sm">
//                   <GrMoney />
//                 </div>
//                 <div>
//                   <p className="text-gray-500">{returnData.order.payment_method}</p>
//                   <p className="text-xs text-gray-400">{returnData.order.payment_status}</p>
//                 </div>
//               </div>
//             </div>
            
//             <br />
            
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//               <h2 className="text-base font-bold text-gray-800 mb-4">ملاحظات المرتجع</h2>
//               <textarea
//                 value={returnNotes || "لا توجد ملاحظات"}
//                 onChange={(e) => setReturnNotes(e.target.value)}
//                 className="w-full p-3 border border-gray-200  rounded-[8px]  focus:outline-none focus:border-[#23A6F0] resize-none bg-gray-50"
//                 rows={3}
//                 readOnly
//               />
//             </div>

//             {/* <div className="flex gap-3 mt-3 md:mt-6">
//               <Link 
//                 href={`/account/orders/${returnData.order.id}`}
//                 className="flex-1 border-2 border-[#000000] text-[#000000] py-3  rounded-[8px]  font-medium hover:bg-gray-50 transition text-center"
//               >
//                 عرض الطلب
//               </Link>
//             </div> */}
//           </div>
//         </div>
//       </div>

//       <style jsx global>{`
//         .status-return-pending {
//           background-color: #A0AEC03D;
//           color: #A0AEC0;
//         }
//         .status-return-approved {
//           background-color: #48BB783D;
//           color: #48BB78;
//         }
//         .status-return-picked {
//           background-color: #4299E13D;
//           color: #4299E1;
//         }
//         .status-return-inspected {
//           background-color: #A0AEC03D;
//           color: #A0AEC0;
//         }
//         .status-return-refunded {
//           background-color: #48BB783D;
//           color: #48BB78;
//         }
//         .status-return-rejected {
//           background-color: #F565653D;
//           color: #F56565;
//         }
//         .status-return-cancelled {
//           background-color: #A0AEC03D;
//           color: #A0AEC0;
//         }
//       `}</style>
//     </div>
//   );
// }



// app/account/returns/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  PackageCheck,
  XCircle,
  ChevronRight,
  DollarSign,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { GrMoney } from "react-icons/gr";
import Image from "next/image";
import Link from "next/link";
import { IoCopyOutline } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

// ========== تعريف الأنواع ==========
interface ReturnProductItem {
  id: number;
  product: {
    id: number;
    name: string;
    images: string[];
    pricing?: {
      final_price: number;
    };
  };
  title: string;
  variant_id: number | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  images: string[];
  variant?: {
    id: number;
    sku: string | null;
    price: number;
    has_discount: boolean;
    discount_type: string | null;
    discount_value: string | null;
    price_after_discount: number;
    quantity: number;
    is_active: boolean;
    variant_image: string;
    attributes: Array<{
      id: number;
      attribute_type: {
        id: number;
        name: string;
      };
      value: string;
      meta: {
        color?: string;
      } | null;
    }>;
  };
}

interface AdditionalData {
  name?: string;
  phone?: string;
  email?: string;
}

interface ReturnOrder {
  id: number;
  order_number: string;
  status: string;
  status_label: string;
  payment_method: string;
  payment_status: string;
  delivery_method: string;
  subtotal: number;
  coupon_discount_amount: number;
  total_discount_amount: number;
  subtotal_after_discount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  additional_data?: AdditionalData | null;
  items: ReturnProductItem[];
  created_at: string;
}

interface ReturnDetails {
  id: number;
  returnNumber: string;
  status: "pending" | "approved" | "picked_up" | "inspected" | "refunded" | "rejected" | "cancelled";
  status_label: string;
  refund_method: string;
  notes: string | null;
  order: ReturnOrder;
  created_at: string;
}

// ========== إعدادات API ==========
const API_URL = 'https://admin.souqkaber.com/api';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const getHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// صورة ثابتة للمنتجات التي لا تحتوي على صورة
const PLACEHOLDER_IMAGE = "/images/placeholder-product.jpg";

// ========== الحصول على إعدادات حالة المرتجع مع الترجمة ==========
const getReturnStatusConfig = (t: any) => ({
  pending: { label: t('returnDetails.statusPending'), color: "status-return-pending", icon: Clock },
  approved: { label: t('returnDetails.statusApproved'), color: "status-return-approved", icon: CheckCircle },
  picked_up: { label: t('returnDetails.statusPickedUp'), color: "status-return-picked", icon: Truck },
  inspected: { label: t('returnDetails.statusInspected'), color: "status-return-inspected", icon: PackageCheck },
  refunded: { label: t('returnDetails.statusRefunded'), color: "status-return-refunded", icon: DollarSign },
  rejected: { label: t('returnDetails.statusRejected'), color: "status-return-rejected", icon: XCircle },
  cancelled: { label: t('returnDetails.statusCancelled'), color: "status-return-cancelled", icon: AlertCircle }
});

// ========== دالة جلب تفاصيل المرتجع ==========
const fetchReturnDetails = async (returnId: string, t: any): Promise<ReturnDetails | null> => {
  try {
    const response = await fetch(`${API_URL}/returns/${returnId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
      throw new Error('UNAUTHORIZED');
    }
    
    const data = await response.json();
    
    if (data.result === true && data.data) {
      return transformReturnDetails(data.data, t);
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching return details:", error);
    
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      toast.error(t('returnDetails.invalidSession'), {
        duration: 3000,
        position: "top-center",
      });
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }
    
    toast.error(t('returnDetails.fetchError'));
    return null;
  }
};

// ========== تحويل بيانات المرتجع ==========
const transformReturnDetails = (apiReturn: any, t: any): ReturnDetails => {
  return {
    id: apiReturn.id,
    returnNumber: `#R${String(apiReturn.id).padStart(5, '0')}`,
    status: apiReturn.status,
    status_label: apiReturn.status_label,
    refund_method: apiReturn.refund_method,
    notes: apiReturn.notes,
    order: {
      id: apiReturn.order.id,
      order_number: apiReturn.order.order_number,
      status: apiReturn.order.status,
      status_label: apiReturn.order.status_label,
      payment_method: apiReturn.order.payment_method,
      payment_status: apiReturn.order.payment_status,
      delivery_method: apiReturn.order.delivery_method,
      subtotal: apiReturn.order.subtotal,
      coupon_discount_amount: apiReturn.order.coupon_discount_amount,
      total_discount_amount: apiReturn.order.total_discount_amount,
      subtotal_after_discount: apiReturn.order.subtotal_after_discount,
      shipping_amount: apiReturn.order.shipping_amount,
      tax_amount: apiReturn.order.tax_amount,
      total_amount: apiReturn.order.total_amount,
      notes: apiReturn.order.notes,
      additional_data: apiReturn.order.additional_data,
      items: apiReturn.order.items || [],
      created_at: apiReturn.order.created_at,
    },
    created_at: apiReturn.created_at,
  };
};

// ========== تنسيق التاريخ ==========
const formatDate = (dateString: string, t: any): string => {
  const date = new Date(dateString);
  const locale = t('common.lang') === 'en' ? 'en-US' : 'ar-EG';
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ========== تنظيف رابط الصورة ==========
const cleanImageUrl = (url: string): string => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith("/storage")) {
    return `https://admin.souqkaber.com${url}`;
  }
  return url;
};

// ========== ترجمة طريقة استرداد المبلغ ==========
const translateRefundMethod = (method: string, t: any): string => {
  const methodMap: Record<string, string> = {
    "wallet": t('returnDetails.wallet'),
    "bank": t('returnDetails.bank'),
    "card": t('returnDetails.card'),
  };
  return methodMap[method] || method;
};

// ========== الحصول على اسم المستخدم ==========
const getUserName = (order: ReturnOrder, t: any): string => {
  if (order.additional_data?.name) {
    return order.additional_data.name;
  }
  return t('returnDetails.unavailable');
};

// ========== دوال استخراج الخصائص ==========

// جلب الذاكرة
const getMemory = (item: ReturnProductItem): string | null => {
  if (!item.variant?.attributes) return null;
  const memoryAttr = item.variant.attributes.find(
    (attr) => attr.attribute_type.name === "الذاكرة" || attr.attribute_type.name === "RAM"
  );
  return memoryAttr?.value || null;
};

// جلب الهارد ديسك
const getStorage = (item: ReturnProductItem): string | null => {
  if (!item.variant?.attributes) return null;
  const storageAttr = item.variant.attributes.find(
    (attr) => attr.attribute_type.name === "هارد ديسك" || 
      attr.attribute_type.name === "Hard disk"
  );
  return storageAttr?.value || null;
};

// جلب اللون
const getColor = (item: ReturnProductItem): { name: string; hex: string | null } | null => {
  if (!item.variant?.attributes) return null;
  const colorAttr = item.variant.attributes.find(
    (attr) => attr.attribute_type.name === "لون" || 
      attr.attribute_type.name === "color"
  );
  if (!colorAttr) return null;
  
  return {
    name: colorAttr.value,
    hex: colorAttr.meta?.color || null,
  };
};

export default function ReturnDetailsPage() {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة
  const params = useParams();
  const router = useRouter();
  const returnId = params.id as string;
  
  const [returnData, setReturnData] = useState<ReturnDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [returnNotes, setReturnNotes] = useState("");
  const [copied, setCopied] = useState(false);

  // ✅ الحصول على إعدادات الحالة مع الترجمة
  const returnStatusConfig = getReturnStatusConfig(t);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      toast.error(t('returnDetails.loginRequired'), {
        duration: 3000,
        position: "top-center",
      });
      router.push('/auth/login');
      return;
    }
    
    const loadReturnDetails = async () => {
      setLoading(true);
      const data = await fetchReturnDetails(returnId, t);
      setReturnData(data);
      if (data?.notes) {
        setReturnNotes(data.notes);
      }
      setLoading(false);
    };
    
    if (returnId) {
      loadReturnDetails();
    }
  }, [returnId, router, t]);

  const copyReturnNumber = () => {
    if (returnData) {
      navigator.clipboard.writeText(returnData.returnNumber);
      setCopied(true);
      toast.success(t('returnDetails.copiedReturn'), {
        duration: 2000,
        position: "top-center",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyOrderNumber = () => {
    if (returnData) {
      navigator.clipboard.writeText(returnData.order.order_number);
      toast.success(t('returnDetails.copiedOrder'), {
        duration: 2000,
        position: "top-center",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23A6F0] mx-auto"></div>
          <p className="text-gray-500 mt-4">{t('returnDetails.loading')}</p>
        </div>
      </div>
    );
  }

  if (!returnData) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
        <div className="container mx-auto px-4 py-8 text-center">
          <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('returnDetails.notFound')}</h2>
          <p className="text-gray-500 mb-4">{t('returnDetails.notFoundMessage')}</p>
          <Link href="/account/returns" className="inline-block bg-[#23A6F0] text-white px-6 py-2 rounded-[8px] hover:bg-[#36abf0] transition">
            {t('returnDetails.backToReturns')}
          </Link>
        </div>
      </div>
    );
  }

  const status = returnStatusConfig[returnData.status] || returnStatusConfig.pending;
  const StatusIcon = status.icon;
  const totalRefund = returnData.order?.total_amount || 0;
  const itemsCount = returnData.order?.items?.length || 0;
  const userName = getUserName(returnData.order, t);

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#bdcbf12a] to-[#feecea3b] page-with-padding">
      <div className="container mx-auto mb-3 px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/account" className="hover:text-[#23A6F0] transition">{t('returnDetails.myAccount')}</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/account/returns" className="hover:text-[#23A6F0] transition">{t('returnDetails.myReturns')}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#23A6F0] font-medium">{t('returnDetails.returnDetails')}</span>
        </div>
        
        <h1 className="text-[20px] font-bold mb-2 md:text-xl text-[#180100] md:mb-4">{t('returnDetails.returnDetails')}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* العمود الأيمن */}
          <div className="lg:col-span-2 space-y-6">
            {/* معلومات المرتجع الأساسية */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex gap-2 sm:gap-4 items-center text-base sm:text-[20px] font-bold text-[#180100]">
                      <h1 className="text-sm sm:text-base">{t('returnDetails.returnNumber')}</h1>
                      <div className="flex gap-1 sm:gap-2 items-center">
                        <p className="font-bold text-gray-800 text-sm sm:text-base">
                          {returnData.returnNumber}
                        </p>
                        <IoCopyOutline 
                          className={`w-4 h-4 sm:w-5 sm:h-5 cursor-pointer transition ${copied ? 'text-green-500' : 'hover:text-[#23A6F0]'}`}
                          onClick={copyReturnNumber}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 sm:gap-4 items-center text-sm sm:text-base text-gray-500">
                      <span className="hidden sm:inline">|</span>
                      <h1 className="text-xs sm:text-sm">{t('returnDetails.order')}</h1>
                      <div className="flex gap-1 sm:gap-2 items-center">
                        <p className="text-gray-600 text-xs sm:text-sm">{returnData.order.order_number}</p>
                        <IoCopyOutline 
                          className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-[#23A6F0] transition"
                          onClick={copyOrderNumber}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 sm:px-3 py-1 rounded-full sm:text-sm text-[10px] font-medium flex items-center gap-1 sm:gap-1.5 ${status.color}`}>
                    <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {status.label}
                  </div>
                </div>
                <p className="text-sm sm:text-[18px] text-[#333333]">{formatDate(returnData.created_at, t)}</p>
              </div>
            </div>
            
            <br />
            
            {/* المنتجات */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t('returnDetails.products')} ({itemsCount})</h2>
              <div className="space-y-4">
                {returnData.order.items.map((item, idx) => {
                  const variantImage = item.variant?.variant_image 
                    ? cleanImageUrl(item.variant.variant_image) 
                    : null;
                  
                  const productImage = item.images && item.images.length > 0 
                    ? cleanImageUrl(item.images[0]) 
                    : PLACEHOLDER_IMAGE;

                  const displayImage = variantImage || productImage;
                  
                  const memory = getMemory(item);
                  const storage = getStorage(item);
                  const color = getColor(item);
                  
                  return (
                    <div key={idx} className="flex flex-col md:flex-row items-center gap-4 border border-gray-200 rounded-[8px] p-3">
                      <div className="w-20 h-20 bg-gray-100 rounded-[8px] overflow-hidden flex-shrink-0 relative">
                        <Image
                          src={displayImage}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>
                      <div className="flex-1 md:text-right text-center">
                        <div className="flex flex-col md:flex-row gap-3 md:justify-between items-center md:items-start">
                          <div>
                            <p className="font-bold text-gray-800">{item.title}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {memory && (
                                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                                  <span className="font-medium">{t('returnDetails.memory')}:</span>
                                  <span>{memory}</span>
                                </span>
                              )}
                              
                              {storage && (
                                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                                  <span className="font-medium">{t('returnDetails.storage')}:</span>
                                  <span>{storage}</span>
                                </span>
                              )}
                              
                              {color && (
                                <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                                  <span className="font-medium">{t('returnDetails.color')}:</span>
                                  <span>{color.name}</span>
                                  {color.hex && (
                                    <span 
                                      className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                                      style={{ backgroundColor: color.hex }}
                                    />
                                  )}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex gap-1 md:gap-3 mt-2 text-xs text-black font-bold">
                              <span>{t('returnDetails.quantity')}: <span className="text-gray-500">x{item.quantity}</span></span>
                              <span>{t('returnDetails.price')}: <span className="text-gray-500">{t('returnDetails.currency')} {item.unit_price.toFixed(2)}</span></span>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-[#23A6F0]">{t('returnDetails.currency')} {item.total_price.toFixed(2)}</p>
                            {item.discount_amount > 0 && (
                              <p className="text-xs text-gray-400">{t('returnDetails.discount')}: {item.discount_amount.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <br />
            
            {/* ملخص المرتجع */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('returnDetails.returnSummary')}</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('returnDetails.orderSubtotal')}</span>
                  <span className="font-bold text-gray-800">{t('returnDetails.currency')} {returnData.order.subtotal.toFixed(2)}</span>
                </div>
                {returnData.order.coupon_discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('returnDetails.couponDiscount')}</span>
                    <span className="font-bold text-[#23A6F0]">-{t('returnDetails.currency')} {returnData.order.coupon_discount_amount.toFixed(2)}</span>
                  </div>
                )}
                {returnData.order.total_discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('returnDetails.totalDiscount')}</span>
                    <span className="font-bold text-[#23A6F0]">-{t('returnDetails.currency')} {returnData.order.total_discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('returnDetails.deliveryFee')}</span>
                  <span className="font-bold text-gray-800">{t('returnDetails.currency')} {returnData.order.shipping_amount.toFixed(2)}</span>
                </div>
                {returnData.order.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('returnDetails.tax')}</span>
                    <span className="font-bold text-gray-800">{t('returnDetails.currency')} {returnData.order.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
                  <span className="text-lg font-bold text-gray-800">{t('returnDetails.refundAmount')}</span>
                  <span className="text-xl font-bold text-[#23A6F0]">{t('returnDetails.currency')} {totalRefund.toFixed(2)}</span>
                </div>
                {returnData.refund_method && returnData.status === "refunded" && (
                  <div className="flex justify-end">
                    <p className="text-xs text-gray-500">
                      {t('returnDetails.refundedVia')}: {translateRefundMethod(returnData.refund_method, t)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* العمود الأيسر */}
          <div className="space-y-6">
            {/* معلومات الاتصال */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">{t('returnDetails.contactInfo')}</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold">{t('returnDetails.fullName')}</span>
                  <span className="font-medium text-gray-600">{userName}</span>
                </div>
                {returnData.order.additional_data?.phone && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold">{t('returnDetails.phone')}</span>
                    <span className="font-medium text-gray-600" dir="ltr">{returnData.order.additional_data.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <br />
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold mb-4">{t('returnDetails.deliveryMethod')}</h2>
              <span className="font-medium text-gray-800">
                {returnData.order.delivery_method === "pickup" ? t('returnDetails.pickup') : t('returnDetails.delivery')}
              </span>
            </div>
            
            <br />
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold mb-4">{t('returnDetails.paymentMethod')}</h2>
              <div className="flex items-center gap-3 p-2 border border-gray-300 rounded-[8px]">
                <div className="w-10 h-10 bg-white rounded-[8px] flex items-center justify-center shadow-sm">
                  <GrMoney />
                </div>
                <div>
                  <p className="text-gray-500">{returnData.order.payment_method}</p>
                  <p className="text-xs text-gray-400">{returnData.order.payment_status}</p>
                </div>
              </div>
            </div>
            
            <br />
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">{t('returnDetails.returnNotes')}</h2>
              <textarea
                value={returnNotes || t('returnDetails.noNotes')}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-[8px] focus:outline-none focus:border-[#23A6F0] resize-none bg-gray-50"
                rows={3}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .status-return-pending {
          background-color: #A0AEC03D;
          color: #A0AEC0;
        }
        .status-return-approved {
          background-color: #48BB783D;
          color: #48BB78;
        }
        .status-return-picked {
          background-color: #4299E13D;
          color: #4299E1;
        }
        .status-return-inspected {
          background-color: #A0AEC03D;
          color: #A0AEC0;
        }
        .status-return-refunded {
          background-color: #48BB783D;
          color: #48BB78;
        }
        .status-return-rejected {
          background-color: #F565653D;
          color: #F56565;
        }
        .status-return-cancelled {
          background-color: #A0AEC03D;
          color: #A0AEC0;
        }
      `}</style>
    </div>
  );
}