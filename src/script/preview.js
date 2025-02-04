try {
    const data = JSON.parse(document.head.querySelector('meta[id="vscode-alif-preview-data"]').getAttribute('data-state'))
    if (typeof data.resource === 'string') {
        if (data.resource.match(/\.rtl\.alif$/)) {
            document.body.classList.add('vscode-body--rtl')
        }
    }
} catch (e) {
    console.log(e)
}
