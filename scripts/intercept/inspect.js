var sendback = { "methodInfo": [] }
var cell = null
var inspect_signature = "-whatisth1smeth0d-"
setTimeout(function() {
    Java.perform(function() {
        {{clazz_hook}} = Java.use("{{clazz_name}}");
        var overloadz_{{clazz_hook}} = eval("{{clazz_hook}}.{{method_name}}.overloads");
        var ovl_count_{{clazz_hook}} = overloadz_{{clazz_hook}}.length;

        for (var i = 0; i < ovl_count_{{clazz_hook}}; i++) {
            {{ method_hook }} = eval('{{clazz_hook}}.{{ method_name }}.overloads[i]')
            var arg_dump = ''
            var arg_type = []
            var ret_type = {{ method_hook }}.returnType['className']

            for (var index = 0; index < {{ method_hook }}.argumentTypes.length; index++) {
                arg_type.push({{ method_hook }}.argumentTypes[index]["className"])
            }

            cell = { "Arg": JSON.stringify(arg_type), "Return Value": JSON.stringify(ret_type) }
            sendback.methodInfo.push(cell)
            }

            send(inspect_signature + JSON.stringify(sendback))
    });
}, 0);