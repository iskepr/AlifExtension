const vscode = require("vscode");

function activate(context) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("alif");

  // دالة تعرض شرحًا للكلمة تحت المؤشر
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("alif", {
      provideHover(document, position) {
        const wordRange = document.getWordRangeAtPosition(position);
        const word = document.getText(wordRange);

        const hoverContent = getHoverContent(word);
        if (hoverContent) {
          return new vscode.Hover(hoverContent);
        }
      },
    })
  );

  function getHoverContent(word) {
    const documentation = {
      اطبع: 'دالة للطباعة على الشاشة\n\nمثال:\nاطبع("مرحبا")',
      ادخل: 'دالة لقراءة مدخلات المستخدم\n\nمثال:\nاسم = ادخل("ادخل اسمك: ")',
      مدى: "دالة تنشئ تسلسل من الأرقام\n\nمثال:\nلاجل س في مدى(5):\n    اطبع(س)",
      طول: 'دالة تحسب طول النص أو القائمة\n\nمثال:\nنص = "مرحبا"\nاطبع(طول(نص))',
      نوع: "دالة تعيد نوع المتغير\n\nمثال:\nاطبع(نوع(5))",
      صحيح: 'دالة تحول النص إلى رقم صحيح\n\nمثال:\nرقم = صحيح("123")',
      عشري: 'دالة تحول النص إلى رقم عشري\n\nمثال:\nرقم = عشري("12.34")',
      نص: "دالة تحول القيمة إلى نص\n\nمثال:\nاطبع(نص(123))",
    };

    return documentation[word];
  }

  // دالة لتنسيق الكود
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider("alif", {
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
    })
  );

  // استمع لتغييرات المستند لاكتشاف الأخطاء
  vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document.languageId === "alif") {
      updateDiagnostics(event.document, diagnosticCollection);
    }
  });

  vscode.workspace.onDidOpenTextDocument((document) => {
    if (document.languageId === "alif") {
      updateDiagnostics(document, diagnosticCollection);
    }
  });

  context.subscriptions.push(diagnosticCollection);

  // وظيفة لتحديث الأخطاء
  function updateDiagnostics(document, diagnosticCollection) {
    const diagnostics = [];
    const lines = document.getText().split(/\r?\n/);

    lines.forEach((line, i) => {
      const lineWithoutComments = line.replace(/#.*/, "");
      const lineWithoutStrings = lineWithoutComments.replace(
        /(["'])(?:(?=(\\?))\2.)*?\1/g,
        ""
      );
      const colonCount = (lineWithoutStrings.match(/:/g) || []).length;

      // التحقق من وجود أكثر من علامة ":" في السطر
      if (colonCount > 1) {
        diagnostics.push(
          createDiagnostic(
            i,
            0,
            i,
            line.length,
            "تم اكتشاف خطأ: لا يُسمح بوجود أكثر من علامتين ':' خارج النصوص والتعليقات في نفس السطر."
          )
        );
      }

      // التحقق من السطر التالي
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const processedLine = lineWithoutStrings.trim();

        // إذا كان السطر الحالي ينتهي بـ ":" بعد إزالة المسافات والتعليقات والنصوص
        if (processedLine.endsWith(":")) {
          const currentLineSpaces = line.length - line.trimStart().length;
          const requiredSpaces = currentLineSpaces + 2;
          const nextLineSpaces = nextLine.length - nextLine.trimStart().length;

          // التحقق من أن السطر التالي يحتوي على المسافات المطلوبة
          if (nextLineSpaces < requiredSpaces) {
            diagnostics.push(
              createDiagnostic(
                i + 1,
                0,
                i + 1,
                nextLine.length,
                `خطأ: السطر يجب أن يحتوي على ${requiredSpaces} مسافة في البداية`
              )
            );
          }
        }
      }
    });

    diagnosticCollection.set(document.uri, diagnostics);
  }

  // وظيفة مساعدة لإنشاء التشخيصات
  function createDiagnostic(lineStart, charStart, lineEnd, charEnd, message) {
    return new vscode.Diagnostic(
      new vscode.Range(lineStart, charStart, lineEnd, charEnd),
      message,
      vscode.DiagnosticSeverity.Error
    );
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
