// services/settingsApi.ts

import { getHeaders } from "./api";

interface SettingsData {
  setting: {
    name: string;
    address: string;
    privacy_policy: string;
    terms_and_conditions: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    snapchat: string;
    instagram: string;
    whatsapp: string;
    email: string;
    phone: string;
    meta_pixel_code: string | null;
    meta_api_token: string | null;
    linkedin_pixel_code: string | null;
    linkedin_api_token: string | null;
    tiktok_pixel_code: string | null;
    tiktok_api_token: string | null;
    snapchat_pixel_code: string | null;
    snapchat_api_token: string | null;
    twitter_pixel_code: string | null;
    twitter_api_token: string | null;
    tik_tok?: string;
    currency?: {
      code: string;
      symbol: string;
      name: string;
      rate: number;
      country_code: string;
      country_name: string;
      base: string;
    };
  };
}

interface SettingsResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: SettingsData;
}

// ✅ تخزين مؤقت لتقليل عدد الطلبات
let cachedSettings: SettingsData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // ساعة واحدة

// دالة لجلب إعدادات الموقع
export async function getSettings(): Promise<SettingsData> {
  try {
    // ✅ استخدام التخزين المؤقت
    const now = Date.now();
    if (cachedSettings && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedSettings;
    }

    const response = await fetch(`https://admin.souqkaber.com/api/settings`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'force-cache', // ✅ تخزين مؤقت لتحسين الأداء
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SettingsResponse = await response.json();
    
    if (!data.result) {
      throw new Error(data.message || 'Failed to fetch settings');
    }

    // ✅ تخزين النتيجة في الذاكرة
    cachedSettings = data.data;
    cacheTimestamp = now;

    return data.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
}

// ✅ دالة للحصول على اسم الموقع فقط (للاستخدام السريع)
export async function getSiteName(): Promise<string> {
  try {
    const settings = await getSettings();
    return settings.setting.name || "سوق كبير";
  } catch {
    return "سوق كبير";
  }
}

// ✅ دالة للحصول على معلومات التواصل
export async function getContactInfo(): Promise<{ email: string; phone: string }> {
  try {
    const settings = await getSettings();
    return {
      email: settings.setting.email || "contact@souq-kaber.com",
      phone: settings.setting.phone || "+201016736771",
    };
  } catch {
    return {
      email: "contact@souq-kaber.com",
      phone: "+201016736771",
    };
  }
}

// ✅ دالة للحصول على روابط التواصل الاجتماعي
export async function getSocialLinks(): Promise<{
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  snapchat: string;
  whatsapp: string;
  tik_tok: string;
}> {
  try {
    const settings = await getSettings();
    return {
      facebook: settings.setting.facebook || "",
      twitter: settings.setting.twitter || "",
      instagram: settings.setting.instagram || "",
      linkedin: settings.setting.linkedin || "",
      snapchat: settings.setting.snapchat || "",
      whatsapp: settings.setting.whatsapp || "",
      tik_tok: settings.setting.tik_tok || "",
    };
  } catch {
    return {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      snapchat: "",
      whatsapp: "",
      tik_tok: "",
    };
  }
}