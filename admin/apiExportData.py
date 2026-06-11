import json
import os
# 保存API导出数据
def apiExportData(handler, params):
    """处理 /api/echo POST 请求"""
    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    received_json = json.loads(post_data.decode('utf-8'))
    # 获取当前脚本所在的目录
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    try:
        # 拼接出目标文件路径（例如保存在脚本同级目录）
        file_path = os.path.join(parent_dir, received_json["path"])
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(received_json["data"], f, ensure_ascii=False, indent=4)
        status_code = 200
    except json.JSONDecodeError:
        status_code = 400
    handler.send_json_response(status_code, None)




