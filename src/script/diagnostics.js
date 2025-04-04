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
