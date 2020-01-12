var clazz_Thread = null
var linebreak = "h0us3l1nebr3ak"
function getTime(){
    var date = new Date();
    var ret = '';
    ret = date.getHours().toString() + ":" + date.getMinutes().toString() + ":" + date.getSeconds().toString() + ":" + date.getMilliseconds()
    return ret
}

function getCaller(){
	return clazz_Thread.currentThread().getStackTrace().slice(2,5).reverse().toString().replace(/,/g,linebreak);
}

function miniLog(methodname, arg_type, arg_dump, ret_type, retvar){
    console.log('[+]' + methodname + "(" + arg_type + ")")
    console.log("Return: (" + ret_type + ")" + retvar)
    console.log(arg_dump)
}

setTimeout(function() {
    Java.perform(function() {
    	console.log("In da house..hook_tpl.js")
    	clazz_Thread = Java.use("java.lang.Thread");
    	var DexClassLoader = Java.use("dalvik.system.DexClassLoader");
{{scripts}}
{{dyloadscript}}
    });
}, 0);

{{native_scripts}}
