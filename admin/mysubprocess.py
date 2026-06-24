import subprocess
import sys
import json
import threading

def write_input(process, inputs):
    """
    在线程中向子进程发送数据
    :param process: Popen 对象
    :param inputs: 要发送的数据列表
    """
    try:
        for data in inputs:
            # 确保数据以换行符结尾，模拟用户按下回车
            # if not data.endswith('\n'):
            #     data += '\n'
            # 写入数据
            process.stdin.write(data)
            # 【关键】必须刷新缓冲区，否则子进程收不到
            process.stdin.flush()
            # print(f"[Sent] {data.strip()}")
            
        # 所有数据发送完毕后，关闭 stdin 告诉子进程“输入结束”
        # 注意：如果子进程需要持续交互，不要关闭，而是保持打开
        process.stdin.close() 
    except Exception as e:
        print(f"写入错误: {e}")

def run_external_script(script_path, input_value="",venv_python_path="/Users/zhangfei/miniconda3/bin/python" ,handler=None,callback=None):
   
    # 启动进程
    process = subprocess.Popen(
        [venv_python_path, "-u", script_path],
        stdin=subprocess.PIPE,   # 必须开启 stdin 管道
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT, # 将错误合并到标准输出，避免遗漏
        text=True,                # 以文本模式处理
        bufsize=1                 # 行缓冲
    )
        # 1. 启动线程专门负责“传值”
    t_write = threading.Thread(target=write_input, args=(process, json.dumps(input_value)))
    t_write.start()
   # 2. 主线程负责“实时读取并打印”
    try:    
        outPut = ""
        for line in process.stdout:
            print(f"[Recv] {line.strip()}")
            outPut += line.strip()
            
        if(callback):
            outPut = outPut.split("--完成--")[1]
            callback(handler,outPut)
    except Exception as e:
        print(f"读取错误: {e}")

    # 3. 等待线程和进程结束
    t_write.join()
    process.wait()

def callback(handler,indata):
    handler.send_json_response(200, indata)
    pass

def script_api(handler, params):
    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    received_json = json.loads(post_data.decode('utf-8'))
    script_path = received_json["script_path"]
    input_value = received_json["input_value"]
    venv_python_path ="/Users/zhangfei/miniconda3/bin/python" 
    if received_json["venv_python_path"] is not None:
        venv_python_path = received_json["venv_python_path"]

    run_external_script(script_path,input_value,venv_python_path,handler,callback)

   

   











# 使用
# run_external_script("t.py", {"prompt": "讲一个好玩的故事"})
# run_external_script("tt.py", {"a": "讲一个好玩的故事"})



