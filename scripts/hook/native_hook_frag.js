var method_info = ''
var arg_dump = ''
var retval_dump = ''
var cell = ''
try{
	Interceptor.attach (Module.findExportByName ( "{{so_name}}", "{{method_name}}"), {
        onEnter: function (args) {
        	// Native hooking is weird; mannual tweaking ur script here please!
        	console.log("{{so_name}} - {{method_name}} - onEnter")
	        // arg_dump += ("arg" + index.toString() + ": " + String((Memory.readCString(args[index]))) + linebreak)
	        method_info += "{{so_name}} . {{method_name}}"  
    	},
        onLeave: function (retval) {
        	var retval_dump = String(Memory.readCString(retval)) + linebreak + "@ " + getTime()
	        cell = {"method_info" : method_info, "arg_dump" : arg_dump, "retval_dump" : retval_dump}
    	}
	});
}catch (err) {
	console.log(" cannot interecept this native function..")
}

