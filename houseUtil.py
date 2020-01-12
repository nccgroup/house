# MIT License

# Copyright (c) 2018 NCC Group

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

from houseStatic import *
from houseGlobal import house_global, socketio, random_token
# from plugin import log_r_value
# from houseGlobal import env_html, enum_html, intercepts_html, preload_html, hooks_html, monitor_html
from _frida import ProcessNotFoundError
import traceback, IPython


def init_conf():
    if not (os.path.exists('config')):
        os.makedirs('./config')
    if not (os.path.isfile("./config/hook_conf.json")):
        with open("./config/hook_conf.json", 'w') as f:
            f.write('{"packagename": "", "hooks_list": []}')
    if not (os.path.isfile("./config/enum_conf.json")):
        with open("./config/enum_conf.json", 'w') as f:
            f.write('{"packagename": "", "enum_option": "", "class_pattern": "", "class_to_find": ""}')
    if not (os.path.isfile("./config/intercept_conf.json")):
        with open("./config/intercept_conf.json", 'w') as f:
            f.write('{"classname": "", "packagename": "", "methodname": "", "overloadIndex": 0}')
    if not (os.path.isfile("./config/env_conf.json")):
        with open("./config/env_conf.json", 'w') as f:
            f.write(
                '{"filesDirectory": "", "cacheDirectory": "", "externalCacheDirectory": "", "codeCacheDirectory": "", "packageCodePath": ""}')
    if not (os.path.isfile("./config/monitor_conf.json")):
        with open("./config/monitor_conf.json", 'w') as f:
            f.write(
                '{"SWITCH_FILEIO": 0, "SWITCH_HTTP": 0, "SWITCH_MISC": 0, "SWITCH_WEBVIEW": 0, "SWITCH_SQL": 0, "SWITCH_IPC": 0}')
    if not (os.path.isfile("./config/preload_conf.json")):
        with open("./config/preload_conf.json", 'w') as f:
            f.write('{"PRELOAD_STETHO": 0, "PRELOAD_SSLSTRIP": 1, "PRELOAD_SETPROXY": 0}')


def init_cache():
    if not (os.path.exists('cache/hook')):
        os.makedirs('./cache/hook')
    if not (os.path.exists('cache/enum')):
        os.makedirs('./cache/enum')
    if not (os.path.exists('cache/enum')):
        os.makedirs('./cache/intercept')
    if not (os.path.exists('cache/current')):
        os.makedirs('./cache/current')
    if not (os.path.exists('cache/log')):
        os.makedirs('./cache/log')

    if not (os.path.isfile("./cache/current/enum_script.js")):
        with open('./cache/current/enum_script.js', 'w') as f:
            f.write('')
    if not (os.path.isfile("./cache/current/hook_script.js")):
        with open('./cache/current/hook_script.js', 'w') as f:
            f.write('')
    if not (os.path.isfile("./cache/log/message.json")):
        with open("./cache/log/message.json", 'w') as f:
            f.write('')
    if not (os.path.isfile("./cache/log/monitor.json")):
        with open("./cache/log/monitor.json", 'w') as f:
            f.write('')


def make_tree(path, option):
    tree = dict(name=os.path.basename(path), children=[])
    try:
        lst = os.listdir(path)
    except OSError:
        pass  # ignore errors
    else:
        for name in lst:
            fn = os.path.join(path, name)
            tree['children'].append(dict(name=name, path=fn, op=option))
    return tree


def get_apk_path():
    with open("./config/env_conf.json", 'r') as f:
        house_global.env_conf = f.read()
    try:
        j_env_conf = json.loads(house_global.env_conf)
        return j_env_conf.get("packageCodePath")
    except Exception as e:
        return None
        raise e


def get_application_name():
    with open("./config/env_conf.json", 'r') as f:
        house_global.env_conf = f.read()
    try:
        j_env_conf = json.loads(house_global.env_conf)
        return j_env_conf.get("applicationName")
    except Exception as e:
        return None
        raise e


def update_conf():
    house_global.hook_conf["packagename"] = house_global.packagename

    house_global.enum_conf["packagename"] = house_global.packagename
    house_global.inspect_conf["packagename"] = house_global.packagename
    house_global.enum_conf["class_to_find"] = house_global.enum_class
    house_global.enum_conf["class_pattern"] = house_global.enum_class_pattern
    house_global.enum_conf["enum_option"] = house_global.enum_option

    house_global.hook_conf['hooks_list'] = house_global.hooks_list
    with open('./config/hook_conf.json', 'w') as f:
        # IPython.embed()
        f.write(json.dumps(house_global.hook_conf))

    with open('./config/enum_conf.json', 'w') as f:
        f.write(json.dumps(house_global.enum_conf))

    with open('./config/intercept_conf.json', 'w') as f:
        # print stylize("[+] Updating intercept_conf with {}".format(json.dumps(house_global.inspect_conf)),Info)
        f.write(json.dumps(house_global.inspect_conf))

    with open('./config/monitor_conf.json', 'w') as f:
        f.write(json.dumps(house_global.monitor_conf))
    with open('./config/preload_conf.json', 'w') as f:
        f.write(json.dumps(house_global.preload_conf))


def init_settings():
    try:
        house_global.packagename = house_global.hook_conf["packagename"]
        house_global.hooks_list = house_global.hook_conf["hooks_list"]
        house_global.enum_class = house_global.enum_conf["class_to_find"]
    except Exception as e:
        pass


def cache_script(option, script):
    if option == "enum_cache":
        with open('./cache/current/enum_script.js', 'w') as f:
            f.write(script)
    elif option == "env_cache":
        with open('./cache/current/env_script.js', 'w') as f:
            f.write(script)
    elif option == "hooks_cache":
        with open('./cache/current/hook_script.js', 'w') as f:
            f.write(script)
    elif option == "hooks_cache_mini":
        with open('./cache/current/hook_script_mini.js', 'w') as f:
            f.write(script)
    elif option == "intercept_cache":
        with open('./cache/current/intercept_script.js', 'w') as f:
            f.write(script)
    elif option == "monitor_cache":
        with open('./cache/current/monitor_script.js', 'w') as f:
            f.write(script)
    elif option == "preload_cache":
        with open('./cache/current/preload_script.js', 'w') as f:
            f.write(script)
    else:
        print(stylize("[!] Invalid cache script type", Error))


def clear_hook_msg():
    house_global.messages = []
    socketio.emit("clear_hook_msg")


def cache_inspect_html():
    with open('./config/inspect_cache.html', 'w') as f:
        f.write(house_global.inspect_result)


def checkok():
    if (house_global.packagename != "") & (house_global.hooks_list != []):
        return True
    else:
        return False


def getPackage():
    return house_global.hook_conf['packagename']


def setPackage(pkgname):
    house_global.packagename = pkgname
    house_global.inspect_conf["classname"] = ""
    house_global.inspect_conf["methodname"] = ""
    house_global.inspect_conf["overloadIndex"] = 0
    with open('./config/inspect_cache.html', 'w') as f:
        f.write(" ")
    update_conf()


def setDevice(id):
    house_global.device = house_global.device_manager.get_device(id)
    print(stylize("[+]Changing Device with id {}".format(id), MightBeImportant))
    try:
        socketio.emit('show_selected_device',
                      {'device_list': json.dumps(house_global.device_dict), 'selection': str(house_global.device.id)},
                      namespace='/eventBus')
    except Exception as e:
        raise e


def getDevice():
    try:
        print(stylize("[+] Trying to get device..", Info))
        house_global.device_dict = {}
        house_global.device_manager = frida.get_device_manager()
        device_list = house_global.device_manager.enumerate_devices()
        if len(device_list) != 0:
            remote_device_list = []
            for dv in device_list:
                if (str(dv.id) != 'local') & (str(dv.id) != 'tcp'):
                    remote_device_list.append(dv)
        if len(remote_device_list) == 1:
            house_global.device = remote_device_list[0]
            socketio.emit('update_device',
                          {'data': cgi.escape(str(house_global.device))},
                          namespace='/eventBus')
        elif len(remote_device_list) > 1:
            for dv in remote_device_list:
                house_global.device_dict[str(dv.id)] = str(dv)
            # Interact with user to select device
            if house_global.device == None:
                socketio.emit('select_device',
                              {'device_list': json.dumps(house_global.device_dict)},
                              namespace='/eventBus')
            else:
                socketio.emit('show_selected_device',
                              {'device_list': json.dumps(house_global.device_dict),
                               'selection': str(house_global.device.id)},
                              namespace='/eventBus')
        else:
            raise Exception("No device Found!")
        # return str(house_global.device)
    except Exception as e:
        house_global.device = None
        socketio.emit('update_device',
                      {'data': cgi.escape(str(house_global.device))},
                      namespace='/eventBus')
        print(stylize(str(e), Error))
        # raise e


def onMonitorMessage(message, data):
    house_global.onMessageException = ''

    if message['type'] == 'send':
        if (message.get('payload') != None):
            monitor_log = str(message.get('payload'))
            # monitor_log = u''.join(monitor_log).encode('utf-8').strip()
        else:
            monitor_log = "No message payload.."
    elif message['type'] == 'error':
        if (message.get('description') != None):
            house_global.onMessageException = cgi.escape(message.get('description'))
        else:
            house_global.onMessageException = 'No description'
        print(stylize("[!]Monitor Error: {}".format(house_global.onMessageException), Error))
        socketio.emit('new_error_message',
                      {'data': "[!] {}".format(house_global.onMessageException)},
                      namespace='/eventBus')
        monitor_log = message.get('payload') if message.get('payload') else ''

    j_monitor_log = json.loads(monitor_log)

    mon_type = j_monitor_log.get("monitor_type")
    args = j_monitor_log.get("arg_dump")
    method = j_monitor_log.get("method_info")
    retval = j_monitor_log.get("retval_dump")
    if args != None:
        args = cgi.escape(args).replace(linebreak, '<br>')
    if method != None:
        method = cgi.escape(method).replace(linebreak, '<br>')
    if retval != None:
        retval = cgi.escape(retval).replace(linebreak, '<br>')
    monitor_entry = {"methodname": method, "args": args, "retval": retval}

    # "types" : ["fileIO", "HTTP", "WEBVIEW", "SQL", "IPC", "MISC", "IGNORE"]
    if (mon_type != None) & (mon_type != "IGNORE"):
        if mon_type == "fileIO":
            house_global.monitor_message['FILEIO'].insert(0, monitor_entry)
        elif mon_type == "SHAREDPREFERENCES":
            house_global.monitor_message['SHAREDPREFERENCES'].insert(0, monitor_entry)
        elif mon_type == "HTTP":
            house_global.monitor_message['HTTP'].insert(0, monitor_entry)
        elif mon_type == "WEBVIEW":
            house_global.monitor_message['WEBVIEW'].insert(0, monitor_entry)
        elif mon_type == "SQL":
            house_global.monitor_message['SQL'].insert(0, monitor_entry)
        elif mon_type == "IPC":
            house_global.monitor_message['IPC'].insert(0, monitor_entry)
        else:  # misc
            mon_type = "MISC"
            house_global.monitor_message['MISC'].insert(0, monitor_entry)
    # socketio.emit('update_monitor_message', {'mon_type': mon_type.upper(), 'monitor_message': house_global.monitor_message},namespace='/eventBus')
    house_global.monitor_queue.add(mon_type.upper())


def onMessage(message, data):
    house_global.onMessageException = ''

    if message['type'] == 'send':
        if (message.get('payload') != None):
            info = str(message.get('payload'))
            # info = str(u''.join(info).encode('utf-8').strip())
        else:
            info = "No message payload.."
    elif message['type'] == 'error':
        if (message.get('description') != None):
            house_global.onMessageException = cgi.escape(message.get('description'))
        else:
            house_global.onMessageException = 'No description'
        print(stylize("[!]Error: {}".format(house_global.onMessageException), Error))
        socketio.emit('new_error_message',
                      {'data': "[!] {}".format(house_global.onMessageException)},
                      namespace='/eventBus')
        info = message.get('payload') if message.get('payload') else ''
    # IPython.embed()
    if "t3llm3mor3ab0ut1t" in info:
        env_info = info.replace("t3llm3mor3ab0ut1t", '')
        # print (env_info)
        # IPython.embed()
        j_env_info = json.loads(env_info)

        if j_env_info.get("packageCodePath") != None:
            with open("./config/env_conf.json", 'w') as f:
                json.dump(j_env_info, f)
        socketio.emit('update_env_info',
                      {'data': env_info},
                      namespace='/eventBus')

        # env stuff
    if "-hoo00ook-" in info:
        info = info.replace("-hoo00ook-", '')

        j_info = json.loads(info)
        args = j_info.get("arg_dump")
        method = j_info.get("method_info")
        retval = j_info.get("retval_dump")
        # special_instruction = j_info.get("special_inst")  # experimental

        if args != None:
            args = cgi.escape(args).replace(linebreak, '<br>')
        if method != None:
            method = cgi.escape(method).replace(linebreak, '<br>')
        if retval != None:
            retval = cgi.escape(retval).replace(linebreak, '<br>')

        info_dict = {"methodname": method, "args": args, "retval": retval}

        house_global.messages.insert(0, info_dict)
        # if special_instruction != None:  # experimental
        #     log_r_value(special_instruction)

        socketio.emit('new_hook_message',
                      {'data': json.dumps(info_dict)},
                      namespace='/eventBus')

    if "-enumMmMmMmMm-" in info:
        enum_msg = info.replace('undefined', '').replace("-enumMmMmMmMm-", '')
        house_global.enum_messages.insert(0, enum_msg)
        socketio.emit("update_enum_messages", namespace='/eventBus')

    if "-t1m3f0rm1tm-" in info:
        intercept_msg = info.replace("-t1m3f0rm1tm-", '')

        if "-what1sth3t1m3n0w-" in intercept_msg:
            house_global.new_intercept_msg = intercept_msg.split("-what1sth3t1m3n0w-")[0]
            house_global.new_intercept_time = intercept_msg.split("-what1sth3t1m3n0w-")[1]
        else:
            house_global.new_intercept_msg = intercept_msg

        socketio.emit('new_intercept',
                      {'data': house_global.new_intercept_msg, 'time': house_global.new_intercept_time},
                      namespace='/eventBus')

    if "-whatisth1smeth0d-" in info:
        inspect_info = info.replace("-whatisth1smeth0d-", '')

        j_inspect = json.loads(inspect_info)
        overload_info = j_inspect['methodInfo']

        overload_count = len(overload_info)

        inspect_class_name = house_global.inspect_conf["classname"]
        inspect_method_name = house_global.inspect_conf["methodname"]
        html_output = ""

        if overload_count > 1:
            html_output = "<p><code>{}</code></p>".format(
                cgi.escape(inspect_class_name) + '.' + cgi.escape(inspect_method_name))
            html_output += """
            <form action='/inspect' method='POST'>
              <div class="form-row align-items-center">
                <div class="col-auto my-1">
                  <label class="mr-sm-2"> Overloads: </label>
                  <select class="custom-select mr-sm-2" id="indexSelect">
            """
            for i in range(0, overload_count):
                html_output += """
                <option value={}><code>{}</code></option>
                """.format(str(i), cgi.escape(str(json.dumps(overload_info[i]))).replace("\\\"", ""))

            html_output += """
            </select>
                </div>
              </div>
            </form>
            <div class="col-auto my-1">
                <button class="btn btn-success" onclick="genIntercept()">Generate Script</button>
                <button class="btn btn-primary" class="btn btn-primary" data-toggle="modal" data-target="#intercept_history" onclick="get_intercept_history();">History Scripts</button>
            </div>
            """

        elif overload_count == 1:
            html_output = """
            <p><code>{}</code></p>
            <div class="radio">
              <label><input type="radio" name="optradio"><code>{}</code></label>
            </div>
            <div class="col-auto my-1">
                <button class="btn btn-success" onclick="genIntercept()">Generate Script</button>
                <button class="btn btn-primary" class="btn btn-primary" data-toggle="modal" data-target="#intercept_history" onclick="get_intercept_history();">History Scripts</button>
            </div>
            """.format(cgi.escape(inspect_class_name) + '.' + cgi.escape(inspect_method_name), str(overload_info[0]))
        else:
            html_output = "No such function you fool"

        house_global.inspect_result = html_output
        cache_inspect_html()
        update_inspect_result = {'classname': house_global.inspect_conf["classname"],
                                 'methodname': house_global.inspect_conf["methodname"],
                                 'inspect_result': house_global.inspect_result}
        socketio.emit('update_inspect_result', update_inspect_result, namespace='/eventBus')

    if "-can1hav3ash3ll-" in info:
        house_global.new_repl_msg = info.replace("-can1hav3ash3ll-", '')
        socketio.emit('new_repl',
                      {'data': house_global.new_repl_msg, 'time': house_global.new_repl_time},
                      namespace='/eventBus')


def render(tpl_path, context):
    path, filename = os.path.split(tpl_path)
    return jinja2.Environment(
        loader=jinja2.FileSystemLoader(path or './')
    ).get_template(filename).render(context)


def prepare_script_fragment(clazz_name, method_name, script_type, overloadIndex=0, overload_type=None,
                            instruction=None, is_dynamic=False):
    context = {
        'clazz_name': '',
        'method_name': '',
        'clazz_hook': '',
        'method_hook': '',
        'overloadIndex': str(overloadIndex),
        'overload_type': overload_type,
        'instruction': '',
        'is_dynamic' : is_dynamic
    }
    if (clazz_name != None) & (clazz_name != '') & (method_name != None) & (method_name != ''):
        context['clazz_name'] = clazz_name
        context['method_name'] = method_name
        context['clazz_hook'] = str(clazz_name.split('.')[-1]) + '_hook'
        context['method_hook'] = str(method_name.replace('.', '_')) + '_hook'

        if script_type == "inspect":
            result = render('./scripts/intercept/inspect.js', context)
        elif script_type == "intercept":
            result = render('./scripts/intercept/intercept.js', context)
        elif script_type == "hookmini":
            result = render('./scripts/hook/hook_mini_frag.js', context)
        else:
            result = render('./scripts/hook/hook_frag.js', context)
        return result
    else:
        print(
            stylize("[!]prepare_script_fragment Error with {} - {} - {} ".format(clazz_name, method_name, script_type),
                    Error))
        return ''


def prepare_monitor_fragment(clazz_name, method_name, monitor_type='misc', instruction=None):
    context = {
        'clazz_name': '',
        'method_name': '',
        'clazz_hook': '',
        'method_hook': '',
        'monitor_type': '',
        'instruction': instruction
    }
    result = ''
    if (clazz_name != None) & (clazz_name != '') & (method_name != None) & (method_name != ''):
        context['clazz_name'] = clazz_name
        context['method_name'] = method_name
        context['clazz_hook'] = str(clazz_name.split('.')[-1]) + '_hook'
        context['method_hook'] = str(method_name.replace('.', '_')) + '_hook'
        context['monitor_type'] = monitor_type

        result = render('./scripts/monitor/monitor_frag.js', context)
    return result

def prepare_native_script_fragment(so_name, method_name):
    context = {
        'so_name': '',
        'method_name': '',
    }
    if (so_name != None) & (so_name != '') & (method_name != None) & (method_name != ''):
        context['so_name'] = so_name
        context['method_name'] = method_name
        result = render('./scripts/hook/native_hook_frag.js', context)
        return result
    else:
        print(stylize("[!]prepare_native_script_fragment Error with {} - {} ".format(so_name, method_name), Error))
        return ''

def build_dyload_script(dy_dic, is_mini = False):
    # dy_dic: {dyload_path: [[clazz_name, method_name, overload_type, instruction, dyload_loadClassFlag]]}
    hook_frag_script = ""
    dyload_script = ""
    for dyload_path, target_array in dy_dic.items():
        for target in target_array:
            clazz_name = target[0]
            method_name = target[1]
            overload_type = target[2]
            instruction = target[3]
            # dynamicHookOption = True
            dynamicHookOption = target[4]

            hook_frag_script += prepare_script_fragment(clazz_name, method_name, ("hookmini" if is_mini else "hook"), overload_type=overload_type, is_dynamic = True)
        context = {'dyload_path': dyload_path, 'hook_frag_script': hook_frag_script, 'dynamicHookOption': dynamicHookOption}
        if not is_mini:
            dyload_script += render(("scripts/hook/hook_dyload_frag.js"), context)
        else:
            dyload_script += render(("scripts/hook/hook_dyload_frag_mini.js"), context)
    return dyload_script

def refresh():
    with open('./templates/env.html') as f:
        env_html = f.read()
    with open('./templates/enum.html') as f:
        enum_html = f.read()
    with open('./templates/hooks.html') as f:
        hooks_html = f.read()
    with open('./templates/intercepts.html') as f:
        intercepts_html = f.read()
    with open('./templates/preload.html') as f:
        preload_html = f.read()
    with open('./templates/monitor.html') as f:
        monitor_html = f.read()
    return render_template('index.html', uuid=str(random_token), env=env_html, enum=enum_html, hooks=hooks_html,
                           intercepts=intercepts_html, preload=preload_html, monitor=monitor_html)


def build_hook_script():
    hooks_list = house_global.hook_conf['hooks_list']
    basicscript = ""
    nativescript = ""
    dy_dic = {}
    dyloadscript = ""

    for entry in hooks_list:
        clazz_name = entry['classname']
        method_name = entry['methodname']
        overload_type = entry.get('overload_type')
        instruction = entry.get('instruction')
        dyload_path = entry.get('dyload_path')
        dynamicHookOption = entry.get('dynamicHookOption')
        # IPython.embed()
        if ".so" in clazz_name:
            nativescript += prepare_native_script_fragment(clazz_name, method_name)
        elif dyload_path is not None:
            d = dy_dic.get(dyload_path)
            if d == None:
                dy_dic[dyload_path] = [[clazz_name, method_name, overload_type, instruction, dynamicHookOption]]
            elif type(d) == list:
                dy_dic[dyload_path].append([clazz_name, method_name, overload_type, instruction, dynamicHookOption])
            else:
                raise ValueError("dy_dic[dyload_path] is not a list!")

        else:
            basicscript += prepare_script_fragment(clazz_name, method_name, "hook", overload_type=overload_type)

    if len(dy_dic) > 0:
        dyloadscript = build_dyload_script(dy_dic)

    context = {'scripts': basicscript, 'native_scripts': nativescript, "dyloadscript": dyloadscript}
    # print(context)
    result = render('./scripts/hook/hook_tpl.js', context)
    house_global.hook_script = result

    cache_script("hooks_cache", house_global.hook_script)


def build_hook_mini_script():
    hooks_list = house_global.hook_conf['hooks_list']
    basicscript = ""
    nativescript = ""
    dyloadscript = ""
    dy_dic = {}

    for entry in hooks_list:
        # entry = hooks_list[i]
        clazz_name = entry['classname']
        method_name = entry['methodname']
        overload_type = entry.get('overload_type')
        instruction = entry.get('instruction')
        dyload_path = entry.get('dyload_path')
        dynamicHookOption = entry.get('dynamicHookOption')
        if ".so" in clazz_name:
            nativescript += prepare_native_script_fragment(clazz_name, method_name)
        elif dyload_path is not None:
            d = dy_dic.get(dyload_path)
            if d == None:
                dy_dic[dyload_path] = [[clazz_name, method_name, overload_type, instruction, dynamicHookOption]]
            elif type(d) == list:
                dy_dic[dyload_path].append([clazz_name, method_name, overload_type, instruction, dynamicHookOption])
            else:
                raise ValueError("dy_dic[dyload_path] is not a list!")
        else:
            # java hook
            basicscript += prepare_script_fragment(clazz_name, method_name, "hookmini", overload_type=overload_type)
    if len(dy_dic) > 0:
        dyloadscript = build_dyload_script(dy_dic, is_mini= True)
    context = {'scripts': basicscript, 'native_scripts': nativescript, 'dyloadscript': dyloadscript}

    result = render('./scripts/hook/hook_tpl_mini.js', context)
    house_global.hook_script_mini = result

    cache_script("hooks_cache_mini", house_global.hook_script_mini)


def build_env_script():
    # print(stylize("[+]Building env script for " + house_global.packagename + " .. ", Info))
    result = ''
    if house_global.packagename != None:
        result = render('./scripts/enum/env.js', {'packageName': house_global.packagename})
    cache_script("env_cache", result)
    return result


def build_monitor_script():
    with open("./scripts/monitor/monitor_hook.json") as monitor_list_conf:
        monitor_list_conf_rd = monitor_list_conf.read()
    monitor_list = json.loads(monitor_list_conf_rd)
    file_monitor_list = monitor_list.get("monitor_list")
    render_monitor_list = []

    try:
        for file_monitor_list_entry in file_monitor_list:
            type_to_build = file_monitor_list_entry['type']
            method_to_build = file_monitor_list_entry['methodname']
            instruction = file_monitor_list_entry.get('instruction')
            if house_global.monitor_conf.get('SWITCH_' + type_to_build.upper()) == 1:
                render_monitor_list.append(file_monitor_list_entry)
    except Exception as e:
        raise e

    monitorscript_fragment = ""

    for render_monitor_list_entry in render_monitor_list:
        clazz_name = render_monitor_list_entry['classname']
        method_name = render_monitor_list_entry['methodname']
        monitor_type = render_monitor_list_entry['type']
        instruction = render_monitor_list_entry.get('instruction')

        monitorscript_fragment += prepare_monitor_fragment(clazz_name, method_name, monitor_type, instruction)
    context = {'scripts': monitorscript_fragment}
    result = render('./scripts/monitor/monitor_tpl.js', context)

    house_global.monitor_script = result
    cache_script("monitor_cache", house_global.monitor_script)


def build_enum_script(option, class_to_find, class_pattern):
    if (class_to_find != None) & (".so" in class_to_find) & (option == "enumClassMethods"):
        option = "enumLibSo"

    context = {'option': option, 'class_to_find': class_to_find, 'class_pattern': class_pattern,
               'apk_path': get_apk_path()}

    result = render('./scripts/enum/enum_skl.js', context)
    house_global.enum_script_to_load = result


def preload_stetho_script():
    global Info
    getDevice()
    if ((house_global.packagename != '') & (house_global.device != None)):
        # IPython.embed()
        unload_script("stetho")
        try:
            print(stylize("[!] Have to reload to preload, trying to spawn it..", MightBeImportant))
            pid = house_global.device.spawn([house_global.packagename])
            house_global.session = house_global.device.attach(pid)
            pending = True

            if get_application_name() == None:
                print(stylize("[!] What is the application name? Try refresh House", Error))
                return
            else:
                jscode = render('./scripts/misc/sideload_stetho.js', {"application_name": get_application_name()})
                process = house_global.device.attach(house_global.packagename)
                house_global.stetho_script_object = process.create_script(jscode)
                print('[*] Running Stetho')

                house_global.stetho_script_object.load()

                # print (stylize('[+] Loading the new script..{} {}'.format(str(house_global.device), str(house_global.packagename)), Info))

                if pending:
                    # IPython.embed()
                    house_global.device.resume(pid)
        except Exception as e:
            print(stylize("[!]sideload_script Exception: {}".format(str(e)), Error))
            traceback.print_exc(file=sys.stdout)
            raise e

    else:
        print(stylize('[!]Please tell me what you want!', Error))
        raise Exception(" Failed to load script")


def run_preload_script():
    global Info
    getDevice()
    if ((house_global.packagename != '') & (house_global.device != None)):
        # IPython.embed()
        unload_script("preload")
        preload_context = {
            "application_name": "",
            "PRELOAD_STETHO": "",
            "PRELOAD_SSLSTRIP": "",
            "PRELOAD_SETPROXY": ""
        }
        if (house_global.preload_conf.get('PRELOAD_STETHO') == 1): preload_context['PRELOAD_STETHO'] = 'yes'
        if (house_global.preload_conf.get('PRELOAD_SSLSTRIP') == 1): preload_context['PRELOAD_SSLSTRIP'] = 'yes'
        if (house_global.preload_conf.get('PRELOAD_SETPROXY') == 1): preload_context['PRELOAD_SETPROXY'] = 'yes'

        try:
            if (house_global.preload_conf.get('PRELOAD_STETHO') == 1):
                print(stylize("[!] Have to reload to preload, trying to spawn it..", MightBeImportant))

                pid = house_global.device.spawn([house_global.packagename])
                house_global.session = house_global.device.attach(pid)
                pending = True
            else:
                print(stylize("[!] No need to reload..", MightBeImportant))
                try:
                    pid = house_global.device.get_process(house_global.packagename).pid
                    house_global.session = house_global.device.attach(house_global.packagename)
                    pending = False
                except ProcessNotFoundError as e:
                    pid = house_global.device.spawn([house_global.packagename])
                    house_global.session = house_global.device.attach(pid)
                    pending = True

            if get_application_name() == None:
                print(stylize("[!] What is the application name? Try refresh House", Error))
                return
            else:
                preload_context['application_name'] = get_application_name()
                house_global.preload_script = render('./scripts/misc/preload.js', preload_context)
                print(preload_context)
                cache_script("preload_cache", house_global.preload_script)
                process = house_global.device.attach(house_global.packagename)
                house_global.preload_script_object = process.create_script(house_global.preload_script)
                print('[*] Running Preload')

                house_global.preload_script_object.load()

                # print (stylize('[+] Loading the new script..{} {}'.format(str(house_global.device), str(house_global.packagename)), Info))

                if pending:
                    # IPython.embed()
                    house_global.device.resume(pid)
        except Exception as e:
            print(stylize("[!]run_preload_script Exception: {}".format(str(e)), Error))
            traceback.print_exc(file=sys.stdout)
            raise e

    else:
        print(stylize('[!]Please tell me what you want!', Error))
        raise Exception(" Failed to load script")


def on_spawned(spawn):
    print('on_spawned:', spawn)
    if spawn.identifier is not None and spawn.identifier.startswith('xxx'):
        print('Instrumenting:', spawn)
        house_global.session = house_global.device.attach(spawn.pid)

        house_global.script = house_global.session.create_script(house_global.script_to_load)
        # IPython.embed()

        house_global.script.on('message', onMessage)
        house_global.script.load()

        # print (stylize('[+] Loading the new script..{} {}'.format(str(house_global.device), str(house_global.packagename)), Info))
    house_global.device.resume(spawn.pid)
    # print('Processed:', spawn)


def load_script():
    global Info
    getDevice()
    if ((house_global.script_to_load != '') & (house_global.packagename != '') & (house_global.device != None)):

        unload_script()
        print("Loading script...")
        try:
            pending = False
            try:
                pid = house_global.device.get_process(house_global.packagename).pid
                house_global.session = house_global.device.attach(house_global.packagename)
            except ProcessNotFoundError as e:
                if (house_global.gating_option):
                    house_global.device.enable_spawn_gating()
                    print(stylize("[!] Process not found, trying spawn-gating it..", MightBeImportant))
                    house_global.device.on('spawn-added', on_spawned)
                    return

                else:
                    print(stylize("[!] Process not found, trying to spawn it..", MightBeImportant))
                    pid = house_global.device.spawn([house_global.packagename])
                    house_global.session = house_global.device.attach(pid)
                    pending = True

            house_global.script = house_global.session.create_script(house_global.script_to_load)
            # IPython.embed()

            house_global.script.on('message', onMessage)
            house_global.script.load()

            # print (stylize('[+] Loading the new script..{} {}'.format(str(house_global.device), str(house_global.packagename)), Info))

            if pending:
                # IPython.embed()
                house_global.device.resume(pid)
        except Exception as e:
            print(stylize("[!]load_script Exception: {}".format(str(e)), Error))
            traceback.print_exc(file=sys.stdout)
            raise e

    else:
        print(stylize('[!]Please tell me what you want!', Error))
        raise Exception(" Failed to load script")


def loadMonitor():
    global Info
    getDevice()
    try:
        unload_script("monitor")
    except Exception as e:
        print(stylize(str(e), MightBeImportant))

    print(stylize("[!]Trying to load monitor script..", Info))
    build_monitor_script()
    if ((house_global.monitor_script != '') & (house_global.packagename != '') & (house_global.device != None)):
        try:
            pending = False
            try:
                pid = house_global.device.get_process(house_global.packagename).pid
                house_global.session = house_global.device.attach(house_global.packagename)
            except ProcessNotFoundError as e:
                print(stylize("[!] Process not found, trying to spawn it..", MightBeImportant))
                pid = house_global.device.spawn([house_global.packagename])
                house_global.session = house_global.device.attach(pid)
                pending = True

            house_global.monitor_script_object = house_global.session.create_script(house_global.monitor_script)
            # print house_global.monitor_script
            # IPython.embed()

            house_global.monitor_script_object.on('message', onMonitorMessage)
            house_global.monitor_script_object.load()
            print(stylize(
                '[+] Loading the monitor script..{} {}'.format(str(house_global.device), str(house_global.packagename)),
                Info))

            if pending:
                # IPython.embed()
                house_global.device.resume(pid)
        except Exception as e:
            print(stylize("[!]loadMonitor Exception: {}".format(str(e)), Error))
            traceback.print_exc(file=sys.stdout)
            raise e


def quitRepl():
    if (house_global.script):
        house_global.script.post({'type': 'input', 'payload': 'exit', 'option': "terminate"})
    else:
        print(stylize("No repl to terminate", MightBeImportant))

def unload_script(type="main"):
    if (house_global.session):
        try:
            print(stylize('[-] Unload the ' + type + ' script..', Info))
            if type == "stetho":
                house_global.stetho_script_object.unload()
            elif type == "monitor":
                # IPython.embed()
                house_global.monitor_script_object.unload()
            elif type == "preload":
                house_global.preload_script_object.unload()
            else:
                quitRepl()
                house_global.script.unload()
            # house_global.session.detach()
        except Exception as e:
            print(stylize('[!] unload_script: looks like {}'.format(str(e)), MightBeImportant))
    else:
        print(stylize("[-] No script exists", MightBeImportant))
