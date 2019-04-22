var clazz_Thread = null
var linebreak = "h0us3l1nebr3ak"
function getTime(){

    var date = new Date();
    var ret = '';
    ret = date.getHours().toString() + ":" + date.getMinutes().toString() + ":" + date.getSeconds().toString() + ":" + date.getMilliseconds()

    return ret
}

function getCaller(){
	return clazz_Thread.currentThread().getStackTrace().slice(2,17).reverse().toString().replace(/,/g,linebreak);
}

setTimeout(function() {
    Java.perform(function() {
    	clazz_Thread = Java.use("java.lang.Thread");
    	console.log("In da house..monitor_tpl.js")
{{scripts}}
    });
}, 0);
