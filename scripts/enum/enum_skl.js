// Script Inspired by https://github.com/0xdea/frida-scripts/tree/master/android-snippets
function enumAllClasses() {
    var allClasses = [];
    var classes = Java.enumerateLoadedClassesSync();

    classes.forEach(function(aClass) {
        try {
            var className = aClass.replace(/\//g, ".");
        } catch (err) {}
        allClasses.push(className);
    });

    return allClasses;
}

function enumClassLoaders(){
    var allClassLoaders = []
    var classLoaders = Java.enumerateClassLoadersSync()

    classLoaders.forEach(function(cl) {
        allClassLoaders.push(cl);
    });

    return allClassLoaders;
}

function enumDexClasses(apk_path) {
    var BaseDexClassLoader = Java.use("dalvik.system.BaseDexClassLoader");
    var DexFile = Java.use("dalvik.system.DexFile");
    var df = DexFile.$new(apk_path);
    var en = df.entries()

    var dexClasses = []
    while(en.hasMoreElements()){
        dexClasses.push(en.nextElement());
    }

    return dexClasses;
}

function findClasses(pattern) {
    var allClasses = enumAllClasses();
    var foundClasses = [];

    allClasses.forEach(function(aClass) {
        try {
            if (aClass.match(pattern)) {
                foundClasses.push(aClass);
            }
        } catch (err) {}
    });

    return foundClasses;
}

function enumMethods(targetClass) {
    var hook = Java.use(targetClass);
    var ownMethods = hook.class.getDeclaredMethods();
    hook.$dispose;

    return ownMethods;
}

function enumLibSo(lib_name){
    exports = Module.enumerateExportsSync(lib_name);
    var foundObj = []
    for(i=0; i<exports.length; i++){
        foundObj.push(String(exports[i].name) + " : " + String(exports[i].address))
    }
    return foundObj
}

setTimeout(function() {
    Java.perform(function() {
        var sendback = ''
        var classname_return = ''
        var methods_return = ''
        var enum_signature = '-enumMmMmMmMm-'
       
        {% if option == "enumAllClasses" %}
        // enumerate all classes
	    var a = enumAllClasses();
	    a.forEach(function(s) {
            if (s){classname_return += JSON.stringify(s) + '\n'}
	    });
        sendback = enum_signature + classname_return

        {% elif option == "enumClassLoaders" %}
        // enumerate all classes
	    var a = enumClassLoaders();
	    a.forEach(function(s) {
            if (s){classname_return += String(s) + '\n'}
	    });
        sendback = enum_signature + classname_return

        {% elif option == "enumDexClasses" and apk_path%}
        var a = enumDexClasses("{{ apk_path }}");        
        a.forEach(function(s) {
            if (s) { classname_return += String(s) + '\n' }
        });
        sendback = enum_signature + classname_return

	    {% elif option == "findClasses" and class_pattern%}
	    // find classes that match a pattern
	    var a = findClasses(/{{class_pattern}}/i);
	    a.forEach(function(s) { 
	    });
	    
        {% elif option == "enumClassMethods" and class_to_find%}
	    // enumerate all methods in a class   
	    var a = enumMethods("{{ class_to_find }}")
	    a.forEach(function(s) { 
            methods_return += String(s) + '\n'
	    });
        sendback = enum_signature + methods_return

        {% elif option == "enumLibSo" and class_to_find%}
        // enumerate all methods in a class   
        var a = enumLibSo("{{ class_to_find }}")
        a.forEach(function(s) { 
            methods_return += String(s) + '\n'
        });
        sendback = enum_signature + methods_return

        {% else %}
        console.log("Dont know what you want.")
	    sendback = " Error! "
        {% endif %}
        send(sendback)
    });
}, 0);