		{{clazz_hook}} = Java.use("{{clazz_name}}");
		var overloadz_{{clazz_hook}} = eval("{{clazz_hook}}.{{method_name}}.overloads");
		var ovl_count_{{clazz_hook}} = overloadz_{{clazz_hook}}.length;
		var linebreak = "h0us3l1nebr3ak"
		var cell = {}

		send("There are " + ovl_count_{{clazz_hook}}.toString() + " methods to hook");
		for (var i = 0; i < ovl_count_{{clazz_hook}}; i++) {
			{{ method_hook }} = eval('{{clazz_hook}}.{{ method_name }}.overloads[i]')
		    {{ method_hook }}.implementation = function () {
		    	var sendback = ''
		    	var hook_signature = '-hoo00ook-'
		    	var method_info = ''
		    	var arg_dump = ''
		    	var arg_type = ''
		    	var ret_type = String({{ method_hook }}.returnType['className'])

		        for (var index = 0; index < arguments.length; index++) {
		        	arg_type += ('argType' + index.toString() + " : " + String(typeof(arguments[index])) + ' ')
		        	arg_dump += ("arg" + index.toString() + ": " + String(arguments[index]) + linebreak)
		        }
		        method_info += {{ method_hook }}.methodName + '( ' + arg_type+ ') '
		        // var retval = eval('this.{{ method_name }}.apply(this, arguments)')
		        try {
	                retval = eval('this.{{ method_name }}.apply(this, arguments)')
	            } catch (err) {
	                retval = null
	                console.log("Exception - cannot compute retval.." + JSON.stringify(err))
	            }
		        var retval_dump = "(" + ret_type + ') : ' + JSON.stringify(retval)
		        cell = {"method_info" : method_info, "arg_dump" : arg_dump, "retval_dump" : retval_dump}

		        sendback = hook_signature + JSON.stringify(cell)
		        console.log(retval_dump);
		        send(sendback)
		        return retval;
		    }
		}


