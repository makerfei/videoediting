import re
class RouteManager:
    """
    简单的路由管理器，支持 GET 和 POST 请求的路由注册与匹配。
    """
    def __init__(self):
        self.routes = {
            'GET': {},
            'POST': {}
        }
    def add_route(self, method, path, handler):
        """
        注册路由。
        :param method: 'GET' or 'POST'
        :param path: 正则表达式字符串或精确路径
        :param handler: 处理函数，接收 (handler_instance, params) 参数
        """
        if method not in self.routes:
            raise ValueError(f"Unsupported method: {method}")
        # 将路径编译为正则表达式，支持动态参数如 /api/user/(\d+)
        if not path.startswith('^'):
            path = f"^{path}$"
        self.routes[method][path] = handler

    def match_route(self, method, path):
        """
        匹配路由并返回处理函数及参数。
        """
        if method not in self.routes:
            return None, None
        
        for route_pattern, handler in self.routes[method].items():
            match = re.match(route_pattern, path)
            if match:
                return handler, match.groups()
        return None, None
