// app/terms/page.tsx
"use client";

import Link from "next/link";
import { ChevronRight, Home, ShoppingBag, Phone, Mail, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function TermsPage() {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة

  return (
    <div className="bg-gradient-to-l min-h-screen from-[#bdcbf12a] to-[#feecea3b]">
      <div className="container mx-auto px-4 py-6 md:py-8">
        
        {/* Breadcrumbs */}
        <div className="mb-3 md:mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#23A6F0] transition flex items-center gap-1">
              <Home className="w-4 h-4" />
              {t('common.home')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#23A6F0] font-medium">{t('terms.title')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {/* Header */}
              <div className="text-center mb-3 md:mb-8 pb-4 border-b border-gray-100">
                <h1 className="text-xl md:text-xl font-bold text-gray-800 mb-3">{t('terms.title')}</h1>
                <p className="text-gray-500 text-sm">
                  {t('terms.intro')} <span className="font-semibold text-gray-700">{t('common.storeName')}</span> {t('terms.introCont')}
                </p>
              </div>

              <div className="space-y-8">
                {/* 1. التعريفات */}
                <Section title={t('terms.definitions.title')}>
                  <p><strong className="text-gray-800">{t('terms.definitions.store')}:</strong> {t('terms.definitions.storeDesc')}</p>
                  <p><strong className="text-gray-800">{t('terms.definitions.customer')}:</strong> {t('terms.definitions.customerDesc')}</p>
                  <p><strong className="text-gray-800">{t('terms.definitions.service')}:</strong> {t('terms.definitions.serviceDesc')}</p>
                </Section>

                {/* 2. الأهلية */}
                <Section title={t('terms.eligibility.title')}>
                  <p>{t('terms.eligibility.desc')}</p>
                </Section>

                {/* 3. المنتجات والأسعار */}
                <Section title={t('terms.products.title')}>
                  <p>{t('terms.products.desc')}</p>
                </Section>

                {/* 4. الطلب والدفع */}
                <Section title={t('terms.order.title')}>
                  <p>{t('terms.order.desc')}</p>
                  <p>{t('terms.order.desc2')}</p>
                </Section>

                {/* 5. التوصيل */}
                <Section title={t('terms.delivery.title')}>
                  <p>{t('terms.delivery.desc')}</p>
                  <p>{t('terms.delivery.desc2')}</p>
                </Section>

                {/* 6. الاسترجاع والاستبدال */}
                <Section title={t('terms.returns.title')}>
                  <p>{t('terms.returns.desc')}</p>
                </Section>

                {/* 7. حساب المستخدم */}
                <Section title={t('terms.account.title')}>
                  <p>{t('terms.account.desc')}</p>
                </Section>

                {/* 8. الملكية الفكرية */}
                <Section title={t('terms.intellectual.title')}>
                  <p>{t('terms.intellectual.desc')} <strong>{t('common.storeName')}</strong> {t('terms.intellectual.desc2')}</p>
                </Section>

                {/* 9. تحديد المسؤولية */}
                <Section title={t('terms.liability.title')}>
                  <p>{t('terms.liability.desc')}</p>
                </Section>

                {/* 10. القانون الواجب التطبيق */}
                <Section title={t('terms.governing.title')}>
                  <p>{t('terms.governing.desc')}</p>
                </Section>

                {/* 11. التعديلات */}
                <Section title={t('terms.amendments.title')}>
                  <p>{t('terms.amendments.desc')}</p>
                </Section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون القسم
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-black rounded-full"></span>
        {title}
      </h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-2 ps-2">
        {children}
      </div>
    </div>
  );
}