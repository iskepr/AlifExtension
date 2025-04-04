const vscode = require("vscode");
const path = require("path");

function registerRunCommand() {
  return vscode.commands.registerCommand("alif.runCode", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("لا يوجد ملف مفتوح!");
      return;
    }

    const filePath = editor.document.fileName;
    const fileName = path.basename(filePath);
    let terminal = vscode.window.terminals.find(t => t.name === "Alif Debugger");
    if (!terminal) {
      terminal = vscode.window.createTerminal("Alif Debugger");
    }
    terminal.show();
    terminal.sendText(`alif ${filePath}`);
  });
}


module.exports = registerRunCommand;
