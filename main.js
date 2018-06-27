const codeGenerator = require('./code-generator')

function getOptions() {
    return {
        jsonDoc: app.preferences.get('json.gen.jsonDoc'),
        useTab: app.preferences.get('json.gen.useTab'),
        indentSpaces: app.preferences.get('json.gen.indentSpaces')
    }
}

function _handleGenerate(base, path, options) {
    options = options || getOptions()
    var diagrams = app.repository.select("@UMLDiagram");
    if (!base) {
        app.elementListPickerDialog.showDialog('Select an UML Class Diagram to generate JSon data', diagrams).then(function({
            buttonId,
            returnValue
        }) {
            if (buttonId === 'ok') {
                base = returnValue._parent;

                if (!path) {
                    var files = app.dialogs.showOpenDialog('Select a folder where generated codes to be located', null, null, { properties: ['openDirectory'] })
                    if (files && files.length > 0) {
                        path = files[0]
                        codeGenerator.generate(base, path, options)
                    }
                } else {
                    codeGenerator.generate(base, path, options)
                }
            }
        })
    } else {
        if (!path) {
            var files = app.dialogs.showOpenDialog('Select a folder where generated codes to be located', null, null, {
                properties: ['openDirectory']
            })
            if (files && files.length > 0) {
                path = files[0]
                codeGenerator.generate(base, path, options)
            }
        } else {
            codeGenerator.generate(base, path, options)
        }
    }
}

function _handleGenerateFromDiagram(path, options) {
    var base = app.workingDiagrams.diagramManager.diagramEditor.diagram._parent;
    _handleGenerate(base, path, options);
}

function _handleConfigure() {
    app.commands.execute('application:preferences', 'json')
}

function init() {
    app.commands.register('json:generate', _handleGenerate)
    app.commands.register('json:generateFromDiagram', _handleGenerateFromDiagram)
    app.commands.register('json:configure', _handleConfigure)
}

exports.init = init