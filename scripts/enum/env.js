var context = null
var env_signature = "t3llm3mor3ab0ut1t"

setTimeout(function() {
    Java.perform(function() {
        console.log("In da house..getting env..")
        var ActivityThread = Java.use('android.app.ActivityThread');

        var app = ActivityThread.currentApplication();
        context = app.getApplicationContext();

        // Inspired by https://github.com/sensepost/objection
        var data = {
            filesDirectory: context.getFilesDir().getAbsolutePath().toString(),
            cacheDirectory: context.getCacheDir().getAbsolutePath().toString(),
            externalCacheDirectory: context.getExternalCacheDir().getAbsolutePath().toString(),
            codeCacheDirectory: 'getCodeCacheDir' in context ? context.getCodeCacheDir().getAbsolutePath().toString() : 'N/A',
            obbDir: context.getObbDir().getAbsolutePath().toString(),
            packageCodePath: context.getPackageCodePath().toString()
        };

        send(env_signature + JSON.stringify(data))
    });
}, 0);