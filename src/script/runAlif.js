const vscode = require("vscode");
const path = require("path");
const cp = require("child_process");

function registerRunAlif() {
    return vscode.commands.registerCommand("alif.runCode", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("لا يوجد ملف مفتوح!");
            return;
        }

        const filePath = editor.document.fileName;
        const fileName = path.basename(filePath);

        const outputChannel = vscode.window.createOutputChannel("لغة الف");
        outputChannel.clear();
        outputChannel.show(true);

        const startTime = Date.now();

        outputChannel.appendLine(`[Running] "${fileName}"\n`);

        const alifProcess = cp.spawn("alif", [filePath]);

        alifProcess.stdout.on("data", (data) => {
            outputChannel.append(data.toString());
        });

        alifProcess.stderr.on("data", (data) => {
            outputChannel.append(`[Error]: ${data.toString()}`);
        });

        alifProcess.on("close", (code) => {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(3);
            outputChannel.appendLine(`\n[Done] code=${code} in ${elapsed} ث`);
        });
    });
}

// function registerRunAlif() {
//     return vscode.commands.registerCommand("alif.runCode", () => {
//         const editor = vscode.window.activeTextEditor;
//         if (!editor) {
//             vscode.window.showErrorMessage("لا يوجد ملف مفتوح!");
//             return;
//         }

//         const filePath = editor.document.fileName;

//         const command = `alif "${filePath}"`;
//         const output = cp.execSync(command, { encoding: "utf-8" });
//         vscode.window.showInformationMessage("تشغيل الف \n" + output, {
//             modal: true,
//         });
//     });
// }

module.exports = registerRunAlif;
