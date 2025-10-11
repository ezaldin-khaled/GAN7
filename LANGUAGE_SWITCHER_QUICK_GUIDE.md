# Language Switcher - Quick Reference Guide

## How to Use the Language Switcher

### Location
The language switcher button is located in the **navigation bar** at the top of every page.

### Visual Appearance

**English Mode:**
```
🇺🇸 English ▼
```

**Arabic Mode:**
```
🇸🇦 العربية ▼
```

### Steps to Switch Language

1. **Locate the button** in the navigation bar (next to the Gallery link)
2. **Click the button** to open the language dropdown
3. **Select your preferred language:**
   - 🇺🇸 English
   - 🇸🇦 العربية (Arabic)
4. The page will **instantly update** to show content in the selected language
5. Your choice is **automatically saved** for future visits

### What Gets Translated

✅ All navigation menus
✅ Page titles and headings
✅ Service descriptions
✅ About us content
✅ Form labels and placeholders
✅ Button text
✅ Error and success messages
✅ Gallery categories
✅ Profile information
✅ Footer content

### Mobile View

On mobile devices, the language switcher shows only the flag icon to save space:
- English: 🇺🇸
- Arabic: 🇸🇦

Tap the icon to see language options.

### RTL Support for Arabic

When you select Arabic, the entire website automatically:
- Switches text direction from left-to-right to **right-to-left**
- Changes to the **Cairo font** optimized for Arabic text
- Adjusts all layouts for proper Arabic reading flow
- Maintains all functionality and features

### Language Persistence

Your language preference is **automatically saved** and will be:
- Remembered when you return to the site
- Applied across all pages
- Maintained even after closing the browser

### Keyboard Shortcuts

Currently, the language switcher requires clicking. Keyboard navigation support can be added in future updates.

### Browser Compatibility

The language switcher works on:
- ✅ Chrome/Edge (latest versions)
- ✅ Firefox (latest versions)
- ✅ Safari (latest versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, etc.)

## For Developers

### Adding the Language Switcher to New Pages

If you create a new page, the language switcher will automatically appear if you include the Navbar component:

```jsx
import Navbar from '../Components/Navbar/Navbar';

function MyNewPage() {
  return (
    <div>
      <Navbar />
      {/* Your page content */}
    </div>
  );
}
```

### Making New Content Translatable

1. Add your text to both translation files:
   - `src/locales/en/translation.json`
   - `src/locales/ar/translation.json`

2. Use the translation in your component:
```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('mySection.title')}</h1>;
}
```

### Checking Current Language

```jsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { currentLanguage, isRTL } = useLanguage();
  // currentLanguage: 'en' or 'ar'
  // isRTL: true if Arabic, false if English
}
```

## Troubleshooting

### Language switcher not visible
- Check if Navbar is included on your page
- Verify you're not in mobile menu view (look for the hamburger icon)
- Clear browser cache and reload

### Translations not working
- Ensure translation keys exist in both `en` and `ar` files
- Check browser console for errors
- Verify the component is using `useTranslation()` hook

### RTL layout issues
- Some third-party components may not support RTL
- Custom CSS may need `[dir="rtl"]` rules
- Report any layout issues for fixing

## Support

For issues or questions about the language switcher:
1. Check the main documentation: `ARABIC_LOCALIZATION_GUIDE.md`
2. Review the implementation in `src/Components/common/LanguageSwitcher.jsx`
3. Check the i18n configuration in `src/i18n.js`

---

**Last Updated:** October 2025
**Version:** 1.0

