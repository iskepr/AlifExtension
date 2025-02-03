const registerHoverProvider = require("./script/hoverProvider");
const registerRunCommand = require("./script/runCommand");
const registerFormatter = require("./script/formatter");
const registerDiagnostics = require("./script/diagnostics");

function activate(context) {
  context.subscriptions.push(registerHoverProvider());
  context.subscriptions.push(registerRunCommand());
  context.subscriptions.push(registerFormatter());
  registerDiagnostics(context);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
