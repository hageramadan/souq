// services/settingsApi.ts

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
  };
}

interface SettingsResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: SettingsData;
}

// دالة لجلب إعدادات الموقع
export async function getSettings(): Promise<SettingsData> {
  try {
    const response = await fetch(`https://admin.souqkaber.com/api/settings`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'content-type':'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SettingsResponse = await response.json();
    
    if (!data.result) {
      throw new Error(data.message || 'Failed to fetch settings');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
}