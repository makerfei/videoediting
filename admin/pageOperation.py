from pathlib import Path
import os
import json
def getSourceData(handler, params):

    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    received_json = json.loads(post_data.decode('utf-8'))
    fileName = received_json["source"]
    path_obj = Path(fileName)
    files = []
   
    # rglob("*") 递归匹配所有项
    for p in path_obj.iterdir():
        # 将 Path 对象转换为字符串，方便 JSON 序列化
        # as_posix() 可以统一将 Windows 的反斜杠 \ 转换为正斜杠 /，便于前端处理
        path_str = p.as_posix()
        if p.is_dir():
            files.append(path_str)
        elif p.is_file  and (p.suffix.lower() == '.json' or p.suffix.lower() == '.png' or p.suffix.lower() == '.jpg'):
            files.append(path_str)

    status_code = 200
    handler.send_json_response(status_code, {
        "files": files,
    })


   



