function getTime(){

    var date = new Date();
    var ret = '';
    ret = date.getHours().toString() + ":" + date.getMinutes().toString() + ":" + date.getSeconds().toString() + ":" + date.getMilliseconds()

    return ret
}

setTimeout(function() {
    Java.perform(function() {
{{scripts}}
    });
}, 0);