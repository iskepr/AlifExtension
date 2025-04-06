const vscode = require("vscode");

function registerDiagnostics(context) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("alif");
  context.subscriptions.push(diagnosticCollection);

  // تحديث التشخيصات عند تغيير المستند أو فتحه
  vscode.workspace.onDidChangeTextDocument((event) =>
    updateDiagnostics(event.document, diagnosticCollection)
  );
  vscode.workspace.onDidOpenTextDocument((document) =>
    updateDiagnostics(document, diagnosticCollection)
  );
}

// تحديث التشخيصات للمستند
function updateDiagnostics(document, diagnosticCollection) {
  if (document.languageId !== "alif") return;

  const diagnostics = [];
  const lines = document.getText().split(/\r?\n/);

  checkTemplateSyntax(lines, diagnostics);

  const availableVariables = collectVariableNames(lines);

  lines.forEach((line, index) => {
    checkNextLines(line, index, lines, diagnostics);
    checkLines(line, index, availableVariables, diagnostics);
  });

  diagnosticCollection.set(document.uri, diagnostics);
}

// التحقق من المسافات البادئة
function checkNextLines(line, index, lines, diagnostics) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("#")) {
    // إذا كان السطر ينتهي بـ ":"، يجب أن يكون السطر التالي مزودًا بمسافة بادئة
    if (trimmed.endsWith(":")) {
      const nextLine = lines[index + 1] || "";
      const nextLineTrimmed = nextLine.trim();

      if (
        nextLineTrimmed &&
        !nextLine.startsWith("\t") &&
        !nextLine.startsWith("  ")
      ) {
        const range = new vscode.Range(
          index + 1,
          0,
          index + 1,
          nextLine.length
        );
        const message = "السطر يجب أن يحتوي على مسافة بادئة";
        diagnostics.push(
          new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error)
        );
      }
    }
  }
}

function checkLines(line, index, availableVariables, diagnostics) {
  const trimmed = line.trim();

  if (!trimmed.startsWith("#")) {
    function checkSyntaxErrors(trimmed, index, diagnostics) {
      const patterns = [
        {
          condition: (line) =>
            (line.match(/"/g) || []).length % 2 !== 0 ||
            (line.match(/'/g) || []).length % 2 !== 0,
          symbol: `" أو '`,
        },
        {
          condition: (line) => {
            const open = (line.match(/\(/g) || []).length;
            const close = (line.match(/\)/g) || []).length;
            return (open && !close) || (!open && close);
          },
          symbol: `( أو )`,
        },
        {
          condition: (line) =>
            (line.match(/(?:اذا |دالة )/g) || []).length &&
            !(line.match(/:/g) || []).length,
          symbol: `:`,
        },
      ];

      patterns.forEach(({ condition, symbol }) => {
        if (condition(trimmed)) {
          const range = new vscode.Range(index, 0, index, trimmed.length);
          const message = `علامة ${symbol} غير موجودة`;
          diagnostics.push(
            new vscode.Diagnostic(
              range,
              message,
              vscode.DiagnosticSeverity.Error
            )
          );
        }
      });
    }
    checkSyntaxErrors(trimmed, index, diagnostics);
    if (trimmed.match(/["']\s*[^"']*["']\s*:\s*["'][^"']*["']\s*(?!\s*,)/g)) { 
      const range = new vscode.Range(index, 0, index, trimmed.length);
      const message = `يجب إضافة فاصلة ',' بين البيانات`;
      diagnostics.push(
        new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error)
      );
    }
  }
}

// التحقق من الاقواس
function checkTemplateSyntax(lines, diagnostics) {
  const brackets = {
    "{": { close: "}", openLine: -1, isOpen: false },
    "[": { close: "]", openLine: -1, isOpen: false },
    "(": { close: ")", openLine: -1, isOpen: false },
  };

  lines.forEach((line, index) => {
    for (const open in brackets) {
      const close = brackets[open].close;

      if (line.includes(open)) {
        if (brackets[open].isOpen) {
          const range = new vscode.Range(index, 0, index, line.length);
          diagnostics.push(
            new vscode.Diagnostic(
              range,
              `القوس ${open} مغلق في مكان غير صحيح`,
              vscode.DiagnosticSeverity.Error
            )
          );
        } else {
          brackets[open].isOpen = true;
          brackets[open].openLine = index;
        }
      }

      if (line.includes(close)) {
        if (!brackets[open].isOpen) {
          const range = new vscode.Range(index, 0, index, line.length);
          diagnostics.push(
            new vscode.Diagnostic(
              range,
              `القوس ${close} غير مفتوح`,
              vscode.DiagnosticSeverity.Error
            )
          );
        } else {
          brackets[open].isOpen = false;
          brackets[open].openLine = -1;
        }
      }
    }
  });
  for (const open in brackets) {
    const b = brackets[open];
    if (b.isOpen && b.openLine !== -1) {
      const range = new vscode.Range(
        b.openLine,
        0,
        b.openLine,
        lines[b.openLine].length
      );
      diagnostics.push(
        new vscode.Diagnostic(
          range,
          `القوس ${b.close} غير مغلق`,
          vscode.DiagnosticSeverity.Error
        )
      );
    }
  }
}

// جمع أسماء المتغيرات المعروفة
function collectVariableNames(lines) {
  const variables = [];
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.includes(" = ")) {
      const parts = trimmed.split("=");
      if (parts.length >= 2) {
        const variableName = parts[0].trim();
        if (
          /^[\u0600-\u06FFa-zA-Z][\u0600-\u06FFa-zA-Z0-9_]*$/.test(variableName)
        ) {
          variables.push(variableName);
        }
      }
    }
  });
  return variables;
}

module.exports = registerDiagnostics;
