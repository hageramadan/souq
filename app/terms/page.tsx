// app/privacy/page.tsx
"use client";

import Link from "next/link";
import { ChevronRight, Home, ShoppingBag, Phone, Mail, MapPin, Shield, Database, Eye, Cookie } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function PrivacyPage() {
  const { t } = useTranslation(); // ✅ استخدام hook الترجمة

  return (
    <div className="bg-gradient-to-l min-h-screen from-[#bdcbf12a] to-[#feecea3b]">
      <div className="container mx-auto px-4 py-6 md:py-8">
        
        {/* Breadcrumbs */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#23A6F0] transition flex items-center gap-1">
              <Home className="w-4 h-4" />
              {t('common.home')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#23A6F0] font-medium">{t('privacy.title')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {/* Header */}
              <div className="text-center mb-8 pb-4 border-b border-gray-100">
                <h1 className="text-xl md:text-xl font-bold text-gray-800 mb-3">{t('privacy.title')}</h1>
                <p className="text-gray-500 text-sm">
                  {t('privacy.intro')} <span className="font-semibold text-gray-700">{t('common.storeName')}</span> {t('privacy.introCont')}
                </p>
              </div>

              <div className="space-y-8">
                {/* 1. البيانات التي نجمعها */}
                <Section title={t('privacy.collect.title')} icon={<Database className="w-4 h-4" />}>
                  <p><strong className="text-gray-800">{t('privacy.collect.personal')}:</strong> {t('privacy.collect.personalDesc')}</p>
                  <p><strong className="text-gray-800">{t('privacy.collect.technical')}:</strong> {t('privacy.collect.technicalDesc')}</p>
                </Section>

                {/* 2. كيف نستخدم بياناتك */}
                <Section title={t('privacy.use.title')} icon={<Eye className="w-4 h-4" />}>
                  <p>{t('privacy.use.desc')}</p>
                  <ul className="list-disc ps-5 space-y-1 mt-2">
                    <li>{t('privacy.use.processOrders')}</li>
                    <li>{t('privacy.use.communicate')}</li>
                    <li>{t('privacy.use.offers')}</li>
                    <li>{t('privacy.use.improve')}</li>
                  </ul>
                </Section>

                {/* 3. حماية البيانات */}
                <Section title={t('privacy.protection.title')} icon={<Shield className="w-4 h-4" />}>
                  <p>{t('privacy.protection.desc')}</p>
                </Section>

                {/* 4. مشاركة البيانات مع أطراف ثالثة */}
                <Section title={t('privacy.sharing.title')}>
                  <p>{t('privacy.sharing.desc')}</p>
                </Section>

                {/* 5. ملفات تعريف الارتباط (Cookies) */}
                <Section title={t('privacy.cookies.title')} icon={<Cookie className="w-4 h-4" />}>
                  <p>{t('privacy.cookies.desc')}</p>
                </Section>

                {/* 6. حقوقك */}
                <Section title={t('privacy.rights.title')}>
                  <p>{t('privacy.rights.desc')}</p>
                  <ul className="list-disc ps-5 space-y-1 mt-2">
                    <li>{t('privacy.rights.access')}</li>
                    <li>{t('privacy.rights.correct')}</li>
                    <li>{t('privacy.rights.delete')}</li>
                    <li>{t('privacy.rights.unsubscribe')}</li>
                  </ul>
                  <p className="mt-3">{t('privacy.rights.contact')}</p>
                </Section>

                {/* 7. تعديل سياسة الخصوصية */}
                <Section title={t('privacy.amendments.title')}>
                  <p>{t('privacy.amendments.desc')}</p>
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
function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="pb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-black rounded-full"></span>
        {icon && <span className="text-[#23A6F0]">{icon}</span>}
        {title}
      </h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-2 ps-2">
        {children}
      </div>
    </div>
  );
}