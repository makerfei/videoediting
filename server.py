
import http.server
import socketserver
import json
import os
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import time
import webbrowser
from admin.RouteManager import RouteManager
from admin.apiExportData import *
from admin.uploadFrame import *
from admin.imagetovideo import *
PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIRECTORY = os.path.join(BASE_DIR, 'web')

# 全局路由实例
router = RouteManager()


router.add_route('POST', r'/api/imagetovideo',  imagetovideo)
router.add_route('POST', r'/api/exportData',  apiExportData)
router.add_route('POST', r'/api/upload/frame',  handle_upload_frame)












# --- 定义具体的业务处理函数 ---

def handle_status(handler, params):
    """处理 /api/status GET 请求"""
    response_data = {
        "status": "running",
        "message": "Hello from Python HTTP Server with Router",
        "timestamp": "2026-06-09T15:08:18"
    }
    handler.send_json_response(200, response_data)

def handle_home(handler, params):
    """处理 / GET 请求，返回 HTML"""
    html_content = """
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Python HTTP Router Server</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 50px; background-color: #f0f2f5; color: #333; }
            h1 { color: #2c3e50; margin-bottom: 20px; }
            p { color: #7f8c8d; line-height: 1.6; }
            .container { max-width: 700px; margin: auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
            .container:hover { transform: translateY(-5px); }
            a { color: #3498db; text-decoration: none; font-weight: bold; }
            a:hover { text-decoration: underline; }
            .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #3498db; color: white; border-radius: 5px; text-decoration: none; transition: background 0.3s; }
            .btn:hover { background-color: #2980b9; }
            code { background: #eee; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Python HTTP 路由服务</h1>
            <p>这是一个基于 <code>http.server</code> 构建的轻量级服务器，集成了自定义路由管理器。</p>
            <p>当前支持的功能：</p>
            <ul style="text-align: left; display: inline-block;">
                <li>GET <code>/</code> - 显示此页面</li>
                <li>GET <code>/api/status</code> - 获取服务状态 JSON</li>
                <li>POST <code>/api/echo</code> - 回显提交的 JSON 数据</li>
            </ul>
            <br>
            <a href="/api/status" class="btn">测试 GET API</a>
        </div>
    </body>
    </html>
    """
    handler.send_response(200)
    handler.send_header('Content-type', 'text/html; charset=utf-8')
    handler.end_headers()
    handler.wfile.write(html_content.encode('utf-8'))

def handle_echo_post(handler, params):
    """处理 /api/echo POST 请求"""
    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    
    try:
        received_json = json.loads(post_data.decode('utf-8'))
        response_data = {
            "success": True,
            "received_data": received_json,
            "message": "Data received and echoed successfully"
        }
        status_code = 200
    except json.JSONDecodeError:
        response_data = {
            "success": False,
            "error": "Invalid JSON format",
            "raw_data": post_data.decode('utf-8')
        }
        status_code = 400
        
    handler.send_json_response(status_code, response_data)

def handle_not_found(handler, params):
    """处理 404 错误"""
    handler.send_json_response(404, {"error": "Route not found"})

# --- 注册路由 ---
router.add_route('GET', r'/$', handle_home)
router.add_route('GET', r'/api/status', handle_status)
router.add_route('POST', r'/api/echo', handle_echo_post)


class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    自定义HTTP请求处理类，集成路由管理器。
    """

    def __init__(self, *args, **kwargs):
        # 更改当前工作目录到指定的静态文件路径
        # 注意：如果路由处理了所有请求，这步对于API非必须，但对于静态文件 fallback 是必须的
        if os.path.exists(DIRECTORY):
            os.chdir(DIRECTORY)
        super().__init__(*args, **kwargs)

    def send_json_response(self, status_code, data):
        """辅助方法：发送 JSON 响应"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def do_GET(self):
        """
        处理 GET 请求，优先匹配路由，未匹配则尝试静态文件。
        """
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # 尝试匹配路由
        handler_func, params = router.match_route('GET', path)
        
        if handler_func:
            handler_func(self, params)
        else:
            # 如果路由未匹配，回退到默认静态文件服务
            # 注意：SimpleHTTPRequestHandler 的 do_GET 已经实现了静态文件服务
            super().do_GET()

    def do_POST(self):
        """
        处理 POST 请求，优先匹配路由。
        """
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # 尝试匹配路由
        handler_func, params = router.match_route('POST', path)
        
        if handler_func:
            handler_func(self, params)
        else:
            # 如果没有匹配的 POST 路由，返回 404
            self.send_json_response(404, {"error": "POST route not found"})

    def log_message(self, format, *args):
        """自定义日志格式，更清晰"""
        print(f"[{self.log_date_time_string()}] {self.address_string()} - {format % args}")


def run_server():
    """
    启动 HTTP 服务器。
    """
    # 允许地址重用
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"✅ Serving HTTP on port {PORT} ...")
            print(f"🌐 Open http://localhost:{PORT} in your browser.")
            print(f"🛣️  Registered Routes:")
            print(f"   GET  /          -> Home Page")
            print(f"   GET  /api/status -> Status JSON")
            print(f"   POST /api/echo   -> Echo JSON")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down server...")
    except OSError as e:
        print(f"❌ Error starting server: {e}")


def open_browser():
    """
    延迟一小段时间后打开浏览器，确保服务器已启动。
    """
    # 等待1秒，确保服务器已经准备好接收请求
    time.sleep(1)
    url = f"http://127.0.0.1:{PORT}/index.html"
    print(f"🌐 Opening browser: {url}")
    webbrowser.open(url)

if __name__ == "__main__":
    # open_browser()
    run_server()
   
