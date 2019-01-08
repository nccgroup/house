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

setTimeout(function() {
    Java.perform(function() {
    	clazz_Thread = Java.use("java.lang.Thread");

    	// {"classname":"android.content.Context","methodname":"openFileOutput"}
		Context_hook = Java.use("android.content.Context");
		var overloadz_Context_hook = eval("Context_hook.openFileOutput.overloads");
		var ovl_count_Context_hook = overloadz_Context_hook.length;
		

		var cell = {}
		for (var i = 0; i < ovl_count_Context_hook; i++) {
			Context_hook_openFileOutput_hook = eval('Context_hook.openFileOutput.overloads[i]')
		    Context_hook_openFileOutput_hook.implementation = function () {
		    	var sendback = ''

		    	var method_info = ''
		    	var arg_dump = ''
		    	var arg_type = ''
		    	var ret_type = String(Context_hook_openFileOutput_hook.returnType['className'])

		        for (var index = 0; index < arguments.length; index++) {
		        	arg_type += ('argType' + index.toString() + " : " + String(typeof(arguments[index])) + ' ')
		        	arg_dump += ("arg" + index.toString() + ": " + String(arguments[index]) + linebreak)
		        }
		        method_info += "Reverse Call Stack: " + linebreak + getCaller() + linebreak + linebreak + Context_hook_openFileOutput_hook.methodName + '( ' + arg_type+ ') '
		        // var retval = eval('this.openFileOutput.apply(this, arguments)')
		        try {
	                retval = eval('this.openFileOutput.apply(this, arguments)')
	            } catch (err) {
	                retval = null
	                console.log("Exception - cannot compute retval.." + String(err))
	            }
		        var retval_dump = "(" + ret_type + ') : ' + String(retval) + linebreak + "@ " + getTime()
		        cell = {"montype": "file_io", "method_info" : method_info, "arg_dump" : arg_dump, "retval_dump" : retval_dump}

		        console.log(JSON.stringify(cell))
		        // sendback = hook_signature + JSON.stringify(cell)
		        // console.log(arg_dump + retval_dump);
		        // send(sendback)
		        return retval;
		    }
		}


// Added Hook 
		File_hook = Java.use("java.io.File");
		var overloadz_File_hook = eval("File_hook.$init.overloads");
		var ovl_count_File_hook = overloadz_File_hook.length;
		

		var cell = {}

		send("There are " + ovl_count_File_hook.toString() + " methods to hook");
		for (var i = 0; i < ovl_count_File_hook; i++) {
			File_hook_$init_hook = eval('File_hook.$init.overloads[i]')
		    File_hook_$init_hook.implementation = function () {
		    	var sendback = ''
		    	var hook_signature = '-hoo00ook-'
		    	var method_info = ''
		    	var arg_dump = ''
		    	var arg_type = ''
		    	var ret_type = String(File_hook_$init_hook.returnType['className'])

		        for (var index = 0; index < arguments.length; index++) {
		        	arg_type += ('argType' + index.toString() + " : " + String(typeof(arguments[index])) + ' ')
		        	arg_dump += ("arg" + index.toString() + ": " + String(arguments[index]) + linebreak)
		        }
		        method_info += "Reverse Call Stack: " + linebreak + getCaller() + linebreak + linebreak + File_hook_$init_hook.methodName + '( ' + arg_type+ ') '
		        // var retval = eval('this.$init.apply(this, arguments)')
		        try {
	                retval = eval('this.$init.apply(this, arguments)')
	            } catch (err) {
	                retval = null
	                console.log("Exception - cannot compute retval.." + String(err))
	            }
		        var retval_dump = "(" + ret_type + ') : ' + String(retval) + linebreak + "@ " + getTime()
		        cell = {"method_info" : method_info, "arg_dump" : arg_dump, "retval_dump" : retval_dump}

		        sendback = hook_signature + JSON.stringify(cell)
		        // console.log(arg_dump + retval_dump);
		        send(sendback)
		        return retval;
		    }
		}


// Added Hook 
		File_hook = Java.use("java.io.File");
		var overloadz_File_hook = eval("File_hook.createTempFile.overloads");
		var ovl_count_File_hook = overloadz_File_hook.length;
		

		var cell = {}

		send("There are " + ovl_count_File_hook.toString() + " methods to hook");
		for (var i = 0; i < ovl_count_File_hook; i++) {
			File_hook_createTempFile_hook = eval('File_hook.createTempFile.overloads[i]')
		    File_hook_createTempFile_hook.implementation = function () {
		    	var sendback = ''
		    	var hook_signature = '-hoo00ook-'
		    	var method_info = ''
		    	var arg_dump = ''
		    	var arg_type = ''
		    	var ret_type = String(File_hook_createTempFile_hook.returnType['className'])

		        for (var index = 0; index < arguments.length; index++) {
		        	arg_type += ('argType' + index.toString() + " : " + String(typeof(arguments[index])) + ' ')
		        	arg_dump += ("arg" + index.toString() + ": " + String(arguments[index]) + linebreak)
		        }
		        method_info += "Reverse Call Stack: " + linebreak + getCaller() + linebreak + linebreak + File_hook_createTempFile_hook.methodName + '( ' + arg_type+ ') '
		        // var retval = eval('this.createTempFile.apply(this, arguments)')
		        try {
	                retval = eval('this.createTempFile.apply(this, arguments)')
	            } catch (err) {
	                retval = null
	                console.log("Exception - cannot compute retval.." + String(err))
	            }
		        var retval_dump = "(" + ret_type + ') : ' + String(retval) + linebreak + "@ " + getTime()
		        cell = {"method_info" : method_info, "arg_dump" : arg_dump, "retval_dump" : retval_dump}

		        sendback = hook_signature + JSON.stringify(cell)
		        // console.log(arg_dump + retval_dump);
		        send(sendback)
		        return retval;
		    }
		}


// Added Hook 
		FileWriter_hook = Java.use("java.io.FileWriter");
		var overloadz_FileWriter_hook = eval("FileWriter_hook.$init.overloads");
		var ovl_count_FileWriter_hook = overloadz_FileWriter_hook.length;
		

		var cell = {}

		send("There are " + ovl_count_FileWriter_hook.toString() + " methods to hook");
		for (var i = 0; i < ovl_count_FileWriter_hook; i++) {
			FileWriter_hook_$init_hook = eval('FileWriter_hook.$init.overloads[i]')
		    FileWriter_hook_$init_hook.implementation = function () {
		    	var sendback = ''
		    	var hook_signature = '-hoo00ook-'
		    	var method_info = ''
		    	var arg_dump = ''
		    	var arg_type = ''
		    	var ret_type = String(FileWriter_hook_$init_hook.returnType['className'])

		        for (var index = 0; index < arguments.length; index++) {
		        	arg_type += ('argType' + index.toString() + " : " + String(typeof(arguments[index])) + ' ')
		        	arg_dump += ("arg" + index.toString() + ": " + String(arguments[index]) + linebreak)
		        }
		        method_info += "Reverse Call Stack: " + linebreak + getCaller() + linebreak + linebreak + FileWriter_hook_$init_hook.methodName + '( ' + arg_type+ ') '
		        // var retval = eval('this.$init.apply(this, arguments)')
		        try {
	                retval = eval('this.$init.apply(this, arguments)')
	            } catch (err) {
	                retval = null
	                console.log("Exception - cannot compute retval.." + String(err))
	            }
		        var retval_dump = "(" + ret_type + ') : ' + String(retval) + linebreak + "@ " + getTime()
		        cell = {"method_info" : method_info, "arg_dump" : arg_dump, "retval_dump" : retval_dump}

		        sendback = hook_signature + JSON.stringify(cell)
		        // console.log(arg_dump + retval_dump);
		        send(sendback)
		        return retval;
		    }
		}


// Added Hook 
		FileWriter_hook = Java.use("java.io.FileWriter");
		var overloadz_FileWriter_hook = eval("FileWriter_hook.write.overloads");
		var ovl_count_FileWriter_hook = overloadz_FileWriter_hook.length;
		

		var cell = {}

		send("There are " + ovl_count_FileWriter_hook.toString() + " methods to hook");
		for (var i = 0; i < ovl_count_FileWriter_hook; i++) {
			FileWriter_hook_write_hook = eval('FileWriter_hook.write.overloads[i]')
		    FileWriter_hook_write_hook.implementation = function () {
		    	var sendback = ''
		    	var hook_signature = '-hoo00ook-'
		    	var method_info = ''
		    	var arg_dump = ''
		    	var arg_type = ''
		    	var ret_type = String(FileWriter_hook_write_hook.returnType['className'])

		        for (var index = 0; index < arguments.length; index++) {
		        	arg_type += ('argType' + index.toString() + " : " + String(typeof(arguments[index])) + ' ')
		        	arg_dump += ("arg" + index.toString() + ": " + String(arguments[index]) + linebreak)
		        }
		        method_info += "Reverse Call Stack: " + linebreak + getCaller() + linebreak + linebreak + FileWriter_hook_write_hook.methodName + '( ' + arg_type+ ') '
		        // var retval = eval('this.write.apply(this, arguments)')
		        try {
	                retval = eval('this.write.apply(this, arguments)')
	            } catch (err) {
	                retval = null
	                console.log("Exception - cannot compute retval.." + String(err))
	            }
		        var retval_dump = "(" + ret_type + ') : ' + String(retval) + linebreak + "@ " + getTime()
		        cell = {"method_info" : method_info, "arg_dump" : arg_dump, "retval_dump" : retval_dump}

		        sendback = hook_signature + JSON.stringify(cell)
		        // console.log(arg_dump + retval_dump);
		        send(sendback)
		        return retval;
		    }
		}


// Added Hook 

    });
}, 0);

