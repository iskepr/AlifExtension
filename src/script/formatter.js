const vscode = require("vscode");

function registerFormatter() {
  return vscode.languages.registerDocumentFormattingEditProvider("alif", {
    provideDocumentFormattingEdits(document) {
      const edits = [];
      const text = document.getText();
      const lines = text.split(/\r?\n/);
      const spaces = "    ";
      const formattedLines = [];

      for (let i = 0; i < lines.length; i++) {
        const currentLine = document.lineAt(i);
        const trimmedLine = currentLine.text.trimEnd();
        let formattedLine = trimmedLine;
        // معالجة السطر التالي بشكل آمن
        const nextLine = i < lines.length - 1 ? document.lineAt(i + 1) : null;

        // التحقق من وجود ":" في السطر الحالي مع التأكد أنها ليست داخل النصوص أو مصفوفة
        if (
          currentLine.text.trim().endsWith(":") &&
          !/^\s*{.*:.*}$/.test(currentLine.text) && // تجاهل السطر إذا كان مصفوفة
          nextLine &&
          !nextLine.text.startsWith(spaces)
        ) {
          const edit = vscode.TextEdit.insert(nextLine.range.start, spaces);
          edits.push(edit);
        }

        // تخطي السطور الفارغة المتكررة
        if (!trimmedLine) {
          if (
            formattedLines.length === 0 ||
            formattedLines[formattedLines.length - 1] !== ""
          ) {
            formattedLines.push("");
          }
          continue;
        }

        // إضافة مسافة قبل السطور التي تبدأ بـ "ارجاع" أو "استمر"
        if (
          formattedLine.startsWith("ارجاع") ||
          formattedLine.startsWith("استمر")
        ) {
          formattedLine = spaces + formattedLine;
        }

        // تنسيق السطور التي تحتوي على ":"
        if (formattedLine.includes(":")) {
          const lineWithoutComments = formattedLine.replace(/#.*/, "");

          const colonOutsideQuotesRegex = /:(?=(?:[^"']*"[^"']*")*[^"']*$)/;
          if (
            colonOutsideQuotesRegex.test(lineWithoutComments) &&
            !lineWithoutComments.endsWith(":")
          ) {
            formattedLine = lineWithoutComments.replace(
              colonOutsideQuotesRegex,
              `:\n${spaces}`
            );
          }
        }

        formattedLines.push(formattedLine);
      }

      // إنشاء التعديل النهائي للنص بالكامل
      const start = new vscode.Position(0, 0);
      const end = new vscode.Position(
        document.lineCount - 1,
        document.lineAt(document.lineCount - 1).text.length
      );
      const range = new vscode.Range(start, end);

      edits.push(new vscode.TextEdit(range, formattedLines.join("\n")));
      return edits;
    },
  });
}

module.exports = registerFormatter;
