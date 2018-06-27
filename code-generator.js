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
        this.package = pkg;
        this.name = elem.name;
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
        this.package = pkg;
        this.name = elem.name;
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
        this.package = pkg;
        this.name = elem.name;
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
        this.name = elem.name;
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
        this.name = elem.name;
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
    }

    generate(elem, outputPath, basePackage, options) {
        var pkgName, fullPath;

        if (elem instanceof type.UMLModel) {
            if (Array.isArray(elem.ownedElements)) {
                elem.ownedElements.forEach(child => {
                    return this.generate(child, outputPath, basePackage, options)
                })
            }
            return;
        }
        if (elem instanceof type.UMLPackage) {
            pkgName = this.joinPkgName(basePackage, elem);
            fullPath = path.join(outputPath, elem.name)
            this.onPreparePackageStart(fullPath);
            if (Array.isArray(elem.ownedElements)) {
                elem.ownedElements.forEach(child => {
                    return this.generate(child, fullPath, pkgName, options)
                })
            }
            this.onPreparePackageFinish(fullPath);
            return;
        }
        if (elem instanceof type.UMLClass) {
            this.writeClass(outputPath, basePackage, elem, options);
        } else if (elem instanceof type.UMLInterface) {
            this.writeInterface(outputPath, basePackage, elem, options);
        } else if (elem instanceof type.UMLEnumeration) {
            this.writeEnumeration(outputPath, basePackage, elem, options);
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

    onPreparePackageStart(pkgPath) {
        this.deleteFolderRecursive(pkgPath)
        fs.mkdirSync(pkgPath);
        var classPath = path.join(pkgPath, 'class.json');
        var interfacePath = path.join(pkgPath, 'interface.json');
        var enumPath = path.join(pkgPath, 'enum.json');
        fs.writeFileSync(classPath, '[', { flag: 'a+' })
        fs.writeFileSync(interfacePath, '[', { flag: 'a+' })
        fs.writeFileSync(enumPath, '[', { flag: 'a+' })
    }

    onPreparePackageFinish(pkgPath) {
        var classPath = path.join(pkgPath, 'class.json');
        var interfacePath = path.join(pkgPath, 'interface.json');
        var enumPath = path.join(pkgPath, 'enum.json');
        if (fs.statSync(classPath).size == 1) {
            fs.unlinkSync(classPath);
        } else {
            fs.writeFileSync(classPath, '\n]', { flag: 'a+' })
        }
        if (fs.statSync(interfacePath).size == 1) {
            fs.unlinkSync(interfacePath);
        } else {
            fs.writeFileSync(interfacePath, '\n]', { flag: 'a+' })
        }
        if (fs.statSync(enumPath).size == 1) {
            fs.unlinkSync(enumPath);
        } else {
            fs.writeFileSync(enumPath, '\n]', { flag: 'a+' })
        }
        fs.readdir(pkgPath, function(err, files) {
            if (!err && !files.length) {
                fs.rmdirSync(pkgPath);
            }
        });
    }

    appentToFileAsJsonRecord(filePath, obj) {
        fs.writeFileSync(filePath, '\n' + JSON.stringify(obj) + ',', {
            flag: 'a+'
        })
    }

    writeClass(basePath, pkgName, elem, options) {
        var fullPath = path.join(basePath, 'class.json');
        var obj = new JSonClass(pkgName, elem)
        this.appentToFileAsJsonRecord(fullPath, obj)
    }

    writeInterface(basePath, pkgName, elem, options) {
        var fullPath = path.join(basePath, 'interface.json');
        var obj = new JSonInterface(pkgName, elem)
        this.appentToFileAsJsonRecord(fullPath, obj)

    }

    writeEnumeration(basePath, pkgName, elem, options) {
        var fullPath = path.join(basePath, 'enum.json');
        var obj = new JSonEnum(pkgName, elem)
        this.appentToFileAsJsonRecord(fullPath, obj)

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