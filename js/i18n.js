// i18n.js - Translations for English and Persian
const translations = {
    en: {
        appName: "Letter",
        properties: "Properties",
        rectangle: "Rectangle",
        fillColor: "Fill Color",
        borderColor: "Border Color",
        borderWidth: "Border Width (px)",
        cornerRadius: "Corner Radius (px)",
        headerFields: "Header Fields",
        orgName: "Organization Name",
        logoUrl: "Logo URL",
        date: "Date",
        attachment: "Attachment",
        letterNumber: "Letter Number",
        saveTemplate: "Save Template",
        exportPdf: "Export PDF",
        templates: "Templates",
        undo: "Undo",
        redo: "Redo",
        print: "Print",
        theme: "Toggle Theme",
        language: "Switch Language",
        a4Canvas: "A4 Canvas",
        header: "Header",
        body: "Body",
        noTemplate: "No Template",
        customTemplate: "Custom Template",
        saveTemplateSuccess: "Template saved successfully!",
        saveTemplateError: "Error saving template.",
        exportSuccess: "Templates exported.",
        importSuccess: "Templates imported.",
        importError: "Error importing templates.",
        pdfExportError: "PDF export failed.",
        pdfExportSuccess: "PDF exported successfully.",
    },
    fa: {
        appName: "نامه",
        properties: "ویژگی‌ها",
        rectangle: "مستطیل",
        fillColor: "رنگ پس‌زمینه",
        borderColor: "رنگ حاشیه",
        borderWidth: "ضخامت حاشیه (px)",
        cornerRadius: "شعاع گوشه (px)",
        headerFields: "فیلدهای سربرگ",
        orgName: "نام سازمان",
        logoUrl: "آدرس لوگو",
        date: "تاریخ",
        attachment: "پیوست",
        letterNumber: "شماره نامه",
        saveTemplate: "ذخیره قالب",
        exportPdf: "خروجی PDF",
        templates: "قالب‌ها",
        undo: "بازگشت",
        redo: "انجام مجدد",
        print: "چاپ",
        theme: "تغییر تم",
        language: "تغییر زبان",
        a4Canvas: "صفحه A4",
        header: "سربرگ",
        body: "بدنه",
        noTemplate: "بدون قالب",
        customTemplate: "قالب سفارشی",
        saveTemplateSuccess: "قالب با موفقیت ذخیره شد!",
        saveTemplateError: "خطا در ذخیره قالب.",
        exportSuccess: "قالب‌ها خروجی گرفته شد.",
        importSuccess: "قالب‌ها وارد شد.",
        importError: "خطا در وارد کردن قالب‌ها.",
        pdfExportError: "خروجی PDF ناموفق بود.",
        pdfExportSuccess: "PDF با موفقیت تولید شد.",
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        // Update placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });
        // Update title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (translations[lang][key]) {
                el.title = translations[lang][key];
            }
        });
        localStorage.setItem('letter-lang', lang);
    }
}

function getTranslation(key) {
    return translations[currentLang]?.[key] || translations.en[key] || key;
}

export { setLanguage, getTranslation, currentLang };
