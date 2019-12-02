var namespace = '/eventBus';
var house_port = location.port;
var socket = io.connect(location.protocol + '//' + document.domain + ':' + house_port + namespace);
var device = null
var tmp = null
var save_script_data = null
var monitor_messages = { "IPC": [], "HTTP": [], "MISC": [], "FILEIO": [], "SHAREDPREFERENCES": [], "WEBVIEW": [], "SQL": [] }
var monitor_settings = { 'SWITCH_FILEIO': 1, 'SWITCH_SHAREDPREFERENCES': 1, 'SWITCH_HTTP': 1, 'SWITCH_SQL': 1, 'SWITCH_WEBVIEW': 1, 'SWITCH_IPC': 1, 'SWITCH_MISC': 1 }
var preload_settings = { "PRELOAD_STETHO": 0, "PRELOAD_SSLSTRIP": 0, "PRELOAD_SETPROXY" : 0 }
var monitor_refresh = false;

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

function sideloadStetho() {
    socket.emit("loadStetho")
}

function runpreload() {
    preload_settings['PRELOAD_STETHO'] = document.getElementById("PRELOAD_STETHO").checked ? 1 : 0
    preload_settings['PRELOAD_SSLSTRIP'] = document.getElementById("PRELOAD_SSLSTRIP").checked ? 1 : 0
    preload_settings['PRELOAD_SETPROXY'] = document.getElementById("PRELOAD_SETPROXY").checked ? 1 : 0
    
    socket.emit("runpreload", { preload_settings: preload_settings })
}

function loadMonitor() {
    monitor_settings['SWITCH_FILEIO'] = document.getElementById("SWITCH_FILEIO").checked ? 1 : 0
    monitor_settings['SWITCH_SHAREDPREFERENCES'] = document.getElementById("SWITCH_SHAREDPREFERENCES").checked ? 1 : 0
    monitor_settings['SWITCH_HTTP'] = document.getElementById("SWITCH_HTTP").checked ? 1 : 0
    monitor_settings['SWITCH_WEBVIEW'] = document.getElementById("SWITCH_WEBVIEW").checked ? 1 : 0
    monitor_settings['SWITCH_SQL'] = document.getElementById("SWITCH_SQL").checked ? 1 : 0
    monitor_settings['SWITCH_IPC'] = document.getElementById("SWITCH_IPC").checked ? 1 : 0
    monitor_settings['SWITCH_MISC'] = document.getElementById("SWITCH_MISC").checked ? 1 : 0
    // console.log(monitor_settings)
    socket.emit("loadMonitor", { monitor_settings: monitor_settings })
}

function setMonitorRefresh() {
    monitor_refresh = document.getElementById("SWITCH_AUTOREFRESH").checked;
    if (monitor_refresh) {
        socket.emit("enableAutoRefresh")
    } else {
        socket.emit("diableAutoRefresh")
    }

}

function uncheckAll() {
    document.getElementById("SWITCH_FILEIO").checked = false
    document.getElementById("SWITCH_SHAREDPREFERENCES").checked = false
    document.getElementById("SWITCH_HTTP").checked = false
    document.getElementById("SWITCH_WEBVIEW").checked = false
    document.getElementById("SWITCH_SQL").checked = false
    document.getElementById("SWITCH_IPC").checked = false
    document.getElementById("SWITCH_MISC").checked = false
}

function uncheckpreload() {
    document.getElementById("PRELOAD_STETHO").checked = false
    document.getElementById("PRELOAD_SSLSTRIP").checked = false
    document.getElementById("PRELOAD_SETPROXY").checked = false
    
}


function unloadMonitor() {
    uncheckAll()
    socket.emit("unloadMonitor")
}

function endpreload() {
    uncheckpreload()
    socket.emit("endpreload")
}


function unloadStetho() {
    socket.emit("unloadStetho")
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
    $("#env_result").html("Waiting for device & package...")
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

function clear_monitorMessage(type) {
    $("#" + type + 'monitorBody').empty();
    clear_notification(type.toUpperCase())
    socket.emit("clear_monitorMessage", { "monitor_type": type })

}

function clear_monitorUI() {
    $("#" + "fileio" + 'monitorBody').empty();
    $("#" + "sharedpreferences" + 'monitorBody').empty();
    $("#" + "http" + 'monitorBody').empty();
    $("#" + "webview" + 'monitorBody').empty();
    $("#" + "sql" + 'monitorBody').empty();
    $("#" + "ipc" + 'monitorBody').empty();
    $("#" + "misc" + 'monitorBody').empty();
}

function clear_monitorMessage_All() {
    clear_monitorMessage('fileio');
    clear_monitorMessage('sharedpreferences');
    clear_monitorMessage('http');
    clear_monitorMessage('webview');
    clear_monitorMessage('sql');
    clear_monitorMessage('ipc');
    clear_monitorMessage('misc');

    $('#NOTI_FILEIO').text("");
    $('#NOTI_SHAREDPREFERENCES').text("");
    $('#NOTI_HTTP').text("");
    $('#NOTI_WEBVIEW').text("");
    $('#NOTI_SQL').text("");
    $('#NOTI_IPC').text("");
    $('#NOTI_MISC').text("");
}

function clear_notification(tab) {
    $("#NOTI_" + tab).text("");
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
        $.get('http://' + location.host + '/messages', (data) => {
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

    function getMonitorMessages() {
        $.get('http://' + location.host + '/monitor', (data) => {
            // console.log(data)
            data = JSON.parse(data);

            monitor_message = data
            FILEIO_message = data['FILEIO']
            SHAREDPREFERENCES_message = data['SHAREDPREFERENCES']
            HTTP_message = data['HTTP']
            MISC_message = data['MISC']
            IPC_message = data['IPC']
            WEBVIEW_message = data['WEBVIEW']
            SQL_message = data['SQL']

            if (data.exception != null) {
                push_err_msg(data.exception);
                $("#fileiomonitorBody").empty();
                console.log("Exception : " + data.exception)
            } else {
                // $("#filemonitorOutput").empty();
                FILEIO_message.forEach(addMonitorMessages, { type: "FILEIO" });
                SHAREDPREFERENCES_message.forEach(addMonitorMessages, { type: "SHAREDPREFERENCES" });
                HTTP_message.forEach(addMonitorMessages, { type: "HTTP" });
                MISC_message.forEach(addMonitorMessages, { type: "MISC" });
                IPC_message.forEach(addMonitorMessages, { type: "IPC" });
                WEBVIEW_message.forEach(addMonitorMessages, { type: "WEBVIEW" });
                SQL_message.forEach(addMonitorMessages, { type: "SQL" });
            }
        })
    }


    function renderMonitorMessages(data) {

        // data = monitor_messages

        monitor_message = data
        FILEIO_message = data['FILEIO']
        SHAREDPREFERENCES_message = data['SHAREDPREFERENCES']
        HTTP_message = data['HTTP']
        MISC_message = data['MISC']
        IPC_message = data['IPC']
        WEBVIEW_message = data['WEBVIEW']
        SQL_message = data['SQL']

        if (data.exception != null) {
            push_err_msg(data.exception);
            console.log("Exception : " + data.exception)
        } else {
            clear_monitorUI()
            FILEIO_message.forEach(addMonitorMessages, { type: "FILEIO" });
            SHAREDPREFERENCES_message.forEach(addMonitorMessages, { type: "SHAREDPREFERENCES" });
            HTTP_message.forEach(addMonitorMessages, { type: "HTTP" });
            MISC_message.forEach(addMonitorMessages, { type: "MISC" });
            IPC_message.forEach(addMonitorMessages, { type: "IPC" });
            WEBVIEW_message.forEach(addMonitorMessages, { type: "WEBVIEW" });
            SQL_message.forEach(addMonitorMessages, { type: "SQL" });
        }
    }

    function getEnumMessages() {
        $.get('http://' + location.host + '/enum_messages', (data) => {
            editor4.setValue(data)
            unload_script()
        })
    }

    function getPackages() {
        $.get('http://' + location.host + '/package', (package) => {
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
        $.get('http://' + location.host + '/hook_script', (data) => {
            editor2.setValue(data);
        })
    }

    function getHookScriptMini() {
        $.get('http://' + location.host + '/hook_script_mini', (data) => {
            editor2.setValue(data);
        })
    }

    function getHookConfig() {
        $.get('http://' + location.host + '/hook_conf', (data) => {
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

    function getMonitorConfig() {
        $.get('http://' + location.host + '/monitor_conf', (data) => {
            if (data == "") {
                console.log("Retrying to get monitor_conf...")
                setTimeout(getHookConfig, 1000);
            }
            monitor_settings = JSON.parse(data)
            // console.log(monitor_settings)
            uncheckAll()
            document.getElementById("SWITCH_FILEIO").checked = (monitor_settings.SWITCH_FILEIO == 1) ? true : false
            document.getElementById("SWITCH_SHAREDPREFERENCES").checked = (monitor_settings.SWITCH_SHAREDPREFERENCES == 1) ? true : false
            document.getElementById("SWITCH_HTTP").checked = (monitor_settings.SWITCH_HTTP == 1) ? true : false
            document.getElementById("SWITCH_WEBVIEW").checked = (monitor_settings.SWITCH_WEBVIEW == 1) ? true : false
            document.getElementById("SWITCH_SQL").checked = (monitor_settings.SWITCH_SQL == 1) ? true : false
            document.getElementById("SWITCH_IPC").checked = (monitor_settings.SWITCH_IPC == 1) ? true : false
            document.getElementById("SWITCH_MISC").checked = (monitor_settings.SWITCH_MISC == 1) ? true : false
        })
    }

    function getPreloadConfig() {
        $.get('http://' + location.host + '/preload_conf', (data) => {
            if (data == "") {
                console.log("Retrying to get preload_conf...")
                setTimeout(getHookConfig, 1000);
            }
            preload_settings = JSON.parse(data)
            // console.log(monitor_settings)
            uncheckpreload()
            document.getElementById("PRELOAD_STETHO").checked = (preload_settings.PRELOAD_STETHO == 1) ? true : false
            document.getElementById("PRELOAD_SSLSTRIP").checked = (preload_settings.PRELOAD_SSLSTRIP == 1) ? true : false
            document.getElementById("PRELOAD_SETPROXY").checked = (preload_settings.PRELOAD_SSLSTRIP == 1) ? true : false

        })
    }

    function postClassEnum(class_to_find) {
        console.log(class_to_find)
        $.post('http://' + location.host + '/setEnumConfig', class_to_find)
    }


    function postHook(hook_message) {
        $.post('http://' + location.host + '/hook', hook_message)
    }

    function loadScript(script) {
        $.post('http://' + location.host + '/load_script', script)
    }

    function clearHook() {
        $.get('http://' + location.host + '/hook_clear')
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

    function addMonitorMessages(m) {
        // console.log(this.type);
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

        if (m.exception != null) {
            exception = m.exception;
            // $('#outputTbl > tbody:last').append('<code>Exception: ' + exception + '</code>');
            push_err_msg("[!] Hooks Error: " + exception);
        } else {
            switch (this.type) {
                case 'FILEIO':
                    $('#fileiomonitorTable > tbody:last').append('<tr><td>' + methodname + '</td><td><code>' + args + '</code></td><td>' + retval + '</td>');
                    break;
                case 'SHAREDPREFERENCES':
                    $('#sharedpreferencesmonitorTable > tbody:last').append('<tr><td>' + methodname + '</td><td><code>' + args + '</code></td><td>' + retval + '</td>');
                    break;
                case 'HTTP':
                    $('#httpmonitorTable > tbody:last').append('<tr><td>' + methodname + '</td><td><code>' + args + '</code></td><td>' + retval + '</td>');
                    break;
                case 'IPC':
                    $('#ipcmonitorTable > tbody:last').append('<tr><td>' + methodname + '</td><td><code>' + args + '</code></td><td>' + retval + '</td>');
                    break;
                case 'WEBVIEW':
                    $('#webviewmonitorTable > tbody:last').append('<tr><td>' + methodname + '</td><td><code>' + args + '</code></td><td>' + retval + '</td>');
                    break;
                case 'SQL':
                    $('#sqlmonitorTable > tbody:last').append('<tr><td>' + methodname + '</td><td><code>' + args + '</code></td><td>' + retval + '</td>');
                    break;
                default:
                    $('#miscmonitorTable > tbody:last').append('<tr><td>' + methodname + '</td><td><code>' + args + '</code></td><td>' + retval + '</td>');

            }
        }

    }


    function overwrite() {
        getMessages()
        getMonitorMessages()
        getHookConfig()
        getHookScript()
        getMonitorConfig()
        getPreloadConfig()
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

        $.get('http://' + location.host + '/AutoRefresh', (data) => {
            monitor_refresh = (data == '1') ? true : false
            document.getElementById("SWITCH_AUTOREFRESH").checked = monitor_refresh ? true : false
        })

        setInterval(() => {
            if (monitor_refresh) {
                socket.emit("get_monitor_message");
            }
        }, 1500)

        socket.emit('fetchInspect');
        // socket.emit('check_monitor_running');

        socket.on('log', function(msg) {
            console.log(("[+]Log: " + msg.data))
        });

        socket.on('monitor_running_status', function(msg) {
            if (msg.running == 1) {
                $("#monitor_running").text("Running");
            } else {
                $("#monitor_running").text("Not Running");
            }
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

        // socket.on('update_monitor_message', function(msg) {
        //     $('#NOTI_' + msg.mon_type).text("New");
        //     monitor_messages = msg.monitor_message;
        //     renderMonitorMessages(monitor_messages)
        //     // getMonitorMessages()
        // });

        socket.on('update_monitor_message', function(msg) {
            // $('#NOTI_' + msg.mon_type).text("New");
            // console.log(msg.monitor_new.length)
            if (msg.monitor_new.length != 0) {
                // lazy refreshing
                for (i in msg.monitor_new) {
                    if (msg.monitor_new[i] == null) { break; } else { $('#NOTI_' + msg.monitor_new[i]).text("New"); }
                }
                monitor_messages = msg.monitor_message;
                renderMonitorMessages(monitor_messages)
            }

            // getMonitorMessages()
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
            getHookConfig()
            getHookScript()
            // overwrite()
        });

        socket.on('update_hooks_mini', function() {
            getHookConfig()
            getHookScriptMini()
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
            $.get('http://' + location.host + '/enum_script', (data) => {
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
            var hook_message = { classname: $("#classname").val(), methodname: $("#method").val(), overload_type: $("#overload_type").val() }
            $("#classname").val('')
            $("#method").val('')
            $("#overload_type").val('')
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

        $("#gen_script_mini").click(() => {
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
            socket.emit("gen_script_mini", hooks_list)
        })
        
        $("#load_script").click(() => {
            var script_to_load = { script: editor2.getValue() }
            socket.emit("loadHookScript", script_to_load)
            // overwrite()
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