		try{
			var {{clazz_hook}} = Java.use("{{clazz_name}}");
			var overloadz_{{clazz_hook}} = eval("{{clazz_hook}}.{{method_name}}.overloads");
			var ovl_count_{{clazz_hook}} = overloadz_{{clazz_hook}}.length;
			

			var cell = {}

			for (var i = 0; i < ovl_count_{{clazz_hook}}; i++) {
				var {{clazz_hook}}_{{ method_hook }} = {{clazz_hook}}.{{ method_name }}.overloads[i]
			    {{clazz_hook}}_{{ method_hook }}.implementation = function () {
			    	var sendback = ''
			    	var method_info = ''
			    	var arg_dump = ''
			    	var arg_type = ''
			    	var ret_type = String({{clazz_hook}}_{{ method_hook }}.returnType['className'])
			    	var retval = null

			        for (var index = 0; index < arguments.length; index++) {
			        	arg_type += ('argType' + index.toString() + " : " + String(typeof(arguments[index])) + ' ')
			        	arg_dump += ("arg" + index.toString() + ": " + String(arguments[index]) + linebreak)
			        }
			        method_info += getCaller() + linebreak + {{clazz_hook}}_{{ method_hook }}.methodName + '( ' + arg_type+ ') '
			        // method_info += {{clazz_hook}}_{{ method_hook }}.methodName + '( ' + arg_type+ ') '

			        // var retval = eval('this.{{ method_name }}.apply(this, arguments)')
			        try {
			        	{% if instruction %}
				        console.log("[Monitor]..")
				        {{instruction}}
				        {% endif %}
				        if (retval == null){
			                retval = eval('this.{{ method_name }}.apply(this, arguments)')
				        }
		            } catch (err) {
		                retval = null
		                console.log("Exception - cannot compute retval.." + String(err))
		            }
			        var retval_dump = "(" + ret_type + ') : ' + String(retval) + linebreak + "@ " + getTime()
			        cell = {"monitor_type": "{{monitor_type}}", "method_info" : method_info, "arg_dump" : arg_dump, "retval_dump" : retval_dump}

			        sendback = JSON.stringify(cell)
			        send(sendback)
			        return retval;
			    }
			}
		}catch(err){
			console.log("Caught Monitor exception: [{{clazz_hook}}.{{method_name}}] => " + err);
		}
		


