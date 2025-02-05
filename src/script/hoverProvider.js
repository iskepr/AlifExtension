const vscode = require("vscode");

function registerHoverProvider() {
  return vscode.languages.registerHoverProvider("alif", {
    provideHover(document, position) {
      const wordRange = document.getWordRangeAtPosition(position);
      const word = document.getText(wordRange);
      const hoverContent = getHoverContent(word);
      if (hoverContent) {
        return new vscode.Hover(
          new vscode.MarkdownString(
            `**فائدة امر ${word}**
            \n\n${hoverContent}
            \n\n[📖 المزيد من المعلومات](https://aliflang.org/docs#${word})`
          )
        );
      }
    },
  });
}

function getHoverContent(word) {
  const documentation = {
    دالة: "دالة تحتوي على مجموعة من الأوامر تُنفذ بالتسلسل.\n\nمثال:\n\nدالة مرحبا()\n\n    اطبع('السلام عليكم')\n\n    اذا س < ص \n\n        اطبع('ص أكبر من س')",
    اطبع: "دالة لطباعة النصوص في الطرفية.\n\nمثال: اطبع('مرحبا')",
    ادخل: "دالة لقراءة مدخلات المستخدم.\n\nمثال:\n\nاسم = ادخل('أدخل اسمك: ')",
    اذا: "أداة لتنفيذ شرط معين، فإذا تحقق يتم تنفيذ الشفرة داخلها.\n\nمثال:\n\nاذا س < ص \n\n    اطبع('س أصغر من ص')",
    اواذا:
      "أداة تُستخدم بعد 'اذا' لإضافة شرط جديد يُنفذ في حال لم يتحقق الشرط الأول.\n\nمثال:\n\nاذا س < ص\n\n    اطبع('س أصغر من ص')\n\nاواذا س = ص\n\n    اطبع('س تساوي ص')",
    والا: "أداة تُستخدم مع 'اذا' و 'اواذا' لتنفيذ شفرة معين في حال لم تتحقق أي من الشروط السابقة.\n\nمثال:\n\nاذا س < ص\n\n    اطبع('س أصغر من ص')\n\nوالا\n\n    اطبع('س أكبر من أو يساوي ص')",
    لاجل: "حلقة تكرارية تُستخدم لتنفيذ الشفرة عدة مرات بناءً على نطاق محدد.\n\nمثال:\n\nلاجل ب في مدى(10)\n\n    اطبع(ب)\n\nفي هذا المثال، تتكرر الحلقة من 0 إلى 9 يعني 10 مرات، وتطبع قيمة ب في كل تكرار.",
    ارجع: "دالة تُستخدم داخل الدوال لإرجاع قيمة معينة عند استدعاء الدالة.",
    استمر:
      "تُستخدم داخل الحلقات لتخطي التكرار الحالي والانتقال إلى التكرار التالي.\n\nمثال:\n\nاذا س == 4:\n\n    س += 3\n\n    استمر",
    توقف: "تُستخدم داخل الحلقات لإنهاء تنفيذ الحلقة بالكامل عند تحقق شرط معين.\n\nمثال:\n\nاذا س == 4:\n\n    س += 3\n\n    توقف",
    بينما:
      "حلقة تكرارية تستمر في التنفيذ طالما تحقق الشرط المحدد.\n\nمثال:\n\nس = 0\n\n:بينما س < 5\n\n    اطبع(س)\n\n    س += 1",
    صنف: "يُستخدم لإنشاء كائنات وفق تصاميم محددة (البرمجة الكائنية).",
    استورد: "يُستخدم لاستيراد مكتبات خارجية.\n\nمثال:\n\nاستورد تاريخ_هجري",
    نوع: "دالة تُستخدم لمعرفة نوع المتغير.\n\nمثال:\n\nاطبع(نوع(5))",
    صحيح: "دالة لتحويل النص إلى عدد صحيح.\n\nمثال:\n\nرقم = صحيح('123')",
    عشري: "دالة لتحويل النص إلى عدد عشري (كسري).\n\nمثال:\n\nرقم = عشري('12.34')",
    نص: "دالة لتحويل أي قيمة إلى نص.\n\nمثال:\n\nاطبع(نص(123))",
    ".اضف":
      "يُستخدم لإضافة عنصر جديد إلى المصفوفة.\n\nمثال:\n\nمصفوفة = [4, 'سلام']\n\nمصفوفة.اضف(5)\n\nالنتيجة: [4, 'سلام', 5]",
    ".امسح":
      "يُستخدم لحذف عنصر معين من المصفوفة.\n\nمثال:\n\nمصفوفة = [4, 'سلام', 5]\n\nمصفوفة.امسح(5)\n\nالنتيجة: [4, 'سلام']",
    ".ادرج":
      "يُستخدم لإضافة عنصر في موقع معين داخل المصفوفة.\n\nمثال:\n\nمصفوفة = [4, 'سلام']\n\nمصفوفة.ادرج(1, 'صح')\n\nالنتيجة: [4, 'صح', 'سلام']",
    ".مفاتيح()":
      "تُستخدم لاسترجاع مفاتيح الكائن (الفهرس).\n\nمثال:\n\nس = {'أ': 5, 'ب': 7, 'ت': 9}\n\nاطبع(س.مفاتيح())",
    احذف: "يُستخدم لحذف متغير من الذاكرة.\n\nمثال:\n\nس = 5\n\nاحذف س",
  };

  return documentation[word];
}

module.exports = registerHoverProvider;
