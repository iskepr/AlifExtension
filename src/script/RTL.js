const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const sudoPrompt = require("sudo-prompt");

const workbench = {
    target: "vs/workbench/workbench.desktop.main.css",
    subject: path.resolve(__dirname, "../../style/style.css"),
    path: {
        get original() {
            const appRoot =
                vscode.env.appRoot || path.dirname(require.main.filename);
            return path.resolve(appRoot, "out", workbench.target);
        },
    },
    file(filePath) {
        return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
    },
};

function injectCSS(callback) {
    try {
        const original = workbench.path.original;

        if (!fs.existsSync(workbench.subject)) {
            console.error("CSS file not found:", workbench.subject);
            callback?.(false);
            return;
        }

        let originalCSS;
        try {
            originalCSS = fs.readFileSync(original, "utf8");
        } catch (err) {
            return injectCSSWithSudo(callback);
        }

        if (originalCSS.includes("/* دعم النص من اليمين الى اليسار */")) {
            console.log("CSS already injected.");
            callback?.(true);
            return;
        }

        const cssToInject = fs.readFileSync(workbench.subject, "utf8");
        const injectedCSS = `${originalCSS}\n\n/* دعم النص من اليمين الى اليسار */\n${cssToInject}`;

        fs.writeFileSync(original, injectedCSS);
        console.log("CSS injected successfully");
        callback?.(true);
    } catch (error) {
        console.error("Error injecting CSS:", error);
        callback?.(false);
    }
}

function injectCSSWithSudo(callback) {
    const original = workbench.path.original;
    const subject = workbench.subject;

    const cssToInject = fs
        .readFileSync(subject, "utf8")
        .replace(/(["`\\$])/g, "\\$1");
    const marker = "/* دعم النص من اليمين الى اليسار */";

    const command = `
        if ! grep -q "${marker}" "${original}"; then
            echo -e "\\n\\n${marker}\\n${cssToInject}" >> "${original}";
        fi
    `;

    sudoPrompt.exec(
        command,
        { name: "دعم النص من اليمين الى اليسار" },
        (error) => {
            if (error) {
                console.error("Sudo injection failed:", error);
                callback?.(false);
            } else {
                console.log("CSS injected with sudo");
                callback?.(true);
            }
        }
    );
}

function registerRTLStyles() {
    injectCSS((success) => {
        if (success) {
            vscode.window
                .showInformationMessage(
                    "تم تفعيل دعم النص من اليمين الى اليسار بنجاح. أعد تشغيل VSCode لتطبيق التغيير",
                    "Restart"
                )
                .then((action) => {
                    if (action === "Restart") {
                        vscode.commands.executeCommand(
                            "workbench.action.reloadWindow"
                        );
                    }
                });
        } else {
            vscode.window.showErrorMessage(
                "فشل تفعيل دعم النص من اليمين الى اليسار."
            );
        }
    });

    return {
        dispose: () => {},
    };
}

module.exports = registerRTLStyles;
