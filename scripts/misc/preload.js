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

        // console.log("[.] TrustManager Android < 7 detection...");
        // credit: https://codeshare.frida.re/@pcipolloni/universal-android-ssl-pinning-bypass-with-frida/
        // console.log("[+] Loading our CA...")
        cf = CertificateFactory.getInstance("X.509");
        
        try {
            var fileInputStream = FileInputStream.$new("/data/local/tmp/cert-der.crt");
        }
        catch(err) {
            console.log("[o] " + err);
        }

        bufferedInputStream = BufferedInputStream.$new(fileInputStream);
        var ca = cf.generateCertificate(bufferedInputStream);
        bufferedInputStream.close();

        var certInfo = Java.cast(ca, X509Certificate);
        // console.log("[o] Our CA Info: " + certInfo.getSubjectDN());

        // Create a KeyStore containing our trusted CAs
        // console.log("[+] Creating a KeyStore for our CA...");
        var keyStoreType = KeyStore.getDefaultType();
        var keyStore = KeyStore.getInstance(keyStoreType);
        keyStore.load(null, null);
        keyStore.setCertificateEntry("ca", ca);
        
        // Create a TrustManager that trusts the CAs in our KeyStore
        // console.log("[+] Creating a TrustManager that trusts the CA in our KeyStore...");
        var tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
        var tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
        tmf.init(keyStore);
        console.log("[+] Our TrustManager is ready...");

        // console.log("[+] Hijacking SSLContext methods now...")
        // console.log("[-] Waiting for the app to invoke SSLContext.init()...")

        try{
            SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").implementation = function(a,b,c) {
            console.log("[o] App invoked javax.net.ssl.SSLContext.init...");
            SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").call(this, a, tmf.getTrustManagers(), c);
            console.log("[+] SSLContext initialized with our custom TrustManager!");
        }
        }catch (err) {
            console.log("[-] TrustManager Not Found");
        }
       

        //-------
        // OkHTTP v3.x
        // Wrap the logic in a try/catch as not all applications will have
        // okhttp as part of the app.

        // credit: https://codeshare.frida.re/@masbog/frida-android-unpinning-ssl/
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
        // console.log("[.] Appcelerator Titanium detection...");
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


function setProxy(){
    Java.perform(function() {
        System_hook = Java.use("java.lang.System");

        var overloadz_System_hook = eval("System_hook.getProperty.overloads");
        var ovl_count_System_hook = overloadz_System_hook.length;
        var System_hook_getProperty_hook = null
        
                
        for (var i = 0; i < ovl_count_System_hook; i++) {
            System_hook_getProperty_hook = eval('System_hook.getProperty.overloads[i]')
            System_hook_getProperty_hook.implementation = function () {
             
                // var retval = eval('this.getProperty.apply(this, arguments)')
                try {
                    retval = eval('this.getProperty.apply(this, arguments)')
                    console.log(arguments[0])
                    if (arguments[0] == 'https.proxyHost' || arguments[0] == 'http.proxyHost'){
                        retval = '127.0.0.1'
                    }else if(arguments[0] == 'https.proxyPort' || arguments[0] == 'https.proxyPort'){
                        retval = '8080'
                    }
                } catch (err) {
                    retval = null
                    console.log("Exception - cannot compute retval.." + String(err))
                }
                console.log(retval)

                return retval;
            }
        }
        
    });
}

try {
    Java.perform(function() {
        // var mainapp = Java.use('com.ha0k3.overloads.Testapp');
        var mainapp = Java.use('{{application_name}}');
        // console.log(String(mainapp)) 
        console.log("In da house..preload.js")
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

        {% if PRELOAD_SETPROXY %}
        console.log("[FRIDA]PRELOAD_SETPROXY...")
        setProxy()
        {% endif %}
    });
} catch (err) {
    console.log("Caught loadStetho exception: => " + err);
}