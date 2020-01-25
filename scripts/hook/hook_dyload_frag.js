        // begin dyload hook {{dyload_path}}
        var DexClassLoader = Java.use("dalvik.system.DexClassLoader");
        {% if dynamicHookOption == "existing" %}
        // experimental only
        Java.enumerateClassLoaders({
            onMatch: function (loader) {
                if (String(loader).includes("{{dyload_path}}"))
                {
                    var factory = Java.ClassFactory.get(active_classloader)
                    {{hook_frag_script}}
                }
            },
            onComplete: function () {
            }
        });
        {% elif dynamicHookOption == "new" %}
        // Use with caution: more overhead
        DexClassLoader.loadClass.overload('java.lang.String').implementation = function () {
            var ret_class = this.loadClass.apply(this, arguments);
            if (String(this).includes("{{dyload_path}}")) {
                var active_classloader = ret_class.getClassLoader();
                var factory = Java.ClassFactory.get(active_classloader)
                    {{hook_frag_script}}
            }
            return ret_class
        };

        {% else %}
        Java.enumerateClassLoaders({
            onMatch: function (loader) {
                if (String(loader).includes("{{dyload_path}}"))
                {
                    var orig_cl = Java.classFactory.loader;
                    Java.classFactory.loader = loader;
                    {{hook_frag_script}}
                    Java.classFactory.loader = orig_cl
                }

            },
            onComplete: function () {
            }
        });
        // Hook existing instance of DexClassLoader
        // Experiment use only
        var ClassLoader = Java.classFactory.use('java.lang.ClassLoader');

        DexClassLoader.loadClass.overload('java.lang.String').implementation = function () {
            var ret_class = this.loadClass.apply(this, arguments);
            if (String(this).includes("{{dyload_path}}")) {
                var active_classloader = ret_class.getClassLoader();
                var factory = Java.ClassFactory.get(active_classloader)
                    {{hook_frag_script}}
            }
            return ret_class
        };
        {% endif %}
        // end dyload hook