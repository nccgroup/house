var retval = null
var ret_constructor = null
var tmp_obj = null
var fields = null
var clazz_Thread = null

function setRetval(ret){
    if (retval != null){
        retval = ret_constructor(ret);
        console.log("retval overriden..");
    }
    
}

function inspectObject(obj){
    tmp_obj = obj
    fields = Java.cast(tmp_obj.getClass(), clazz).getDeclaredFields();
    console.log("inspectObject ... ")
    return fields
}

function getStackTrace(){
    return clazz_Thread.currentThread().getStackTrace().toString().replace(/,/g, '\n')
}

setTimeout(function() {
    Java.perform(function() {
        // Get Java class wrappers

        {{clazz_hook}} = Java.use("{{clazz_name}}");
        clazz_Thread = Java.use("java.lang.Thread");
        clazz_Exception = Java.use("java.lang.Exception");
        clazz = Java.use("java.lang.Class");
        field = Java.use("java.lang.reflect.Field");
        BaseDexClassLoader = Java.use("dalvik.system.BaseDexClassLoader");
        var overloadz_{{clazz_hook}} = eval("{{clazz_hook}}.{{method_name}}.overloads");
        var ovl_count_{{clazz_hook}} = overloadz_{{clazz_hook}}.length;
        var intercept_signature = "-t1m3f0rm1tm-"
        var timestamp_signature = "-what1sth3t1m3n0w-"
        var repl_signature = "-can1hav3ash3ll-"

        var timestamp = Date.now()
        var recv_time = ''
        var recv_data = ''

        {{ method_hook }} = eval('{{clazz_hook}}.{{ method_name }}.overloads[{{overloadIndex}}]')

        {{ method_hook }}.implementation = function() {
            var sendback = ''
            args = arguments
            // retval = eval('this.{{ method_name }}.apply(this, arguments)')
            try {
                retval = eval('this.$init.apply(this, arguments)')
            } catch (err) {
                retval = null
                console.log("Exception - cannot compute retval.." + JSON.stringify(err))
            }
            if (retval != null){
                ret_constructor = retval.constructor;
            }
            sendback = intercept_signature + JSON.stringify(args) + timestamp_signature + timestamp
            send(sendback)

            while (true){
                var op = recv('input', function(value) {
                recv_time = value.time
                recv_data = value.payload
                recv_option = value.option
                // console.log("[App Recv]  " + recv_option + ": "+ recv_data + "at time: " + JSON.stringify(recv_time))
                });
                op.wait();

                if(recv_option == "terminate"){
                    break
                }
                else if(recv_option == "intercept_param"){
                    if (recv_time == timestamp){
                        var arg_len = args.length
                        recv_arg = JSON.parse(recv_data)
                        for (var i=0; i < arg_len; i++ ){
                            args[i] = args[i].constructor(recv_arg[i])
                        }
                        retval = eval('this.{{ method_name }}.apply(this, args)')
                        
                        console.log("[+ Frida ] Debug  retval being overwritten!" + JSON.stringify(typeof(retval)) + " : " + JSON.stringify(retval))
                        }else{
                            console.log("[Frida]Timestamp mismatch.." + JSON.stringify(timestamp) + ' vs ' + recv_time)
                            retval = eval('this.{{ method_name }}.apply(this, arguments)')
                        }
                        break  
                    }
                else{
                    try {
                        eval_result = String(eval(recv_data))
                        // console.log(eval_result)
                    } catch (err) {
                        eval_result = ''
                        console.log("Exception caught in frida.." + JSON.stringify(err))
                    }
                    eval_packet = {eval_input: recv_data, eval_output: eval_result, eval_time: recv_time}
                    send(repl_signature + JSON.stringify(eval_packet))  
                }
            }
            
            console.log(String(retval))
            return retval;
            }
            
    });
}, 0);


