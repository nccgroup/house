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

import colored
from enum import Enum
from colored import stylize

import frida
import sys
import requests
import json
# import IPython
import jinja2
import os
from flask import render_template, request
import argparse

if sys.version_info >= (3, 8):
    import html as cgi
else:
    import cgi

Error = colored.fg("red") + colored.attr("bold")
Info = colored.fg("green") + colored.attr("bold")
MightBeImportant = colored.fg("blue") + colored.attr("bold")

linebreak = "h0us3l1nebr3ak"
codeblock = "h0us3bl0ck"
delimiter = "h4oar3ud0ing"

class dynamicHookOption(Enum):
    only_new = "new"
    only_existing = "existing"
    both = "all"
