const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const os = require("os");
const sudoPrompt = require("sudo-prompt");

const isWindows = os.platform() === "win32";
const isMac = os.platform() === "darwin";
const isLinux = os.platform() === "linux";

function detectWorkbenchCSS() {
    const appRoot = vscode.env.appRoot || path.dirname(require.main.filename);

    const knownPaths = [
        path.join(appRoot, "vs", "workbench", "workbench.desktop.main.css"),
        path.join(
            appRoot,
            "out",
            "vs",
            "workbench",
            "workbench.desktop.main.css"
        ),
    ];

    for (const cssPath of knownPaths) {
        if (fs.existsSync(cssPath)) return cssPath;
    }

    console.warn(
        "لم يتم العثور على workbench.desktop.main.css تلقائيًا، سيتم استخدام المسار الافتراضي."
    );
    return path.join(appRoot, "vs", "workbench", "workbench.desktop.main.css");
}

const workbench = {
    subject: path.resolve(__dirname, "../style/style.css"),
    path: {
        get original() {
            return detectWorkbenchCSS();
        },
    },
};

function injectCSS(callback) {
    try {
        const original = workbench.path.original;
        const subject = workbench.subject;

        if (!fs.existsSync(subject)) {
            console.error("CSS file not found:", subject);
            callback?.(false);
            return;
        }

        let originalCSS;
        try {
            originalCSS = fs.readFileSync(original, "utf8");
        } catch (err) {
            console.warn("Failed reading original file, trying sudo...");
            return injectCSSWithSudo(callback);
        }

        if (originalCSS.includes("/* دعم النص من اليمين الى اليسار */")) {
            callback?.(true);
            return;
        }

        const cssToInject = fs.readFileSync(subject, "utf8");
        const injectedCSS = `${originalCSS}\n\n/* دعم النص من اليمين الى اليسار */\n${cssToInject}`;

        fs.writeFileSync(original, injectedCSS);
        callback?.(true);
    } catch (error) {
        console.error("Error injecting CSS:", error);
        callback?.(false);
    }
}

function injectCSSWithSudo(callback) {
    const original = workbench.path.original;
    const subject = workbench.subject;

    if (!fs.existsSync(subject)) {
        console.error("CSS file not found:", subject);
        callback?.(false);
        return;
    }

    const marker = "/* دعم النص من اليمين الى اليسار */";
    const cssToInject = fs
        .readFileSync(subject, "utf8")
        .replace(/(["`\\$])/g, "\\$1");

    let command;

    if (isWindows) {
        const escapedCSS = cssToInject
            .replace(/\n/g, "`n")
            .replace(/"/g, '\\"');
        command = `powershell -Command "if (!(Get-Content '${original}' | Select-String -Pattern '${marker}')) { Add-Content -Path '${original}' -Value '\\n\\n${marker}\\n${escapedCSS}' }"`;
    } else
        command = `
            if ! grep -q "${marker}" "${original}"; then
                echo -e "\\n\\n${marker}\\n${cssToInject}" | sudo tee -a "${original}" > /dev/null;
            fi
        `;

    sudoPrompt.exec(command, { name: "VSCode RTL Support" }, (error) => {
        if (error) {
            console.error("Sudo injection failed:", error);
            callback?.(false);
        } else callback?.(true);
    });
}

function registerRTLStyles(context) {
    function activate() {
        injectCSS((success) => {
            if (success) {
                vscode.window
                    .showInformationMessage(
                        "تم تفعيل دعم النص من اليمين الى اليسار بنجاح. أعد تشغيل لتطبيق التغيير.",
                        "اعادة تشغيل"
                    )
                    .then((action) => {
                        context.globalState.update("rtlMessageShown", true);
                        if (action === "اعادة تشغيل")
                            vscode.commands.executeCommand(
                                "workbench.action.reloadWindow"
                            );
                    });
            } else
                vscode.window.showErrorMessage(
                    "فشل تفعيل دعم النص من اليمين الى اليسار."
                );
        });
    }

    if (!context.globalState.get("rtlMessageShown", false)) activate();
    return vscode.commands.registerCommand("rtl-alif.rtl", () => activate());
}

module.exports = registerRTLStyles;
