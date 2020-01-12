
			/* Begin: {{clazz_name}}.{{method_name}} */
			{% if is_dynamic %}
			var c_{{clazz_hook}} = factory.use("{{clazz_name}}");
			{% else %}
			var c_{{clazz_hook}} = Java.use("{{clazz_name}}");
			{% endif %}

			var overloadz_{{clazz_hook}} = eval("c_{{clazz_hook}}.{{method_name}}.overloads");
			var ovl_count_{{clazz_hook}} = overloadz_{{clazz_hook}}.length;
			var c_{{clazz_hook}}_{{ method_hook }} = null;

			{% if overload_type%}
			var c_{{clazz_hook}}_{{ method_hook }} = eval("c_{{clazz_hook}}.{{ method_name }}.overload({{overload_type}})");
			c_{{clazz_hook}}_{{ method_hook }}.implementation = function () {
				var method_info = '';
				var arg_dump = '';
				var arg_type = '';
				var ret_type = String(c_{{clazz_hook}}_{{ method_hook }}.returnType['className']);
				var retval = null;

				for (var index = 0; index < arguments.length; index++) {
					arg_type += ('argType' + index.toString() + " : " + String(typeof(arguments[index])) + ' ');
					arg_dump += ("arg" + index.toString() + ": " + String(arguments[index]) + '\n');
				}
				try {
					retval = eval('this.{{ method_name }}.apply(this, arguments)');
				} catch (err) {
					retval = null;
					console.log("Exception - cannot compute retval.." + String(err));
				}
				miniLog("{{clazz_name}}.{{method_name}}", String(arg_type), String(arg_dump), String(ret_type),String(retval));
				return retval;
			};
			{% else %}
			for (var i = 0; i < ovl_count_{{clazz_hook}}; i++) {
				var c_{{clazz_hook}}_{{ method_hook }} = eval('c_{{clazz_hook}}.{{ method_name }}.overloads[i]');
				c_{{clazz_hook}}_{{ method_hook }}.implementation = function () {
					var arg_dump = '';
					var arg_type = '';
					var ret_type = String(c_{{clazz_hook}}_{{ method_hook }}.returnType['className']);
					var retval = null;
					for (var index = 0; index < arguments.length; index++) {
						arg_type += ('argType' + index.toString() + " : " + String(typeof(arguments[index])) + ' ');
						arg_dump += ("arg" + index.toString() + ": " + String(arguments[index]) + '\n');
					}

					try {
						retval = eval('this.{{ method_name }}.apply(this, arguments)');
					} catch (err) {
						retval = null;
						console.log("Exception - cannot compute retval.." + String(err));
					}
					miniLog("{{clazz_name}}.{{method_name}}", String(arg_type), String(arg_dump), String(ret_type), String(retval));
					return retval;
				}
			}
			{% endif %}
			/* End: {{clazz_name}}.{{method_name}} */