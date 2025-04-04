const vscode = require("vscode");

function registerAutoImport(context) {
  const importsMap = {
    الوقت: "استورد الوقت",
    غفوة: "استورد غفوة من وقت",
    تاريخ: "استورد تاريخ",
    ظل: "استورد ظل من الرياضيات",
    جيب: "استورد جيب من الرياضيات",
    تجيب: "استورد تجيب من الرياضيات",
  };

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "alif",
      {
        provideCompletionItems(document, position) {
          const suggestions = [];

          for (const func in importsMap) {
            const completion = new vscode.CompletionItem(
              func,
              vscode.CompletionItemKind.Function
            );
            completion.insertText = func + "()";

            // ✅ اتأكد إن الاستيراد مش مكرر
            const alreadyImported = document
              .getText()
              .includes(importsMap[func]);
            if (!alreadyImported) {
              completion.additionalTextEdits = [
                vscode.TextEdit.insert(
                  new vscode.Position(0, 0),
                  importsMap[func] + "\n"
                ),
              ];
            }

            suggestions.push(completion);
          }

          return suggestions;
        },
      },
      "."
    )
  );
}

module.exports = registerAutoImport;
