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
from houseGlobal import house_global,socketio, random_token

def init_conf():
    if not (os.path.exists('config')):
        os.makedirs('./config')
    if not (os.path.isfile("./config/hook_conf.json")):
        with open("./config/hook_conf.json",'w') as f:
            f.write('{"packagename": "", "hooks_list": []}')
    if not (os.path.isfile("./config/enum_conf.json")):
        with open("./config/enum_conf.json",'w') as f:
            f.write('{"packagename": "", "enum_option": "", "class_pattern": "", "class_to_find": ""}')
    if not (os.path.isfile("./config/intercept_conf.json")):
        with open("./config/intercept_conf.json",'w') as f:
            f.write('{"classname": "", "packagename": "", "methodname": "", "overloadIndex": 0}')
    if not (os.path.isfile("./config/env_conf.json")):
        with open("./config/env_conf.json",'w') as f:
            f.write('{"filesDirectory": "", "cacheDirectory": "", "externalCacheDirectory": "", "codeCacheDirectory": "", "packageCodePath": ""}')

def init_cache():
    if not (os.path.exists('cache/hook')):
        os.makedirs('./cache/hook')
    if not (os.path.exists('cache/enum')):
        os.makedirs('./cache/enum')
    if not (os.path.exists('cache/enum')):
        os.makedirs('./cache/intercept')
    if not (os.path.exists('cache/current')):
        os.makedirs('./cache/current')

    if not (os.path.isfile("./cache/current/enum_script")):
        with open('./cache/current/enum_script','w') as f:
            f.write('')
    if not (os.path.isfile("./cache/current/hook_script")):
        with open('./cache/current/hook_script','w') as f:
            f.write('')

def make_tree(path, option):
    tree = dict(name=os.path.basename(path), children=[])
    try: lst = os.listdir(path)
    except OSError:
        pass #ignore errors
    else:
        for name in lst:
            fn = os.path.join(path, name)
            tree['children'].append(dict(name=name, path=fn, op=option))
    return tree


def get_apk_path():
    with open("./config/env_conf.json",'r') as f:
        house_global.env_conf = f.read()
    try:
        j_env_conf = json.loads(house_global.env_conf)
        return j_env_conf.get("packageCodePath")
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
    with open('./config/hook_conf.json','wb') as f:
        f.write(json.dumps(house_global.hook_conf))

    with open('./config/enum_conf.json','wb') as f:
        f.write(json.dumps(house_global.enum_conf))

    with open('./config/intercept_conf.json','wb') as f:
        print stylize("[+] Updating intercept_conf with {}".format(json.dumps(house_global.inspect_conf)),Info)
        f.write(json.dumps(house_global.inspect_conf))

def init_settings():
    try:
        house_global.packagename = house_global.hook_conf["packagename"]
        house_global.hooks_list = house_global.hook_conf["hooks_list"]
        house_global.enum_class = house_global.enum_conf["class_to_find"]
    except Exception as e:
        pass

def cache_script(option, script):
    if option == "enum_cache":
        with open('./cache/current/enum_script','wb') as f:
            f.write(script)
    elif option == "hooks_cache":
        with open('./cache/current/hook_script','wb') as f:
            f.write(script)
    elif option == "intercept_cache":
        with open('./cache/current/intercept_script','wb') as f:
            f.write(script)
    else:
        print stylize("[!] Invalid cache script type", Error)

def clear_hook_msg():
    house_global.messages = []
    socketio.emit("clear_hook_msg")

def cache_inspect_html():
    with open('./config/inspect_cache.html','wb') as f:
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
    with open('./config/inspect_cache.html','wb') as f:
        f.write("")
    update_conf()
    
def setDevice(id):
    house_global.device = house_global.device_manager.get_device(id)
    print stylize("[+]Changing Device with id {}".format(id), MightBeImportant)
    try:
        socketio.emit('show_selected_device',
                  {'device_list': json.dumps(house_global.device_dict), 'selection': str(house_global.device.id)},
                  namespace='/eventBus')
    except Exception as e:
        raise e
    

def getDevice():
    try:
        print stylize("[+] Trying to get device..", Info)
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
            # IPython.embed()
            if house_global.device == None:
                socketio.emit('select_device',
                                  {'device_list': json.dumps(house_global.device_dict)},
                                  namespace='/eventBus')
            else:
                socketio.emit('show_selected_device',
                                  {'device_list': json.dumps(house_global.device_dict), 'selection': str(house_global.device.id)},
                                  namespace='/eventBus')
        else:
            raise Exception("No device Found!")
        # return str(house_global.device)
    except Exception as e:
        house_global.device = None
        socketio.emit('update_device', 
                {'data': cgi.escape(str(house_global.device))},          
                namespace='/eventBus')
        print stylize(str(e), Error)
        # raise e

def onMessage(message,data):
    house_global.onMessageException = ''

    if message['type'] == 'send':
        if(message.get('payload') != None):
            info = message.get('payload')
            info = u''.join(info).encode('utf-8').strip()
        else:
            info = "No message payload.."
    elif message['type'] == 'error':
        if(message.get('description') != None):
            house_global.onMessageException = cgi.escape(message.get('description'))
        else:
            house_global.onMessageException = 'No description'
        print stylize("[!]Error: {}".format(house_global.onMessageException), Error)
        socketio.emit('new_error_message',
                              {'data': "[!] {}".format(house_global.onMessageException)},
                              namespace='/eventBus')
        info = message.get('payload') if message.get('payload') else ''

    if "t3llm3mor3ab0ut1t" in info:
        env_info = info.replace("t3llm3mor3ab0ut1t",'')
        j_env_info = json.loads(env_info)

        if j_env_info.get("packageCodePath") != None:
            with open("./config/env_conf.json",'w') as f:
                json.dump(j_env_info,f)
        socketio.emit('update_env_info',
                              {'data': env_info},
                              namespace='/eventBus')

        # env stuff
    if "-hoo00ook-" in info:
        info = info.replace("-hoo00ook-",'')
        
        j_info = json.loads(info)
        args = j_info.get("arg_dump")
        method = j_info.get("method_info")
        retval = j_info.get("retval_dump")

        if args != None:
            args = args.replace(linebreak,'<br>')

        info_dict = {"methodname":method,"args":args,"retval":retval}
        house_global.messages.insert(0,info_dict)

        socketio.emit('new_hook_message',
                              {'data': json.dumps(info_dict)},
                              namespace='/eventBus')

    if "-enumMmMmMmMm-" in info:
        enum_msg = info.replace('undefined','').replace("-enumMmMmMmMm-",'')
        house_global.enum_messages.insert(0, enum_msg)
        socketio.emit("update_enum_messages",namespace='/eventBus')

    if "-t1m3f0rm1tm-" in info:
        intercept_msg = info.replace("-t1m3f0rm1tm-",'')

        if "-what1sth3t1m3n0w-" in intercept_msg:
            house_global.new_intercept_msg = intercept_msg.split("-what1sth3t1m3n0w-")[0]
            house_global.new_intercept_time = intercept_msg.split("-what1sth3t1m3n0w-")[1]
        else:
            house_global.new_intercept_msg = intercept_msg

        socketio.emit('new_intercept', {'data': house_global.new_intercept_msg, 'time': house_global.new_intercept_time}, namespace='/eventBus')

    if "-whatisth1smeth0d-" in info:
        inspect_info = info.replace("-whatisth1smeth0d-",'')

        j_inspect = json.loads(inspect_info)
        overload_info = j_inspect['methodInfo']

        overload_count = len(overload_info)

        inspect_class_name = house_global.inspect_conf["classname"]
        inspect_method_name = house_global.inspect_conf["methodname"]
        html_output = ""
        
        if overload_count > 1:
            html_output = "<p><code>{}</code></p>".format(cgi.escape(inspect_class_name) + '.' + cgi.escape(inspect_method_name))
            html_output += """
            <form action='/inspect' method='POST'>
              <div class="form-row align-items-center">
                <div class="col-auto my-1">
                  <label class="mr-sm-2"> Overloads: </label>
                  <select class="custom-select mr-sm-2" id="indexSelect">
            """
            for i in xrange(overload_count):
                html_output += """
                <option value={}><code>{}</code></option>
                """.format(str(i),cgi.escape(str(json.dumps(overload_info[i]))).replace("\\\"",""))

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
        update_inspect_result = {'classname': house_global.inspect_conf["classname"], 'methodname' : house_global.inspect_conf["methodname"], 'inspect_result': house_global.inspect_result}
        socketio.emit('update_inspect_result', update_inspect_result, namespace='/eventBus')


    if "-can1hav3ash3ll-" in info:
        house_global.new_repl_msg = info.replace("-can1hav3ash3ll-",'')
        socketio.emit('new_repl',
                      {'data': house_global.new_repl_msg, 'time': house_global.new_repl_time},
                      namespace='/eventBus')        
    

def render(tpl_path, context):
    path, filename = os.path.split(tpl_path)
    return jinja2.Environment(
        loader=jinja2.FileSystemLoader(path or './')
    ).get_template(filename).render(context)

def prepare_script_fragment(clazz_name, method_name,script_type,overloadIndex=0):
    context = {
    'clazz_name' : '',
    'method_name' : '',
    'clazz_hook' : '',
    'method_hook' : '',
    'overloadIndex' : str(overloadIndex)
    }
    if(clazz_name != None) & (clazz_name != '') & (method_name != None) & (method_name != ''):
        context['clazz_name'] = clazz_name
        context['method_name'] = method_name
        context['clazz_hook'] = str(clazz_name.split('.')[-1]) + '_hook'
        context['method_hook'] = str(method_name.replace('.','_')) + '_hook'

        if script_type == "inspect":
            result = render('./scripts/intercept/inspect.js',context)
        elif script_type == "intercept":
            result = render('./scripts/intercept/intercept.js',context)
        else:
            result = render('./scripts/hook/hook_frag.js',context)
        return result
    else:
        print stylize("[!]prepare_script_fragment Error with {} - {} - {} ".format(clazz_name, method_name,script_type),Error)
        return ''


def refresh():
    return render_template('index.html', uuid=str(random_token))


def build_hook_script():
    hooks_list = house_global.hook_conf['hooks_list']
    hooks_number = len(hooks_list)

    realscript = ""

    for i in xrange(hooks_number):
        entry = hooks_list[i]
        clazz_name = entry['classname']
        method_name = entry['methodname']
        realscript += prepare_script_fragment(clazz_name, method_name, "hook")
        realscript += "\n// Added Hook \n"
    context = {'scripts': realscript}

    result = render('./scripts/hook/hook_tpl.js',context)
    house_global.hook_script = result

    cache_script("hooks_cache", house_global.hook_script)


def build_enum_script(option, class_to_find, class_pattern):
    context = {'option': option, 'class_to_find': class_to_find, 'class_pattern': class_pattern, 'apk_path': get_apk_path()}

    result = render('./scripts/enum/enum_skl.js',context)
    house_global.enum_script_to_load = result

def load_script():
    global Info
    getDevice()
    if ((house_global.script_to_load != '') & (house_global.packagename != '') & (house_global.device != None)):
    
        # unload_script()
        print stylize('[+] Loading the new script..{} {}'.format(str(house_global.device), str(house_global.packagename)), Info)

        try:
            process = house_global.device.attach(house_global.packagename)
            house_global.script = process.create_script(house_global.script_to_load)
            house_global.script.on('message',onMessage)
            house_global.script.load()
        except Exception as e:
            print stylize("[!]load_script Exception: {}".format(str(e)), Error)
            raise e
        
    else:
        print stylize('[!]Please tell me what you want!', Error)
        raise Exception(" Failed to load script")

def quitRepl():
    if (house_global.script):
        house_global.script.post({'type': 'input', 'payload': 'exit', 'option': "terminate"})
    else:
        print stylize("No repl to terminate", MightBeImportant)

def unload_script():
    if(house_global.script):
        print stylize('[-] Unload the script..', Info)
        try:
            quitRepl()
            house_global.script.unload()
        except Exception as e:
            print stylize('[!] looks like {}'.format(str(e)), MightBeImportant)
    else:
        print stylize("[-] No script exists", MightBeImportant)