import en from './en.json';
import hi from './hi.json';
import hinglish from './hinglish.json';

export const translations = {
  en,
  hi,
  hinglish,
};

export const getTranslation = (lang = 'en', key = '', params = {}) => {
  const currentLang = translations[lang] || translations.en;
  
  // Handle nested keys like 'care_types.nurse'
  const keys = key.split('.');
  let val = currentLang;
  for (const k of keys) {
    if (val && typeof val === 'object' && k in val) {
      val = val[k];
    } else {
      // Fallback to English
      let fallback = translations.en;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          fallback = key;
          break;
        }
      }
      val = fallback;
      break;
    }
  }

  if (typeof val === 'string') {
    let result = val;
    for (const [pKey, pVal] of Object.entries(params)) {
      result = result.replace(new RegExp(`{${pKey}}`, 'g'), pVal);
    }
    return result;
  }

  return val || key;
};
