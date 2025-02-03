const vscode = require("vscode");

function registerHoverProvider() {
  return vscode.languages.registerHoverProvider("alif", {
    provideHover(document, position) {
      const wordRange = document.getWordRangeAtPosition(position);
      const word = document.getText(wordRange);
      const hoverContent = getHoverContent(word);
      if (hoverContent) {
        return new vscode.Hover(hoverContent);
      }
    },
  });
}

function getHoverContent(word) {
  const documentation = {
    اطبع: 'دالة للطباعة على الشاشة\n\nمثال:\nاطبع("مرحبا")',
    ادخل: 'دالة لقراءة مدخلات المستخدم\n\nمثال:\nاسم = ادخل("ادخل اسمك: ")',
    مدى: "دالة تنشئ تسلسل من الأرقام\n\nمثال:\nلاجل س في مدى(5):\n    اطبع(س)",
    طول: 'دالة تحسب طول النص أو القائمة\n\nمثال:\nنص = "مرحبا"\nاطبع(طول(نص))',
  };
  return documentation[word];
}

module.exports = registerHoverProvider;
