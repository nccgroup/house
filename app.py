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

from houseGlobal import house_global, app, socketio, random_token
from houseStatic import *
from houseUtil import *
from houseSock import *
from sys import argv
import uuid, flask_login

import logging

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)


@app.route('/')
def hello():
    if str(request.remote_addr) == "127.0.0.1":
        # no dns rebinding
        return refresh()
    else:
        return ''

@app.route('/messages', methods=['GET'])
def message():
    return json.dumps(house_global.messages)


@app.route('/enum_messages', methods=['GET'])
def enum_message():
    return ''.join(str(e) for e in house_global.enum_messages)

@app.route('/hook_conf', methods=['GET'])
def hook_config():
    return json.dumps(house_global.hook_conf)

@app.route('/hook_script', methods=['GET'])
def getHookScript():
    try:
        with open("./cache/current/hook_script",'r') as f:
            house_global.hook_script = f.read()
    except Exception as e:
        house_global.hook_script = str(e)
        
    if checkok():
        return house_global.hook_script
    else:
        return "Please double check you have input the packagename and hooks info"

@app.route('/enum_script', methods=['GET'])
def getEnumScript():
    option = house_global.enum_option
    build_enum_script(option, house_global.enum_class, house_global.enum_class_pattern)
    return house_global.enum_script_to_load

@app.route('/package', methods=['GET'])
def getpkg():
    return house_global.packagename

@app.route('/hook_clear', methods=['GET'])
def hook_clear():
    house_global.hooks_list = []
    update_conf()

    return refresh()

@app.route('/hook', methods=['POST'])
def hook():
    house_global.device = frida.get_usb_device()
    class_name = str(request.form.get('classname'))
    method_name = str(request.form.get('methodname')) 
    if (method_name != 'None') & (class_name != 'None'):
    # TODO: use jinja to render script dynamically
        hook_dict = {"classname": class_name, "methodname": method_name}
        house_global.hooks_list.append(hook_dict)
        update_conf()
        house_global.script_to_load = ''

    return refresh()

@app.route('/load_script', methods=['POST'])
def loadscript():
    house_global.device = frida.get_usb_device()

    house_global.script_to_load = str(request.form.get('script'))
    load_script()
    return refresh()

def main():
    print """
  ___ ___                             
 /   |   \  ____  __ __  ______ ____  
/    ~    \/  _ \|  |  \/  ___// __ \ 
\    Y    (  <_> )  |  /\___ \\  ___/ 
 \___|_  / \____/|____//____  >\___  >
       \/      House        \/     \/ 

    Dynamic Mobile Analysis Tool
    Contact: hao.ke@nccgroup.trust

Communications will happen over USB, make sure have your android device plugged in.
    """
    init_conf()
    init_cache()
    if house_global.packagename == "":
        with open('./config/hook_conf.json','r') as f:
            hook_conf_rd = f.read()
            house_global.hook_conf = json.loads(hook_conf_rd)
        with open('./config/enum_conf.json','r') as f:
            enum_conf_rd = f.read()
            if enum_conf_rd != "":
                try:
                    enum_conf = json.loads(enum_conf_rd)
                except Exception as e:
                    print stylize("[!]enum_conf invalid format",Error)
    with open('./config/intercept_conf.json','r') as f:
        intercept_conf_rd = f.read()
        if intercept_conf_rd != "":
            try:
                house_global.inspect_conf = json.loads(intercept_conf_rd)
            except Exception as e:
                print stylize("[!]intercept_conf invalid format",Error)
    init_settings()
    
    host = "127.0.0.1"
    if len(argv) > 1:
        port = int(argv[1])
    else:
        port  = 8000
    print stylize("[+] House running at http://127.0.0.1:{}".format(port), Info)
    socketio.run(app, host = host, port = port, debug=False)
    

if __name__ == '__main__':
    main()
