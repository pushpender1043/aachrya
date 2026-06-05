import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "nav_home": "Home",
      "nav_kundli": "Kundli",
      "banner_title": "Authentic Rudraksha",
      "explore_btn": "Explore Collection"
    }
  },
  hi: {
    translation: {
      "nav_home": "होम",
      "nav_kundli": "कुंडली",
      "banner_title": "प्रामाणिक रुद्राक्ष",
      "explore_btn": "कलेक्शन देखें"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "hi", // डिफ़ॉल्ट भाषा
  interpolation: { escapeValue: false }
});

export default i18n;