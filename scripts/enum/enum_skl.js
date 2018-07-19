// Script Inspired by https://github.com/0xdea/frida-scripts/tree/master/android-snippets
function enumAllClasses() {
    var allClasses = [];
    var classes = Java.enumerateLoadedClassesSync();

    classes.forEach(function(aClass) {
        try {
            // var className = aClass.match(/[L](.*);/)[1].replace(/\//g, ".");
            var className = aClass.replace(/\//g, ".");
        } catch (err) {}
        allClasses.push(className);
    });

    return allClasses;
}

function enumDexClasses(apk_path) {
    BaseDexClassLoader = Java.use("dalvik.system.BaseDexClassLoader");
    DexFile = Java.use("dalvik.system.DexFile");
    df = DexFile.$new(apk_path);
    en = df.entries()

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

        {% else %}
        console.log("Dont know what you want.")
	    sendback = " Error! "
        {% endif %}
        send(sendback)
    });
}, 0);