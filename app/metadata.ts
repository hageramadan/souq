// app/metadata.ts
import { Metadata } from "next";
import { getSettings } from "@/services/settingsApi";

// ✅ دالة لجلب الميتا داتا من الـ API
export async function generateMetadata(): Promise<Metadata> {
  try {
    const settingsData = await getSettings();
    const settings = settingsData.setting;
    
    // ✅ استخدام اسم الموقع من الـ API
    const siteName = settings.name || "سوق كبير";
    const siteDescription = `أكبر تشكيلة من الإلكترونيات في مصر بأفضل الأسعار. تسوق أحدث الهواتف الذكية، الشاشات العملاقة، السماعات اللاسلكية، والأجهزة المنزلية الذكية. عروض حصرية، ضمان أصلي، وشحن سريع لجميع المحافظات.`;
    
    return {
      title: {
        default: `${siteName} | أكبر متجر إلكترونيات في مصر - هواتف، شاشات، سماعات وأجهزة`,
        template: `%s | ${siteName}`,
      },
      description: siteDescription,
      keywords: "إلكترونيات، هواتف ذكية، شاشات، سماعات، أجهزة منزلية، سوق كبير، مصر، تسوق إلكترونيات أونلاين",
      openGraph: {
        title: `${siteName} | أكبر متجر إلكترونيات في مصر`,
        description: siteDescription,
        type: "website",
        locale: "ar_EG",
        siteName: siteName,
        url: "https://souqkaber.com",
      },
      twitter: {
        card: "summary_large_image",
        title: `${siteName} | أكبر متجر إلكترونيات في مصر`,
        description: siteDescription,
        site: settings.twitter || "https://twitter.com/Souq-kaber",
      },
      // ✅ إضافة معلومات التواصل
      other: {
        'contact:email': settings.email || "contact@souq-kaber.com",
        'contact:phone': settings.phone || "+201016736771",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    // ✅ استخدام الميتا الافتراضية في حالة الخطأ
    return {
      title: "سوق كبير | أكبر متجر إلكترونيات في مصر",
      description: "أكبر تشكيلة من الإلكترونيات في مصر بأفضل الأسعار",
    };
  }
}

// ✅ دالة لتوليد Structured Data (Schema.org)
export function generateStructuredData(settings: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": settings?.name || "سوق كبير",
    "url": "https://souqkaber.com",
    "logo": "https://souqkaber.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": settings?.phone || "+201016736771",
      "email": settings?.email || "contact@souq-kaber.com",
      "contactType": "customer service",
      "availableLanguage": ["Arabic", "English"],
    },
    "sameAs": [
      settings?.facebook,
      settings?.twitter,
      settings?.instagram,
      settings?.linkedin,
      settings?.snapchat,
      settings?.tik_tok,
    ].filter(Boolean),
  };
}