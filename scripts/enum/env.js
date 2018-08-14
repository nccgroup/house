var context = null
var env_signature = "t3llm3mor3ab0ut1t"

Java.perform(function() {
    console.log("In da house..getting env..")
    var ActivityThread = Java.use('android.app.ActivityThread');

    var app = ActivityThread.currentApplication();
    // Inspired by https://github.com/sensepost/objection
    if (app != null){
        context = app.getApplicationContext();
        var data = {
            filesDirectory: context.getFilesDir().getAbsolutePath().toString(),
            cacheDirectory: context.getCacheDir().getAbsolutePath().toString(),
            externalCacheDirectory: context.getExternalCacheDir().getAbsolutePath().toString(),
            codeCacheDirectory: 'getCodeCacheDir' in context ? context.getCodeCacheDir().getAbsolutePath().toString() : 'N/A',
            obbDir: context.getObbDir().getAbsolutePath().toString(),
            packageCodePath: context.getPackageCodePath().toString()
        };

        send(env_signature + JSON.stringify(data))
    }else{
        console.log("Hooked too early, no context yet!")
    }
    
});

