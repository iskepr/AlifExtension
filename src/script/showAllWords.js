const vscode = require("vscode");

function showAllWords(context) {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider("alif", {
      provideCompletionItems(document, position) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return [];
        }
        const text = document.getText();

        const words =
          text.match(
            /[\u0600-\u06FFa-zA-Z_][\u0600-\u06FFa-zA-Z0-9_]*\s*=\s*[^;]+/g
          ) || [];
        const variableNames = new Set();

        words.forEach((word) => {
          const variable = word.split(" = ")[0].trim();
          variableNames.add(variable);
        });

        const uniqueWords = Array.from(
          new Set(
            text.match(/[\u0600-\u06FFa-zA-Z_][\u0600-\u06FFa-zA-Z0-9_]*/g) ||
              []
          )
        );

        const completionItems = uniqueWords.map((word) => {
          const item = new vscode.CompletionItem(
            word,
            vscode.CompletionItemKind.Text
          );

          if (variableNames.has(word)) {
            item.kind = vscode.CompletionItemKind.Variable;
          }

          return item;
        });

        return completionItems;
      },
    })
  );
}

module.exports = showAllWords;
