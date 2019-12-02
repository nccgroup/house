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

from flask import Flask
from flask_socketio import SocketIO, emit
import flask_login
from threading import Lock
import uuid

class houseGlobal:
	def __init__(self):
		self.session = None
		self.device_manager = None
		self.device_dict = {}
		self.device = None
		self.packagename = ""        # can have up to 1 package for each session
		self.script_to_load = ''
		self.script = None
		self.stetho_script_object = None
		self.monitor_script_object = None
		self.preload_script_object = None
		self.enum_script_to_load = ''
		self.hook_script = ''
		self.hook_script_mini = ''
		self.intercept_script = ''
		self.monitor_script = ''
		self.preload_script = ''
		self.enum_class = ''
		self.enum_class_pattern = ''
		self.enum_option = ''
		self.onMessageException = ''
		self.html_output = ""
		self.messages = []
		self.monitor_message = {"FILEIO":[], "IPC": [], "WEBVIEW":[],"SQL":[], "HTTP":[], "MISC":[], "SHAREDPREFERENCES": []}
		self.monitor_queue = set()
		self.new_hookmsg = False
		self.enum_messages = []
		self.new_inspect = False
		self.inspect_result = ''
		self.new_intercept = False
		self.new_intercept_msg = ''
		self.new_intercept_time = ''
		self.intercept_exception = ''
		self.new_repl_signal = False
		self.new_repl_msg = ''
		self.new_repl_time = ''
		self.hooks_list = []
		self.hook_conf = {}
		self.enum_conf = {}
		self.inspect_conf = {"classname": "", "methodname": "", "overloadIndex": 0, "packagename": ""}
		self.env_conf = {"filesDirectory": "", "cacheDirectory": "", "externalCacheDirectory": "", "codeCacheDirectory": "", "packageCodePath": ""}
		self.monitor_conf = {
							  "SWITCH_FILEIO": 1,
							  "SWITCH_HTTP": 1,
							  "SWITCH_WEBVIEW": 1,
							  "SWITCH_SQL": 1,
							  "SWITCH_IPC": 1,
							  "SWITCH_MISC": 1,
							  "SWITCH_SHAREDPREFERENCES": 1
							}
		self.monitor_refresh = 0
		self.preload_conf = {"PRELOAD_STETHO": 0, "PRELOAD_SSLSTRIP": 1, "PRELOAD_SETPROXY" : 0}
		self.gating_option = False
		self.spawn = None 		# experimental
		

house_global = houseGlobal()

app = Flask(__name__)
async_mode = None
socketio = SocketIO(app, async_mode=async_mode)
login_manager = flask_login.LoginManager()
login_manager.init_app(app)

thread = None
thread_lock = Lock()
random_token = uuid.uuid4().hex
# random_token = "deadbeef"

# with open('./templates/env.html') as f:
# 	env_html = f.read()
# with open('./templates/enum.html') as f:
#     enum_html = f.read()
# with open('./templates/hooks.html') as f:
#     hooks_html = f.read()
# with open('./templates/intercepts.html') as f:
#     intercepts_html = f.read()
# with open('./templates/preload.html') as f:
# 	preload_html = f.read()
# with open('./templates/monitor.html') as f:
# 	monitor_html = f.read()



