
import http.server
import socketserver
import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler



PORT = 8000
# 获取当前脚本所在的目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# 拼接出静态文件目录，例如当前目录下的 'web' 文件夹
DIRECTORY = os.path.join(BASE_DIR, 'web')

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    自定义HTTP请求处理类，继承自SimpleHTTPRequestHandler。
    支持静态文件服务，并扩展了API接口功能。
    """

    def __init__(self, *args, **kwargs):
        # 关键步骤：更改当前工作目录到指定的静态文件路径
        os.chdir(DIRECTORY)
        super().__init__(*args, **kwargs)
    def do_GET(self):
        """
        处理GET请求。
        如果路径是 /api/status，返回JSON状态信息。
        否则，作为静态文件服务器处理。
        """
        if self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response_data = {
                "status": "running",
                "message": "Hello from Python HTTP Server",
                "path": self.path
            }
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
        elif self.path == '/':
            # 返回一个简单的HTML首页
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            html_content = """
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <title>Python HTTP Server</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f9; }
                    h1 { color: #333; }
                    p { color: #666; }
                    .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>欢迎使用 Python HTTP 服务</h1>
                    <p>服务正在运行中。</p>
                    <p>尝试访问 <a href="/api/status">/api/status</a> 查看API响应。</p>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html_content.encode('utf-8'))
        else:
            # 调用父类方法处理静态文件
            super().do_GET()

    def do_POST(self):
        """
        处理POST请求。
        示例：接收JSON数据并回显。
        """
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        try:
            # 尝试解析收到的JSON
            received_json = json.loads(post_data.decode('utf-8'))
            response_data = {
                "received": True,
                "data": received_json,
                "message": "Data received successfully"
            }
        except json.JSONDecodeError:
            response_data = {
                "received": False,
                "error": "Invalid JSON",
                "raw_data": post_data.decode('utf-8')
            }
            
        self.wfile.write(json.dumps(response_data).encode('utf-8'))




def run_server():
    """
    启动HTTP服务器。
    """
    handler = MyHTTPRequestHandler
    
    # 允许地址重用，避免重启时报错 Address already in use
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving HTTP on port {PORT} ...")
        print(f"Open http://localhost:{PORT} in your browser.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.server_close()

if __name__ == "__main__":
    run_server()
