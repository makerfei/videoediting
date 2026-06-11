import os
import json
import re
from email.parser import BytesParser
from email.policy import default

UPLOAD_FOLDER = 'uploaded_frames'

def ensure_upload_dir():
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)


def handle_upload_frame(handler, params):
    """
    处理 multipart/form-data 文件上传
    handler: BaseHTTPRequestHandler 实例
    params: 路由捕获的参数（本例中可能为空）
    """
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    try:
        # 1. 获取 Content-Type
        content_type = handler.headers.get('Content-Type')
        if not content_type or 'multipart/form-data' not in content_type:
            handler.send_json_response(400, {"error": "Content-Type must be multipart/form-data"})
            return

        # 2. 读取原始数据
        content_length = int(handler.headers.get('Content-Length', 0))
        body = handler.rfile.read(content_length)

        # 3. 使用 email.parser 解析 multipart
        msg_str = f"Content-Type: {content_type}\n\n".encode() + body
        parser = BytesParser(policy=default)
        msg = parser.parsebytes(msg_str)

        file_data = None
        filename = None
        frame_index = None

        # 4. 遍历部分
        if msg.is_multipart():
            for part in msg.iter_parts():
                name = part.get_param('name', header='Content-Disposition')
                
                if name == 'file':
                    filename = part.get_filename()
                    if filename:
                        file_data = part.get_payload(decode=True)
                elif name == 'index':
                    frame_index = part.get_payload(decode=True).decode('utf-8')

        if not file_data or not filename:
            handler.send_json_response(400, {"error": "No file uploaded or invalid form data"})
            return

       

        ensure_upload_dir()
        UPLOAD_FOLDER_FIL = os.path.join(parent_dir, UPLOAD_FOLDER)
        save_path = os.path.join(UPLOAD_FOLDER_FIL, filename)

        # 7. 写入文件
        with open(save_path, 'wb') as f:
            f.write(file_data)

        handler.send_json_response(200, {
            "message": "File uploaded successfully",
            "filename": filename,
            "index": frame_index
        })

    except Exception as e:
        print(f"Upload error: {str(e)}")
        handler.send_json_response(500, {"error": f"Internal server error: {str(e)}"})
