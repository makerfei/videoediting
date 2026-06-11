import json
import os
from admin.mysubprocess import *
# 保存API导出数据
def imagetovideo(handler, params):
    """处理 /api/echo POST 请求"""
    try:

        run_external_script("../videotool/imagetovideo.py")


        status_code = 200
    except json.JSONDecodeError:
        status_code = 400
    handler.send_json_response(status_code, None)
