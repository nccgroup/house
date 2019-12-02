# MIT License

# Copyright (c) 2018 NCC Group Plc

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

from houseGlobal import house_global, socketio, thread, thread_lock, random_token, login_manager
from flask_socketio import SocketIO, emit
from flask_socketio import disconnect
from houseStatic import *
from houseUtil import *
import functools
import hmac
from flask_login import current_user, login_user, UserMixin
from flask_socketio import disconnect

class User(UserMixin):

    def __init__(self, id):
        self.id = id
        
    def __repr__(self):
        return "User: %s" % (self.id)

session_user = User(random_token)

@login_manager.user_loader
def user_loader(uuid):
    if uuid != session_user.id:
        return

    return session_user

def authenticated_only(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        if not current_user.is_authenticated:
            disconnect()
        else:
            return f(*args, **kwargs)
    return wrapped

@socketio.on('connect', namespace='/eventBus')
def sock_connect():
    emit('log', {'data': 'Connected'})

@socketio.on('authentication', namespace='/eventBus')
def sock_auth(msg):
    uuid = str(msg.get('uuid'))
    # print (stylize("[+] Login.. with uuid : {}".format(uuid), Info))
    if hmac.compare_digest(str(uuid), str(random_token)):
        this_user = User(uuid)
        login_user(this_user)
        emit("authenticated..")
    else:
        emit("auth_failed..")



@socketio.on('enableAutoRefresh', namespace='/eventBus')
@authenticated_only
def enableAutoRefresh():
    house_global.monitor_refresh = 1

@socketio.on('diableAutoRefresh', namespace='/eventBus')
@authenticated_only
def diableAutoRefresh():
    house_global.monitor_refresh = 0


@socketio.on('refresh_device', namespace='/eventBus')
@authenticated_only
def refresh_device():
    getDevice()
    # emit('update_device', {'data': cgi.escape(str(house_global.device))})

@socketio.on('check_monitor_running', namespace='/eventBus')
@authenticated_only
def check_monitor_running():
    # not working, house_global.monitor_script.unload() won't destroy it, did not find a destroy script method
    print (stylize("[+]Checking if Monitor is running...", Info))
    IPython.embed()
    if (house_global.monitor_script != '') & (house_global.monitor_script != None):
        emit('monitor_running_status', {'running': 1})
    else:
        emit('monitor_running_status', {'running': 0})
    # getDevice()


@socketio.on('set_device_id', namespace='/eventBus')
@authenticated_only
def set_device(msg):
    # clean up script for previous devices
    unload_script()
    device_id = msg.get('id')
    setDevice(device_id)
    # emit('update_device', {'data': cgi.escape(str(house_global.device))})

@socketio.on('setPackage', namespace='/eventBus')
@authenticated_only
def setpkg(msg):
    house_global.package_name = msg.get('packagename')
    setPackage(house_global.package_name)

    emit('update_package', {'data': cgi.escape(str(house_global.package_name))})

@socketio.on("setEnumConfig", namespace='/eventBus')
@authenticated_only
def update_EnumConfig(message):
    enum_option = message.get('option')
    class_to_find = message.get('class_to_find')
    class_pattern = message.get('class_pattern')
    if class_to_find != None:
        house_global.enum_class = class_to_find if ('.' in class_to_find) else house_global.packagename + '.' + class_to_find
    if class_pattern != None:
        house_global.enum_class_pattern = class_pattern
    if enum_option != None:
        house_global.enum_option = enum_option
    update_conf()
    emit("EnumConfigDone")

@socketio.on('get_monitor_message', namespace='/eventBus')
@authenticated_only
def get_monitor_message():
    # ret_html = render_template('history.html', tree=make_tree(path,'enum'))
    # emit('update_monitor_message', {'mon_type': mon_type.upper(), 'monitor_message': house_global.monitor_message})
    emit('update_monitor_message', {'monitor_message': house_global.monitor_message, 'monitor_new': list(house_global.monitor_queue)})
    house_global.monitor_queue = set()

@socketio.on('get_enum_history', namespace='/eventBus')
@authenticated_only
def get_enum_history():
    path = './cache/enum'
    ret_html = render_template('history.html', tree=make_tree(path,'enum'))
    emit("update_enum_history", {'data': ret_html})

@socketio.on('get_hooks_history', namespace='/eventBus')
@authenticated_only
def hooks_history():
    path = './cache/hook'
    ret_html = render_template('history.html', tree=make_tree(path,'hook'))
    emit("update_hooks_history", {'data': ret_html})

@socketio.on('get_intercept_history', namespace='/eventBus')
@authenticated_only
def get_intercept_history():
    path = './cache/intercept'
    ret_html = render_template('history.html', tree=make_tree(path,'intercept'))
    emit("update_intercept_history", {'data': ret_html})


@socketio.on('get_history_script', namespace='/eventBus')
@authenticated_only
def get_history_script(data):
    path = data.get("filepath")
    option = data.get("option")
    try:
        with open(path,'r') as f:
            script_content = f.read()
            emit("update_script_content",{'script': script_content, "option": option})
    except Exception as e:
        emit("update_script_content",{'script': "[!] Failed to get script: " + str(e), "option": option})

@socketio.on('save_script', namespace='/eventBus')
@authenticated_only
def save_script(save_script_data):
    option = save_script_data.get("option")
    filename = save_script_data.get("filename")
    if (filename):
        filename = os.path.split(filename)[1]
    script = save_script_data.get("script")

    if option == "hook":
        try:
            with open("./cache/hook/" + filename, 'w') as f:
                f.write(script)
        except Exception as e:
            raise e
    elif option == "enum":
        
        try:
            with open("./cache/enum/" + filename, 'w') as f:
                f.write(script)
        except Exception as e:
            raise e
    elif option == "intercept":
        try:
            with open("./cache/intercept/" + filename, 'w') as f:
                f.write(script)
        except Exception as e:
            raise e
    else:
        print (stylize("Failed to save the file!", Error))

@socketio.on('deleteScript', namespace='/eventBus')
@authenticated_only
def deleteScript(data):
    path = data.get('path')
    if path != None:
        if path.startswith('./cache/enum'):
            fn = './cache/enum/' + os.path.basename(path)
            op = "enum"

        elif path.startswith('./cache/hook'):
            fn = './cache/hook/' + os.path.basename(path)
            op = "hook"

        elif path.startswith('./cache/intercept'):
            fn = './cache/intercept/' + os.path.basename(path)
            op = "intercept"
        else:
            return
    else:
        emit('new_error_message',{'data' : "[!] What are you trying to delete?"})
        return

    try:
        os.remove(fn)
        emit("refresh_history_script",{'option': op})
    except Exception as e:
        emit('new_error_message',{'data' : "[!] Cannot delete: " + str(e)})

@socketio.on('gen_script', namespace='/eventBus')
@authenticated_only
def gen_script(message):
    house_global.hooks_list = message.get('hooks_list')
    update_conf()
    house_global.script_to_load = ''
    house_global.hooks_list = house_global.hook_conf.get('hooks_list')
    build_hook_script()
    emit("update_hooks")

@socketio.on('gen_script_mini', namespace='/eventBus')
@authenticated_only
def gen_script_mini(message):
    house_global.hooks_list = message.get('hooks_list')
    update_conf()
    house_global.script_to_load = ''
    house_global.hooks_list = house_global.hook_conf.get('hooks_list')
    build_hook_mini_script()
    emit("update_hooks_mini")

@socketio.on('unload_script', namespace='/eventBus')
@authenticated_only
def doUnload():
    print (stylize("[+]Unloading script..", Info))
    unload_script()

@socketio.on('clear_hookMessage', namespace='/eventBus')
@authenticated_only
def clear_hookMessage():
    house_global.messages = []
    print (stylize("[+] Hook Message Cleard", Info))

@socketio.on('clear_monitorMessage', namespace='/eventBus')
@authenticated_only
def clear_monitorMessage(message):
    clear_type = message.get('monitor_type').upper()
    if (clear_type != None) & (clear_type in house_global.monitor_message.keys()):
        house_global.monitor_message[clear_type] = []
    

@socketio.on('clear_EnumMessage', namespace='/eventBus')
@authenticated_only
def clear_EnumMessage():
    house_global.enum_messages = []

@socketio.on('quitRepl', namespace = '/eventBus')
@authenticated_only
def doneRepl():
    quitRepl()

@socketio.on('loadHookScript', namespace='/eventBus')
@authenticated_only
def doLoadHook(message):
    clear_hook_msg()
    j_script = message.get('script')
    if j_script != None:
        house_global.script_to_load = j_script
        house_global.hook_script = j_script
        cache_script("hooks_cache", house_global.hook_script)
        try:
            load_script()
        except Exception as e:
            print ("doLoadHook exception caught!" + str(e))
            clear_hook_msg()
            hook_exception = {"exception" : str(e)}
            house_global.messages.insert(0,hook_exception)

            emit("new_hook_message",hook_exception)

@socketio.on('loadEnumScript', namespace='/eventBus')
@authenticated_only
def doLoadEnum(message):
    j_script = message.get('script')
    if j_script != None:
        house_global.script_to_load = j_script
        house_global.enum_script_to_load = j_script
        house_global.enum_messages = []
        cache_script("enum_cache", house_global.enum_script_to_load)
        try:
            load_script()
        except Exception as e:
            doLoadEnum_exception = {"exception" : str(e)}
            house_global.enum_messages = [ ]
            house_global.enum_messages.insert(0,doLoadEnum_exception)
            emit("update_enum_messages")

@socketio.on('doEnv', namespace='/eventBus')
def doEnv():
    # with open('./scripts/enum/env.js') as f:
    #     house_global.script_to_load = f.read()
    house_global.script_to_load = build_env_script()
    try:
        load_script()
    except Exception as e:
        # IPython.embed()
        emit('update_env_info',{'error': cgi.escape("[!]load_script Exception: {}".format(str(e)))})

@socketio.on('loadStetho', namespace='/eventBus')
def doLoadStetho():

    try:
        preload_stetho_script()
    except Exception as e:
        # IPython.embed()
        emit('sideload_stetho_error',{'error': cgi.escape("[!]preload_stetho_script Exception: {}".format(str(e)))})

@socketio.on('runpreload', namespace='/eventBus')
def runpreload(preload_message):
    house_global.preload_conf = preload_message.get('preload_settings')
    update_conf()
    try:
        run_preload_script()
    except Exception as e:
        # IPython.embed()
        emit('runpreload',{'error': cgi.escape("[!]preload_script Exception: {}".format(str(e)))})


@socketio.on('loadMonitor', namespace='/eventBus')
def doloadMonitor(monitor_message):
    house_global.monitor_conf = monitor_message.get('monitor_settings')
    update_conf()
    try:
        loadMonitor()
        # check_monitor_running()
    except Exception as e:
        # IPython.embed()
        emit('doloadMonitor',{'error': cgi.escape("[!]doloadMonitor Exception: {}".format(str(e)))})


@socketio.on('endpreload', namespace='/eventBus')
def endpreload():
    house_global.preload_conf = {"PRELOAD_STETHO": 0, "PRELOAD_SSLSTRIP": 1, "PRELOAD_SETPROXY" : 0}
    update_conf()
    try:
        unload_script("preload")
        # check_monitor_running()
    except Exception as e:
        # IPython.embed()
        emit('endpreload',{'error': cgi.escape("[!]endpreload Exception: {}".format(str(e)))})


@socketio.on('unloadMonitor', namespace='/eventBus')
def dounloadMonitor():
    house_global.monitor_conf = {"SWITCH_FILEIO": 0, "SWITCH_HTTP": 0, "SWITCH_MISC": 0, "SWITCH_WEBVIEW": 0, "SWITCH_SQL": 0, "SWITCH_IPC": 0}
    update_conf()
    try:
        unload_script("monitor")
        # check_monitor_running()
    except Exception as e:
        # IPython.embed()
        emit('dounloadMonitor',{'error': cgi.escape("[!]dounloadMonitor Exception: {}".format(str(e)))})

@socketio.on('doInspect', namespace='/eventBus')
@authenticated_only
def doInspect(message):

    house_global.device = frida.get_usb_device()

    house_global.onMessageException = ''
    ins_classname = message.get('ins_classname')
    ins_methodname = message.get('ins_methodname')

    if (ins_classname != None) & (ins_methodname != None):
        house_global.inspect_conf['classname'] = ins_classname 
        house_global.inspect_conf['methodname'] = ins_methodname

        update_conf()

        house_global.inspect_result = 'Please wait'
        house_global.script_to_load = prepare_script_fragment(ins_classname, ins_methodname, "inspect")
        try:
            load_script()
        except Exception as e:
            house_global.inspect_result = "<p><code>[!] Exception: {}</code></p>".format(str(e))
            print (stylize("Exception caught in doInspect: {}".format(e), Info))
            update_inspect_result = {'classname': house_global.inspect_conf["classname"], 'methodname' : house_global.inspect_conf["methodname"], 'inspect_result': (str(house_global.inspect_result))}
            cache_inspect_html()
            socketio.emit('update_inspect_result', update_inspect_result, namespace='/eventBus')
            house_global.onMessageException = ''

@socketio.on('fetchInspect', namespace='/eventBus')
@authenticated_only
def fetchInspect():
    overloadIndex = house_global.inspect_conf.get("overloadIndex")
    if house_global.inspect_result == '':
        with open("./config/inspect_cache.html",'w+') as f:
            house_global.inspect_result = f.read()


    update_inspect_result = {'classname': house_global.inspect_conf["classname"], 'methodname' : house_global.inspect_conf["methodname"], 'inspect_result': house_global.inspect_result, 'overloadIndex' : overloadIndex}
    emit('update_inspect_result', update_inspect_result)


@socketio.on('genIntercept', namespace='/eventBus')
@authenticated_only
def genIntercept(message):
    ins_methodindex = message.get('intercept_index')
    if (ins_methodindex != None):
        house_global.inspect_conf['overloadIndex'] = int(ins_methodindex)
    else:
        house_global.inspect_conf['overloadIndex'] = 0
    update_conf()

    with open('./config/intercept_conf.json') as f:
        intercept_conf = f.read()
        try:
            j_intercept = json.loads(intercept_conf)
        except Exception as e:
            raise e

    print (stylize("[+]Lets do intercept",Info))
    clazz_name = j_intercept.get("classname")
    methodname = j_intercept.get("methodname")
    overloadIndex = j_intercept.get("overloadIndex")

    if overloadIndex == None:
        overloadIndex = 0
    house_global.intercept_script = prepare_script_fragment(clazz_name, methodname, "intercept", overloadIndex)
    socketio.emit('update_intercept_script', {'script': house_global.intercept_script}, namespace='/eventBus')

   
@socketio.on('load_intercept_script', namespace='/eventBus')
@authenticated_only
def load_intercept_script(message):
    house_global.intercept_script = message.get('script')
    house_global.script_to_load = message.get('script')
    cache_script("intercept_cache", house_global.intercept_script)
    try:
        load_script()
    except Exception as e:
        house_global.intercept_exception = "[!] intercept_exception: {}".format(str(e))
        socketio.emit('new_intercept', {'data': house_global.intercept_exception, 'time': house_global.new_intercept_time}, namespace='/eventBus')



@socketio.on('intercept_param', namespace='/eventBus')
@authenticated_only
def sock_intercept(message):

    j_option = message['option']
    j_param = message['data']
    time_stamp = message['time'].replace('"','')
    if (j_option == "intercept_param"):
        print (stylize("[+] Posting {} @ {} to Frida..".format(json.loads(j_param),time_stamp),Info))

        house_global.script.post({'type': 'input', 'payload': json.loads(j_param), 'time': time_stamp, 'option': "intercept_param"})
    elif (j_option == "intercept_repl"):
        print (stylize("[+] Posting {} to Frida REPL..".format(j_param),Info))
        house_global.script.post({'type': 'input', 'payload': j_param, 'time': time_stamp, 'option': "intercept_repl"})
