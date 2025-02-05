const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const sudoPrompt = require("sudo-prompt");
const os = require("os");

const workbenchPath = path.join(
  vscode.env.appRoot,
  "out/vs/workbench/workbench.desktop.main.css"
);
const backupPath = workbenchPath + ".backup";
const injectCSS = path.resolve(__dirname, "../style/inject.css");
const flag = "/*rtol-alif*/";
const command = os.platform() === "win32" ? "type" : "cat";

const fileContent = (filePath) =>
  fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
const isInjected = () => fileContent(workbenchPath).includes(flag);

const executeCommand = (cmd, callback) =>
  sudoPrompt.exec(cmd, { name: "RTL alif" }, callback);

const activateRTL = (sudo = true, callback) => {
  const cmds = [
    `${command} "${workbenchPath}" > "${backupPath}"`,
    `${command} "${injectCSS}" >> "${workbenchPath}"`,
  ].join(" && ");
  sudo
    ? executeCommand(cmds, callback)
    : fs.appendFile(workbenchPath, fileContent(injectCSS), callback);
};

const deactivateRTL = (sudo = true, callback) => {
  sudo
    ? executeCommand(
        `${command} "${backupPath}" > "${workbenchPath}"`,
        callback
      )
    : fs.copyFile(backupPath, workbenchPath, callback);
};

const toggleRTL = (activate) => {
  if (activate ? !isInjected() : isInjected()) {
    vscode.window
      .showInformationMessage(
        `"RTL alif" ${activate ? "تفعيل" : "إلغاء التفعيل"}؟`,
        "مسؤول",
        "إالغاء"
      )
      .then((as) => {
        if (as) {
          (activate ? activateRTL : deactivateRTL)(as === "مسؤول", (error) => {
            if (error)
              vscode.window.showErrorMessage(
                `"RTL alif" لا يمكن ${activate ? "تفعيله" : "إلغاؤه"}!`,
                { detail: error.message, modal: true }
              );
            else
              vscode.window
                .showInformationMessage(
                  `"RTL alif" تم ${activate ? "تفعيله" : "إلغاؤه"} بنجاح.`,
                  "إعادة تشغيل"
                )
                .then(
                  (action) =>
                    action === "إعادة تشغيل" &&
                    vscode.commands.executeCommand(
                      "workbench.action.reloadWindow"
                    )
                );
          });
        }
      });
  } else
    vscode.window.showInformationMessage(
      `"RTL alif" هو بالفعل ${activate ? "مفعل" : "غير مفعل"}!`
    );
};

const switchDirection = (from, to) => {
  if (isInjected()) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const filePath = editor.document.uri.fsPath;
      const newFilePath = filePath.replace(new RegExp(from + "$", "i"), to);
      const workspaceEdit = new vscode.WorkspaceEdit();
      workspaceEdit.renameFile(
        vscode.Uri.file(filePath),
        vscode.Uri.file(newFilePath)
      );
      vscode.workspace.applyEdit(workspaceEdit);
    }
  } else {
    vscode.window
      .showWarningMessage('"RTL alif" غير مفعل!', "تفعيل")
      .then((action) => {
        if (action === "تفعيل") toggleRTL(true);
      });
  }
};


const registerRTL = (context) => {
  context.subscriptions.push(
    vscode.commands.registerCommand("rtl-alif.active", () =>
      toggleRTL(true)
    ),
    vscode.commands.registerCommand("rtl-alif.deactive", () =>
      toggleRTL(false)
    ),
    vscode.commands.registerCommand("rtl-alif.rtl", () =>
      switchDirection(".alif", ".rtl.alif")
    ),
    vscode.commands.registerCommand("rtl-alif.ltr", () =>
      switchDirection(".rtl.alif", ".alif")
    )
  );
};

module.exports = registerRTL;
