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

function sslstrip() {
    // credit: https://codeshare.frida.re/@masbog/frida-android-unpinning-ssl/
    Java.perform(function() {
        console.log("[.] Android Cert Pinning Bypass");

        var CertificateFactory = Java.use("java.security.cert.CertificateFactory");
        var FileInputStream = Java.use("java.io.FileInputStream");
        var BufferedInputStream = Java.use("java.io.BufferedInputStream");
        var X509Certificate = Java.use("java.security.cert.X509Certificate");
        var KeyStore = Java.use("java.security.KeyStore");
        var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
        var SSLContext = Java.use("javax.net.ssl.SSLContext");
        var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        
        try {
            var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
            
            TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                console.log("[+] (Android 7+) TrustManagerImpl verifyChain() called. Not throwing an exception.");
                // Skip all the logic and just return the chain again :P
                //is_android_n = 1;
                return untrustedChain;
            }

            PinningTrustManager.checkServerTrusted.implementation = function() {
                console.log("[+] Appcelerator checkServerTrusted() called. Not throwing an exception.");
            }
        } catch (err) {
            console.log("[-] TrustManagerImpl Not Found");
        }

        //if (is_android_n === 0) {
        //--------
        console.log("[.] TrustManager Android < 7 detection...");
        // Implement a new TrustManager
        // ref: https://gist.github.com/oleavr/3ca67a173ff7d207c6b8c3b0ca65a9d8
        var TrustManager = Java.registerClass({
            name: 'com.house.TrustManager',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function(chain, authType) {},
                checkServerTrusted: function(chain, authType) {},
                getAcceptedIssuers: function() {
                    return [];
                }
            }
        });

        // Prepare the TrustManagers array to pass to SSLContext.init()
        var TrustManagers = [TrustManager.$new()];

        // Get a handle on the init() on the SSLContext class
        var SSLContext_init = SSLContext.init.overload(
            '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom');

        try {
            // Override the init method, specifying our new TrustManager
            SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
                console.log("[+] Overriding SSLContext.init() with the custom TrustManager android < 7");
                SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
            };
        } catch (err) {
            console.log("[-] TrustManager Not Found");
        }
        //}

        //-------
        // OkHTTP v3.x
        // Wrap the logic in a try/catch as not all applications will have
        // okhttp as part of the app.
        try {
            var CertificatePinner = Java.use('okhttp3.CertificatePinner');
            console.log("[+] OkHTTP 3.x Found");
            CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function() {
                console.log("[+] OkHTTP 3.x check() called. Not throwing an exception.");
            };
        } catch (err) {
            // If we dont have a ClassNotFoundException exception, raise the
            // problem encountered.
            console.log("[-] OkHTTP 3.x Not Found")
        }

        //--------
        console.log("[.] Appcelerator Titanium detection...");
        // Appcelerator Titanium PinningTrustManager
        // Wrap the logic in a try/catch as not all applications will have
        // appcelerator as part of the app.
        try {
            var PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
            console.log("[+] Appcelerator Titanium Found");
            PinningTrustManager.checkServerTrusted.implementation = function() {
                console.log("[+] Appcelerator checkServerTrusted() called. Not throwing an exception.");
            }

        } catch (err) {
            // If we dont have a ClassNotFoundException exception, raise the
            // problem encountered.
            console.log("[-] Appcelerator Titanium Not Found");
        }

    });
}

try {
    Java.perform(function() {
        // var mainapp = Java.use('com.ha0k3.overloads.Testapp');
        var mainapp = Java.use('{{application_name}}');
        // console.log(String(mainapp)) 
        console.log("[FRIDA]PRELOAD...")
        {% if PRELOAD_STETHO %}

        mainapp.onCreate.implementation = function() {
            this.onCreate();
            loadStetho();
            console.log("[*]Stetho is running")

        };

        {% endif %}

        {% if PRELOAD_SSLSTRIP %}
        console.log("[FRIDA]PRELOAD_SSLSTRIP...")
        sslstrip()
        {% endif %}
    });
} catch (err) {
    console.log("Caught loadStetho exception: => " + err);
}