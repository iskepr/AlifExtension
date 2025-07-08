const registerHoverProvider = require("./script/hoverProvider");
const registerRunAlif = require("./script/runAlif");
const registerFormatter = require("./script/formatter");
const registerDiagnostics = require("./script/diagnostics");
const registerAutoImport = require("./script/autoImport");
const showAllWords = require("./script/showAllWords");
const registerRTLStyles = require("./script/RTL");

function activate(context) {
  context.subscriptions.push(registerHoverProvider());
  context.subscriptions.push(registerRunAlif());
  context.subscriptions.push(registerFormatter());
  context.subscriptions.push(registerAutoImport(context));
  context.subscriptions.push(showAllWords(context));
  context.subscriptions.push(registerRTLStyles(context));
  registerDiagnostics(context);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
