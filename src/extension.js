const vscode = require('vscode');

function activate(context) {
    // Print debug message when a .alif file is opened
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            if (document.languageId === 'alif') {
                console.log('alif run');
            }
        })
    );

    // Register hover provider
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('alif', {
            provideHover(document, position) {
                const wordRange = document.getWordRangeAtPosition(position);
                const word = document.getText(wordRange);

                const hoverContent = getHoverContent(word);
                if (hoverContent) {
                    return new vscode.Hover(hoverContent);
                }
            }
        })
    );

    // Register format command
    let formatCommand = vscode.commands.registerCommand('alif.formatDocument', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'alif') {
            const document = editor.document;
            const text = document.getText();
            const lines = text.split(/\r?\n/);
            let formattedLines = [];

            for (let line of lines) {
                // Format operators with spaces
                line = line
                    // Arithmetic operators
                    .replace(/([+\-*/\\^])/g, ' $1 ')
                    // Comparison operators
                    .replace(/(==|!=|<=|>=|<|>)/g, ' $1 ')
                    // Logical operators
                    .replace(/\b(و|او|ليس)\b/g, ' $1 ')
                    // Assignment operators
                    .replace(/([\+\-\*\/\\^]=)/g, ' $1 ')
                    // Clean up multiple spaces
                    .replace(/\s+/g, ' ')
                    .trim();

                formattedLines.push(line);
            }

            const edit = new vscode.WorkspaceEdit();
            const range = new vscode.Range(
                new vscode.Position(0, 0),
                new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
            );
            edit.replace(document.uri, range, formattedLines.join('\n'));
            vscode.workspace.applyEdit(edit);
        }
    });

    context.subscriptions.push(formatCommand);

    // Register the formatter
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('alif', {
            provideDocumentFormattingEdits(document) {
                const edits = [];
                const text = document.getText();
                const lines = text.split(/\r?\n/);
                let indentLevel = 0;
                const formattedLines = [];

                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i].trim();
                    
                    // Skip empty lines
                    if (!line) {
                        formattedLines.push('');
                        continue;
                    }

                    // Decrease indent for else statements
                    if (line.startsWith('والا') || line.startsWith('اواذا')) {
                        indentLevel = Math.max(0, indentLevel - 1);
                    }

                    // Add proper indentation
                    const indent = '    '.repeat(indentLevel);
                    
                    // Format operators with spaces
                    line = line
                        // Arithmetic operators
                        .replace(/([+\-*/\\^])/g, ' $1 ')
                        // Comparison operators
                        .replace(/(==|!=|<=|>=|<|>)/g, ' $1 ')
                        // Logical operators
                        .replace(/\b(و|او|ليس)\b/g, ' $1 ')
                        // Assignment operators
                        .replace(/([\+\-\*\/\\^]=)/g, ' $1 ')
                        // Clean up multiple spaces
                        .replace(/\s+/g, ' ')
                        .trim();

                    // Add proper spacing around colons
                    if (line.endsWith(':')) {
                        line = line.slice(0, -1) + ': ';
                    }

                    // Format comments
                    if (line.includes('#')) {
                        const [code, comment] = line.split('#');
                        line = code.trim() + (code.trim() ? ' ' : '') + '#' + comment;
                    }

                    formattedLines.push(indent + line);

                    // Increase indent after lines ending with colon
                    if (line.endsWith(': ')) {
                        indentLevel++;
                    }
                }

                const start = new vscode.Position(0, 0);
                const end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
                const range = new vscode.Range(start, end);
                
                edits.push(new vscode.TextEdit(range, formattedLines.join('\n')));
                return edits;
            }
        })
    );

    // Print debug message when debugging starts
    context.subscriptions.push(
        vscode.debug.onDidStartDebugSession(() => {
            console.log('alif run');
        })
    );
}

function getHoverContent(word) {
    const documentation = {
        'اطبع': 'دالة للطباعة على الشاشة\n\nمثال:\nاطبع("مرحبا")',
        'ادخل': 'دالة لقراءة مدخلات المستخدم\n\nمثال:\nاسم = ادخل("ادخل اسمك: ")',
        'مدى': 'دالة تنشئ تسلسل من الأرقام\n\nمثال:\nلاجل س في مدى(5):\n    اطبع(س)',
        'طول': 'دالة تحسب طول النص أو القائمة\n\nمثال:\nنص = "مرحبا"\nاطبع(طول(نص))',
        'نوع': 'دالة تعيد نوع المتغير\n\nمثال:\nاطبع(نوع(5))',
        'صحيح': 'دالة تحول النص إلى رقم صحيح\n\nمثال:\nرقم = صحيح("123")',
        'عشري': 'دالة تحول النص إلى رقم عشري\n\nمثال:\nرقم = عشري("12.34")',
        'نص': 'دالة تحول القيمة إلى نص\n\nمثال:\nاطبع(نص(123))'
    };

    return documentation[word];
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};