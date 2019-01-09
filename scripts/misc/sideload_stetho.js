function loadStetho() {
    Java.perform(function() {

        // get handles to the classes   
        const ActivityThread = Java.use("android.app.ActivityThread");
        const File = Java.use('java.io.File');
        const DexClassLoader = Java.use("dalvik.system.DexClassLoader");
        const ClassLoader = Java.use("java.lang.ClassLoader");
        const Class = Java.use("java.lang.Class")
        const InputStreamReader = Java.use("java.io.InputStreamReader");
        const InputStream = Java.use("java.io.InputStream");
        const BufferedReader = Java.use("java.io.BufferedReader");
        const Class = Java.use("java.lang.Class");
        const class_Object = Java.use("java.lang.Object");
        const ZipFile = Java.use("java.util.zip.ZipFile")

        var jarFile = File.$new("/data/local/tmp/stetho.jar");
        var application = ActivityThread.currentApplication();
        var context = application.getApplicationContext();
        console.log(String(context))
        var fileAbsPath = jarFile.getAbsolutePath();


        var classloader = DexClassLoader.$new(fileAbsPath, context.getCacheDir().getAbsolutePath().toString(), null, application.getClassLoader());

        //load stetho.jar classes

        var Stetho = classloader.loadClass("com.facebook.stetho.Stetho", true);
        var StethoCast = Java.cast(Stetho, Class);
        var Stetho_methods = StethoCast.getDeclaredMethods();

        var func_initializeWithDefaults = null;
        for (i = 0; i < Stetho_methods.length; i++) {
            if (Stetho_methods[i].getName() == "initializeWithDefaults") {
                func_initializeWithDefaults = Stetho_methods[i];
                // Found: public static void com.facebook.stetho.Stetho.initializeWithDefaults(android.content.Context)
                console.log(Stetho_methods[i].getName())
                break;
            }
            // console.log("Did not find initializeWithDefaults..");

        }

        if (func_initializeWithDefaults) {
            func_initializeWithDefaults.setAccessible(true);
            func_initializeWithDefaults.invoke(null, [context]);
        }
    });
}


Java.perform(function() {
    // var mainapp = Java.use('com.ha0k3.overloads.Testapp');
    var mainapp = Java.use('{{application_name}}');
    console.log(String(mainapp))
    try {
        mainapp.onCreate.implementation = function() {
            this.onCreate();
            loadStetho();
            console.log("[*]Stetho is running")

        };
    } catch (err) {
        console.log("Caught loadStetho exception: => " + err);
    }
});