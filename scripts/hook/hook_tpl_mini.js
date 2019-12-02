function miniLog(methodname, arg_dump, index){
	index = (typeof index !== 'undefined') ? index : 0
    console.log('[+]' + methodname + "[" + String(index) + "] invoked")
    console.log(arg_dump)
}

setTimeout(function() {
    Java.perform(function() {
    	console.log("In da house..hook_tpl_mini.js\n")
{{scripts}}
    });
}, 0);

{{native_scripts}}