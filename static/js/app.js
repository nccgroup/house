var namespace = '/eventBus';
var house_port = location.port;
var socket = io.connect(location.protocol + '//' + document.domain + ':' + house_port + namespace);
var device = null
var tmp = null
var save_script_data = null

function refresh_device() {
    socket.emit("refresh_device")
}

function select_device() {
    device_id = $("input[name='device_id']:checked").val();
    console.log("select_device_button clicked..")
    if (device_id != null) {
        socket.emit("set_device_id", { id: device_id })
    }
}

function doEnv() {
    socket.emit("doEnv")
}

function get_uuid() {
    return $("#uuid").text()
}

function enumAllClasses() {
    enum_config = { option: 'enumAllClasses' }
    socket.emit("setEnumConfig", enum_config)
}

function enumDexClasses() {
    enum_config = { option: 'enumDexClasses' }
    socket.emit("setEnumConfig", enum_config)
}

function get_enum_history() {
    socket.emit("get_enum_history")
}

function get_hooks_history() {
    socket.emit("get_hooks_history")
}

function get_intercept_history() {
    socket.emit("get_intercept_history")
}

function changePackage(packagename) {
    var pkg = { packagename: packagename }
    socket.emit("setPackage", pkg)
}



function showHistoryScript(path, option) {
    if (path) {
        var data = { filepath: path, option: option }
        socket.emit("get_history_script", data)
    } else {
        editor_hook_history.setValue("Invalid File!")
    }
}

function load_hook_history_script() {
    editor2.setValue((editor_hook_history.getValue()));
}

function load_enum_history_script() {
    editor3.setValue((editor_enum_history.getValue()));
}

function load_intercept_history_script() {
    intercepts_script_editor.setValue((editor_intercept_history.getValue()));
}



function save_script(option, filename, script) {
    save_script_data = { option: option, filename: filename, script: script }
    socket.emit("save_script", save_script_data)
}

function deleteScript(path) {
    socket.emit("deleteScript", { path: path })
}

function genIntercept() {
    var index = $("#indexSelect").val() ? $("#indexSelect").val() : 0
    var intercept_index = { intercept_index: Number(index) }
    socket.emit("genIntercept", intercept_index)
}

// function doIntercept() {
//     var index = $("#indexSelect").val() ? $("#indexSelect").val() : 0
//     var intercept_index = { intercept_index: Number(index) }
//     socket.emit("doIntercept", intercept_index)
//     editor5.setValue("")
// }

function appendLn(editor, text) {
    var session = editor.session;
    session.insert({
        row: session.getLength(),
        column: 0
    }, "\n" + text)
    var n = session.getLength(); // To count total no. of lines
    editor.gotoLine(n);
}

function push_err_msg(data) {
    $("#err_msg").html(`<div class="alert alert-danger alert-dismissible" role="alert"><strong> ` + data + ` </strong>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button></div>`);
    setTimeout(function() { $("#err_msg").empty() }, 20000)
    unload_script()
}

function unload_script() {
    socket.emit("unload_script")
}

function quitRepl() {
    editor5.setValue('Done..');
    editor6.setValue('');
    socket.emit("quitRepl")
}

function clear_inspect() {
    editor5.setValue('');
    editor6.setValue('');
    editor7.setValue('');
}

function clear_hookMessage() {
    $("#outputBody").empty();
    socket.emit("clear_hookMessage")
}

function clear_EnumMessage() {
    editor4.setValue('')
    socket.emit("clear_EnumMessage")

}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function getTime() {
    var d = new Date();
    var x = ''
    var h = addZero(d.getHours());
    var m = addZero(d.getMinutes());
    var s = addZero(d.getSeconds());
    x = h + ":" + m + ":" + s;

    return x
}

window.onload = function() {
    function getMessages() {
        $.get('http://127.0.0.1:' + house_port + '/messages', (data) => {
            data = JSON.parse(data);
            if (data.exception != null) {
                push_err_msg(data.exception);
                $("#outputBody").empty();
                console.log("Exception : " + data.exception)
            } else {
                $("#outputBody").empty();
                data.forEach(addMessages);
            }
        })
    }

    function getEnumMessages() {
        $.get('http://127.0.0.1:' + house_port + '/enum_messages', (data) => {
            editor4.setValue(data)
            unload_script()
        })
    }

    function getPackages() {
        $.get('http://127.0.0.1:' + house_port + '/package', (package) => {
            tmp = package
            if (package != null && package != "None" && package != "") {
                package_html = `<div class="bg-success">
                                    <p class="text-info"><i class="glyphicon glyphicon-book"></i> Package: <code> ` + package + `</code></p>
                                    <div class="input-group col-sm-3">
                                        <input id="packagename1" class="form-control" placeholder="packagename">
                                        <br />
                        <button class="btn btn-success" type="button" onclick='changePackage($("#packagename1").val())'>Confirm</button>
                                    </div> 
                                </div>`
            } else {
                package_html = `<div class="bg-danger">
                                    <p class="text-warning"><i class="glyphicon glyphicon-book"></i> Can I have ur package please?</p>
                                    <div class="input-group col-sm-3">
                                        <input id="packagename1" class="form-control" placeholder="packagename">
                                        <br />
                        <button class="btn btn-success" type="button" onclick='changePackage($("#packagename1").val())'>Confirm</button>
                                    </div>                            
                                </div>`
            }
            $("#pkg_info").html(package_html)
            console.log(("[+]new package: " + package.data))
            // console.log(data)
        })
    }

    function getHookScript() {
        $.get('http://127.0.0.1:' + house_port + '/hook_script', (data) => {
            editor2.setValue(data);
        })
    }

    function getHookConfig() {
        $.get('http://127.0.0.1:' + house_port + '/hook_conf', (data) => {
            if (data == "") {
                console.log("Retrying to get hook...")
                setTimeout(getHookConfig, 1000);
            }
            hook_array = JSON.parse(data).hooks_list
            editor.setValue('')
            $("#targetBody").empty();
            for (var index = 0; index < hook_array.length; index++) {
                var hook_val = hook_array[index]
                // console.log(hook_val)
                editor.insert(JSON.stringify(hook_val) + '\n')
            }
        })
    }

    function postClassEnum(class_to_find) {
        console.log(class_to_find)
        $.post('http://127.0.0.1:' + house_port + '/setEnumConfig', class_to_find)
    }


    function postHook(hook_message) {
        $.post('http://127.0.0.1:' + house_port + '/hook', hook_message)
    }

    function loadScript(script) {
        $.post('http://127.0.0.1:' + house_port + '/load_script', script)
    }

    function clearHook() {
        $.get('http://127.0.0.1:' + house_port + '/hook_clear')
    }

    function addMessages(m) {
        var methodname = 'N.A'
        var args = ''
        var retval = 'VOID'
        if (m.methodname != null) {
            methodname = m.methodname;
        }
        if (m.args != null) {
            args = m.args;
        }
        if (m.retval != null) {
            retval = m.retval;
        }

        var t = $('#outputTbl');

        if (m.exception != null) {
            exception = m.exception;
            // $('#outputTbl > tbody:last').append('<code>Exception: ' + exception + '</code>');
            push_err_msg("[!] Hooks Error: " + exception);
            clear_hookMessage();
        } else {
            $('#outputTbl > tbody:last').append('<tr><td>' + methodname + '</td><td><code>' + args + '</code></td><td>' + retval + '</td>');
        }
        console.log("updated finished")
    }


    function overwrite() {
        getMessages()
        getHookConfig()
        getHookScript()
    }


    function refresh() {
        getMessages()
    }

    function refresh_enum() {
        getEnumMessages()
    }

    function toggler(divId) {
        $("#" + divId).toggle();
    }


    $(() => {
        socket.emit('authentication', { uuid: get_uuid() });
        var current_intercept_time = null
        refresh_device()
        getPackages()
        overwrite()

        socket.emit('fetchInspect');

        socket.on('log', function(msg) {
            console.log(("[+]Log: " + msg.data))
        });

        socket.on('select_device', function(msg) {
            dl = msg.device_list;
            select_device_html = '<div class="bg-warning"><form>'
            if (dl != null && dl != "None") {
                json_dl = JSON.parse(dl)
                jQuery.each(json_dl, function(id, val) {
                    select_device_html += `<div class="radio">
      <label><input type="radio" name="device_id" value="` + id + `">` + `<p class="text-info"><i class="glyphicon glyphicon-phone"></i>` + val + " </p></label></div>"
                });
                select_device_html += `<button class="btn btn-success" type="button" id="select_device_button" onclick="select_device()"'>Select</button>
                    </div>`
                $("#device_info_tab").html(select_device_html)
                console.log(select_device_html)
            }

        });

        socket.on('show_selected_device', function(msg) {
            dl = msg.device_list;
            id = msg.selection
            select_device_html = '<div class="bg-success"><form>'
            if (dl != null && dl != "None") {
                json_dl = JSON.parse(dl)
                jQuery.each(json_dl, function(id, val) {
                    select_device_html += `<div class="radio">
      <label><input type="radio" name="device_id" value="` + id + `">` + `<p class="text-info"><i class="glyphicon glyphicon-phone"></i>` + val + " </p></label></div>"
                });
                select_device_html += `<button class="btn btn-success" type="button" id="select_device_button" onclick="select_device()"'>Select</button>
                    </div>`
                $("#device_info_tab").html(select_device_html)
                // $("input[name='device_id']:checked").val();
                $("input[name='device_id'][value=" + id + "]").attr('checked', 'checked');
                // console.log(select_device_html)
            }

        });

        socket.on('update_device', function(msg) {
            device = msg.data;
            if (device != null && device != "None") {
                device_html = `<div class="bg-success">
                            <p class="text-info"><i class="glyphicon glyphicon-phone"></i>  ` + device + `</p>`
            } else {
                device_html = `<div class="bg-danger">
                            <p class="text-warning">Can I have ur phone please?</p>`
            }
            device_html += `<button class="btn btn-success" type="button" onclick='refresh_device()'>Refresh</button>
            </div>`
            $("#device_info_tab").html(device_html)
            console.log(("[+]new Device: " + msg.data))

        })

        socket.on('update_package', function(msg) {
            getPackages()
            doEnv()

        })

        socket.on('update_env_info', function(msg) {
            if (msg.error) {
                $("#env_result").html("<code>" + msg.error + "</code><br />")
            } else {
                j_data = JSON.parse(msg.data)
                var result = ""
                jQuery.each(j_data, function(i, val) {
                    result += i + " : " + "<code>" + val + "</code><br />"
                });
                $("#env_result").html(result)
            }
        });

        socket.on('update_enum_messages', function() {
            getEnumMessages();
        });

        socket.on('new_hook_message', function(msg) {
            getMessages()
        });

        socket.on('new_intercept', function(msg) {
            editor5.setValue(msg.data)
            current_intercept_time = msg.time
        });

        socket.on('new_repl', function(msg) {
            try {
                j_eval_packet = JSON.parse(msg.data)
                eval_display = "[" + j_eval_packet.eval_time + "]" + '\n-> ' + j_eval_packet.eval_input + '\n' + j_eval_packet.eval_output + '\n'
                appendLn(editor7, eval_display)
                // editor7.setValue(eval_display)
            } catch (e) {
                // editor7.setValue("Is this JSON: " + msg.data)
                appendLn(editor7, "Is this JSON: " + msg.data)
            }
        });

        socket.on('update_hooks', function() {
            overwrite()
        });

        socket.on('clear_hook_msg', function() {
            clear_hookMessage()
        });

        socket.on('refresh_history_script', function(msg) {
            switch (msg.option) {
                case "enum":
                    get_enum_history()
                    break;
                case "hook":
                    get_hooks_history()
                    break;
                case "intercept":
                    get_intercept_history()
                    break;

                default:
                    console.log("Invalid type of history script..")
            }
        });

        socket.on('update_enum_history', function(msg) {
            $("#dir_enum_lst").html(msg.data)
        });

        socket.on('update_hooks_history', function(msg) {
            $("#dir_hooks_lst").html(msg.data)
        });

        socket.on('update_intercept_history', function(msg) {
            $("#dir_int_lst").html(msg.data)
        });

        socket.on('update_script_content', function(msg) {
            switch (msg.option) {
                case "enum":
                    editor_enum_history.setValue(msg.script);
                    break;
                case "hook":
                    editor_hook_history.setValue(msg.script);
                    break;
                case "intercept":
                    editor_intercept_history.setValue(msg.script);
                    break;
                default:
                    console.log("Invalid type of history script..")
            }

            // editor_hook_history.setValue(msg.script)
        });

        socket.on('update_inspect_result', function(msg) {
            $("#inspect_classname").val(msg.classname)
            $("#inspect_method").val(msg.methodname)
            $("#inspect_result").html(msg.inspect_result)
            var overloadIndex = msg.overloadIndex
            if (overloadIndex != null) {
                $("#indexSelect").val(overloadIndex)
            }
        });

        socket.on('update_intercept_script', function(msg) {
            intercepts_script_editor.setValue(msg.script)
        });

        socket.on('new_error_message', function(msg) {
            push_err_msg(msg.data);

        });

        socket.on('EnumConfigDone', function() {
            $.get('http://127.0.0.1:' + house_port + '/enum_script', (data) => {
                editor3.setValue(data);
            })
        });


        // socketIO stuff

        $("#get_enum_history").click(() => {
            get_enum_history();
            $("#nav_enum li").removeClass("active");
            $(this).addClass("active");
        })

        $("#find_class").click(() => {
            var enum_config = { class_to_find: $("#class_to_find").val(), option: 'enumClassMethods' }
            socket.emit("setEnumConfig", enum_config)
        })

        $("#save_hook_script_button").click(() => {
            save_script('hook', $('#save_hookscript_name').val(), editor2.getValue());
            $("#close_save_hook_script").click()
        })

        $("#save_enum_script_button").click(() => {
            save_script('enum', $('#save_enumscript_name').val(), editor3.getValue());
            $("#close_save_enum_script").click()
        })

        $("#save_intercept_script_button").click(() => {
            save_script('intercept', $('#save_interceptscript_name').val(), intercepts_script_editor.getValue());
            $("#close_save_intercept_script").click()
        })



        $("#postPackage").click(() => {
            var pkg = { packagename: $("#packagename").val() }
            postPackage(pkg)
            location.reload();
        })

        $("#changePackage").click(() => {
            changePackage($("#changePkgInput").val())
        })

        $("#clear").click(() => {
            editor2.setValue('')
        })

        $("#add_hook").click(() => {
            var hook_message = { classname: $("#classname").val(), methodname: $("#method").val() }
            $("#classname").val('')
            $("#method").val('')
            appendLn(editor, JSON.stringify(hook_message))

        })

        $("#hook_clear").click(() => {
            $("#classname").val('')
            $("#method").val('')
            editor.setValue('');
            editor2.setValue('');
        })

        $("#editor3_clear").click(() => {
            editor3.setValue('');
        })

        $("#gen_script").click(() => {
            var hooks_data = editor.getValue().split('\n')
            var hooks_list = { hooks_list: [] }
            for (var index = 0; index < hooks_data.length; index++) {
                try {
                    var hook_val = JSON.parse(hooks_data[index])
                    hooks_list.hooks_list.push(hook_val)


                } catch (e) {
                    console.log("Is this JSON: " + hooks_data[index])
                }
            }
            socket.emit("gen_script", hooks_list)
        })


        $("#load_script").click(() => {
            var script_to_load = { script: editor2.getValue() }
            socket.emit("loadHookScript", script_to_load)
            overwrite()
        })

        $("#load_script_enum").click(() => {
            var script_to_load = { script: editor3.getValue() }
            socket.emit("loadEnumScript", script_to_load)
            editor4.setValue("Waiting for response..")
        })

        $("#Inspect").click(() => {
            var classname = $("#inspect_classname").val()
            var methodname = $("#inspect_method").val()
            if ((classname) && (methodname)) {
                var inspect_input = { ins_classname: classname, ins_methodname: methodname }
                socket.emit("doInspect", inspect_input)

                $("#inspect_result").html("<p class='text-primary'>Loading...</p>")

            } else {
                alert("Invalid Input!")
            }
        })

        $("#load_intercept_script").click(() => {
            data = { script: intercepts_script_editor.getValue() };
            socket.emit("load_intercept_script", data)
        });

        $("#intercept_send").click(() => {
            var param = editor5.getValue();
            var j_param = JSON.parse(param)
            j_sendback = { data: param, time: current_intercept_time }
            socket.emit('intercept_param', { data: JSON.stringify(param), time: JSON.stringify(current_intercept_time), option: "intercept_param" });
            editor5.setValue("Sent..")
            editor6.setValue("")
        })



        $("#repl_send").click(() => {
            var cmd = editor6.getValue();
            j_sendback = { data: cmd }
            socket.emit('intercept_param', { data: cmd, time: getTime(), option: "intercept_repl" });
        })

        $("#repl_clear").click(() => {
            editor7.setValue('')
        })



        // Some toggle settings
        $("#wrapper").toggleClass("toggled");
        $("#menu-toggle").click(function(e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
        });
        $("#info-toggle").click(function(e) {
            e.preventDefault();
            $("#hook-info-div").toggle();
        })
        $("#check_device").click(function(e) {
            e.preventDefault();
            $("#device_info").toggle();
        })

        $("#toggle_intercept_repl").click(function(e) {
            var link = $(this);
            $("#intercept-repl-div").slideToggle('slow', function() {
                if ($(this).is(':visible')) {
                    link.text('Hide Intercept Repl');
                } else {
                    link.text('Show Intercept Repl');
                }
            });
        })

        $("#select_pkg").click(function(e) {
            e.preventDefault();
            $("#pkg_info").toggle();
        })

        $("#toggle_hook_info").click(function(e) {
            var link = $(this);
            $("#hook-info-div").slideToggle('slow', function() {
                if ($(this).is(':visible')) {
                    link.html('Hooks <i class="glyphicon glyphicon-resize-small"></i>');
                } else {
                    link.html('Hooks <i class="glyphicon glyphicon-resize-full"></i>');
                }
            });
        })

        $("#toggle_inspect_info").click(function(e) {
            var link = $(this);
            $("#inspect-div").slideToggle('slow', function() {
                if ($(this).is(':visible')) {
                    link.html('Inspect <i class="glyphicon glyphicon-resize-small"></i>');
                } else {
                    link.html('Inspect <i class="glyphicon glyphicon-resize-full"></i>');
                }
            });
        })

        $("#toggle_repl").click(function(e) {
            var link = $(this);
            $("#intercept-repl-div").slideToggle('slow', function() {
                if ($(this).is(':visible')) {
                    link.html('REPL <i class="glyphicon glyphicon-menu-up"></i>');
                } else {
                    link.html('REPL <i class="glyphicon glyphicon-menu-right"></i>');
                }
            });
        })
    })
};