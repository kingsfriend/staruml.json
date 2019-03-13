const fs = require('fs')
const path = require('path')

/**
 * JSonClass
 */
class JSonClass {
    /**
     * @constructor
     */
    constructor(pkg, elem) {
        var i, len;
        var operations = []
        var attributes = []
        for (i = 0, len = elem.attributes.length; i < len; i++) {
            attributes.push(new JSonAttribute(elem.attributes[i]));
        }
        for (i = 0, len = elem.operations.length; i < len; i++) {
            operations.push(new JSonOperation(elem.operations[i]));
        }
        var elemName = elem.name;
        var name = (String(elemName).match(/^[^\{]+/) || [''])[0].replace('*', '').replace(/\s+/, ''),
            tags = (String(elemName).match(/\{[^\}]+/) || [''])[0].replace('{', '').replace('}', '');
        this.tags = tags;
        this.name = name;
        this.stereotype = elem.stereotype;
        this.visibility = elem.visibility;
        this.isAbstract = elem.isAbstract;
        this.operations = operations;
        this.attributes = attributes;

    }
}

/**
 * JSonEnum
 */
class JSonEnum {
    /**
     * @constructor
     */
    constructor(pkg, elem) {
        var i, len;
        var literals = []
        for (i = 0, len = elem.literals.length; i < len; i++) {
            literals.push(elem.literals[i].name);
        }
        this.name = elem.name.replace(/\s+/, '');
        this.visibility = elem.visibility;
        this.literals = literals;

    }
}

/**
 * JSonInterface
 */
class JSonInterface {
    /**
     * @constructor
     */
    constructor(pkg, elem) {
        var i, len;
        var operations = []
        var attributes = []
        for (i = 0, len = elem.attributes.length; i < len; i++) {
            attributes.push(new JSonAttribute(elem.attributes[i]));
        }
        for (i = 0, len = elem.operations.length; i < len; i++) {
            operations.push(new JSonOperation(elem.operations[i]));
        }
        this.name = elem.name.replace(/\s+/, '');
        this.visibility = elem.visibility;
        this.isAbstract = elem.isAbstract;
        this.operations = operations;
        this.attributes = attributes;
    }
}

/**
 * JSonAttribute
 */
class JSonAttribute {
    /**
     * @constructor
     */
    constructor(elem) {
        var elemType = elem.type;
        var type = (String(elemType).match(/^[^\{]+/) || [''])[0].replace('*', '').replace(/\s+/, ''),
            tags = (String(elemType).match(/\{[^\}]+/) || [''])[0].replace('{', '').replace('}', ''),
            required = String(elemType).includes('*');
        this.type = type;
        this.tags = tags;
        this.required = required;
        this.name = elem.name.replace(/\s+/, '');
        this.visibility = elem.visibility;
        this.aggregation = elem.aggregation;
        this.defaultValue = elem.defaultValue;
        this.isReadOnly = elem.isReadOnly;
        this.isStatic = elem.isStatic;
        this.isUnique = elem.isUnique;
        this.visibility = elem.visibility;
    }
}

/**
 * JSonAttribute
 */
class JSonOperation {
    /**
     * @constructor
     */
    constructor(elem) {
        this.name = elem.name.replace(/\s+/, '');
        this.visibility = elem.visibility;
    }
}

/**
 * JSon Code Generator
 */
class JsonGenerator {

    constructor(baseModel, basePath) {
        this.baseModel = baseModel
        this.basePath = basePath
        this.basePackage = '';
        this.separators = {};
        this.arrays = {};
    }

    generate(elem, outputPath, basePackage, options) {
        var pkgName, fullPath;
        if (elem instanceof type.UMLClassDiagram) {
            if (Array.isArray(elem.ownedViews)) {
                var dirPath = outputPath + '/' + elem.name;
                var classPath = this.onPrepareFileStart(dirPath, 'class');
                var enumPath = this.onPrepareFileStart(dirPath, 'enum');
                elem.ownedViews.forEach(child => {
                    return this.generate(child.model, dirPath, basePackage, options)
                })
                this.onPrepareFileFinish(classPath,dirPath);
                this.onPrepareFileFinish(enumPath,dirPath);
            }
            return;
        }
        if (elem instanceof type.UMLClass) {
            return this.writeClass(outputPath, basePackage, elem, options);
        //} else if (elem instanceof type.UMLInterface) {
        //    return this.writeInterface(outputPath, basePackage, elem, options);
        } else if (elem instanceof type.UMLEnumeration) {
            return this.writeEnumeration(outputPath, basePackage, elem, options);
        }
    }

    onSuccess() {
        app.toast.info("Successfull Export.")
    }

    onFail(error) {
        app.toast.error(error)
    }

    joinPkgName(base, elem) {
        return base == null ? this.getElementName(elem) : base + "." + this.getElementName(elem);
    }

    deleteFolderRecursive(dirPath) {
        var me = this;
        if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach(function(file, index) {
                var curPath = dirPath + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    me.deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(dirPath);
        }
    }

    onPrepareFileStart(pkgPath, fileName) {
        if (!fs.existsSync(pkgPath) || !fs.lstatSync(pkgPath).isDirectory()) {
            fs.mkdirSync(pkgPath);
        }
        var classPath = path.join(pkgPath, fileName + '.json');
        if (fs.existsSync(classPath)) {
            fs.unlinkSync(classPath);
        }
        this.separators[classPath] = "";
        this.arrays[classPath] = [];
        return classPath;
    }

    onPrepareFileFinish(filePath, dirPath) {
        fs.writeFileSync(filePath, JSON.stringify(this.arrays[filePath], null, 4), {
            flag: 'a+'
        });
        const fileSize = fs.statSync(filePath).size;
        if(fileSize<=2){
            var logPath = dirPath+'/log.txt';
            fs.writeFileSync(logPath, 'Empty file: "'+filePath+'" deleted.\n', {
                flag: 'a+'
            });
            fs.unlinkSync(filePath);
        }
    }

    appentToFileAsJsonRecord(filePath, obj) {
        this.arrays[filePath].push(obj);
        /*var separator = this.separators[filePath];

        fs.writeFileSync(filePath, separator + JSON.stringify(obj), {
            flag: 'a+'
        })
        if (separator == "") {
            this.separators[filePath] = ",";
        }//*/
    }

    writeClass(basePath, pkgName, elem, options) {
        var fullPath = path.join(basePath, 'class.json');
        var obj = new JSonClass(pkgName, elem);
        this.appentToFileAsJsonRecord(fullPath, obj);
        return fullPath;
    }

    writeInterface(basePath, pkgName, elem, options) {
        var fullPath = path.join(basePath, 'interface.json');
        var obj = new JSonInterface(pkgName, elem)
        this.appentToFileAsJsonRecord(fullPath, obj)
        return fullPath;
    }

    writeEnumeration(basePath, pkgName, elem, options) {
        var fullPath = path.join(basePath, 'enum.json');
        var obj = new JSonEnum(pkgName, elem)
        this.appentToFileAsJsonRecord(fullPath, obj)
        return fullPath;
    }

    getElementName(elem) {
        return elem.name;
    }

    getElementModifiers(elem) {
        return
    }
}

function generate(baseModel, basePath, options) {
    var jsonGenerator = new JsonGenerator(baseModel, basePath)
    var basePackage = null;
    try {
        jsonGenerator.generate(baseModel, basePath, basePackage, options)
        jsonGenerator.onSuccess()
    } catch (error) {
        jsonGenerator.onFail(error)
    }
}

exports.generate = generate