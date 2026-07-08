import React, { createContext, useContext, useState, useEffect } from "react";

const dictionaries = {
  en: {
    "home.title": "Tell us what your locality needs",
    "home.subtitle":
      "Speak, type, or share a photo. We’ll help turn your concern into a clear development need.",
    "home.btn.speak": "Speak Your Need",
    "home.btn.report": "Report a Need",
    "nav.home": "Home",
    "nav.report": "Report",
    "nav.submissions": "My Submissions",
    "lang.continue": "Continue",
    "report.step1.title": "What does your locality need?",
    "report.step2.title": "Where is this needed?",
    "report.step3.title": "What is this related to?",
    "report.step4.title": "Review your request",
    "btn.analyze": "Analyse My Request",
  },
  hi: {
    "home.title": "हमें बताएं कि आपके इलाके को क्या चाहिए",
    "home.subtitle":
      "बोलें, टाइप करें या फ़ोटो साझा करें। हम आपकी चिंता को स्पष्ट विकास आवश्यकता में बदलने में मदद करेंगे।",
    "home.btn.speak": "अपनी ज़रूरत बोलें",
    "home.btn.report": "ज़रूरत रिपोर्ट करें",
    "nav.home": "होम",
    "nav.report": "रिपोर्ट",
    "nav.submissions": "मेरी रिपोर्ट",
    "lang.continue": "जारी रखें",
    "report.step1.title": "आपके इलाके को क्या चाहिए?",
    "report.step2.title": "इसकी कहाँ ज़रूरत है?",
    "report.step3.title": "यह किससे संबंधित है?",
    "report.step4.title": "अपनी रिपोर्ट की समीक्षा करें",
    "btn.analyze": "मेरी रिपोर्ट का विश्लेषण करें",
  },
  ml: {
    "home.title": "നിങ്ങളുടെ പ്രദേശത്തിന് എന്താണ് വേണ്ടതെന്ന് ഞങ്ങളോട് പറയുക",
    "home.subtitle":
      "സംസാരിക്കുക, ടൈപ്പ് ചെയ്യുക, അല്ലെങ്കിൽ ഒരു ഫോട്ടോ പങ്കിടുക.",
    "home.btn.speak": "ആവശ്യം പറയുക",
    "home.btn.report": "റിപ്പോർട്ട് ചെയ്യുക",
    "nav.home": "ഹോം",
    "nav.report": "റിപ്പോർട്ട്",
    "nav.submissions": "എന്റെ റിപ്പോർട്ടുകൾ",
    "lang.continue": "തുടരുക",
    "report.step1.title": "നിങ്ങളുടെ പ്രദേശത്തിന് എന്താണ് വേണ്ടത്?",
    "report.step2.title": "ഇത് എവിടെയാണ് വേണ്ടത്?",
    "report.step3.title": "ഇത് എന്തുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു?",
    "report.step4.title": "അവലോകനം ചെയ്യുക",
    "btn.analyze": "വിശകലനം ചെയ്യുക",
  },
  te: {
    "home.title": "మీ ప్రాంతానికి ఏమి కావాలో మాకు చెప్పండి",
    "home.subtitle": "మాట్లాడండి, టైప్ చేయండి లేదా ఫోటో పంచుకోండి.",
    "home.btn.speak": "మీ అవసరాన్ని చెప్పండి",
    "home.btn.report": "రిపోర్ట్ చేయండి",
    "nav.home": "హోమ్",
    "nav.report": "రిపోర్ట్",
    "nav.submissions": "నా రిపోర్ట్‌లు",
    "lang.continue": "కొనసాగించు",
    "report.step1.title": "మీ ప్రాంతానికి ఏమి కావాలి?",
    "report.step2.title": "ఇది ఎక్కడ కావాలి?",
    "report.step3.title": "ఇది దేనికి సంబంధించినది?",
    "report.step4.title": "సమీక్షించండి",
    "btn.analyze": "విశ్లేషించండి",
  },
  ta: {
    "home.title": "உங்கள் பகுதிக்கு என்ன தேவை என்பதை சொல்லுங்கள்",
    "home.subtitle":
      "பேசவும், தட்டச்சு செய்யவும் அல்லது புகைப்படத்தைப் பகிரவும்.",
    "home.btn.speak": "தேவையை பேசுங்கள்",
    "home.btn.report": "புகாரளிக்கவும்",
    "nav.home": "முகப்பு",
    "nav.report": "புகாரளி",
    "nav.submissions": "என் புகார்கள்",
    "lang.continue": "தொடரவும்",
    "report.step1.title": "உங்கள் பகுதிக்கு என்ன தேவை?",
    "report.step2.title": "இது எங்கே தேவை?",
    "report.step3.title": "இது எதனுடன் தொடர்புடையது?",
    "report.step4.title": "மதிப்பாய்வு செய்யவும்",
    "btn.analyze": "பகுப்பாய்வு செய்",
  },
};

const I18nContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export const I18nProvider = ({ children }) => {
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("civora_lang");
    if (stored && dictionaries[stored]) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("civora_lang", lang);
  };

  const t = (key) => {
    const dict = dictionaries[language] || dictionaries["en"];
    return dict[key] || dictionaries["en"][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
