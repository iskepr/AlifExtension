const vscode = require("vscode");

function registerDiagnostics(context) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection("alif");
  context.subscriptions.push(diagnosticCollection);

  function updateDiagnostics(document) {
    if (document.languageId !== "alif") return;
    const diagnostics = [];
    const lines = document.getText().split(/\r?\n/);

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.endsWith(":")) {
        const nextLine = lines[i + 1] || "";
        if (!nextLine.startsWith("  ")) {
          diagnostics.push(new vscode.Diagnostic(
            new vscode.Range(i + 1, 0, i + 1, nextLine.length),
            "السطر يجب أن يحتوي على مسافة بادئة",
            vscode.DiagnosticSeverity.Error
          ));
        }
      }
    });
    diagnosticCollection.set(document.uri, diagnostics);
  }

  vscode.workspace.onDidChangeTextDocument(event => updateDiagnostics(event.document));
  vscode.workspace.onDidOpenTextDocument(updateDiagnostics);
}

module.exports = registerDiagnostics;
