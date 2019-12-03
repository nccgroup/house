function miniLog(methodname, arg_type, arg_dump){
    console.log('[+]' + methodname + "(" + arg_type + ")")
    console.log(arg_dump)
}

setTimeout(function() {
    Java.perform(function() {
    	console.log("In da house..hook_tpl_mini.js\n")
{{scripts}}
    });
}, 0);

{{native_scripts}}