# Dockerfile (位于 blog_backend/ 目录下)

# 1. 使用官方 Python 镜像作为基础
FROM python:3.11-slim-bullseye 
# (你可以选择你本地开发使用的 Python 版本，slim 版本更小)

# 2. 设置环境变量
ENV PYTHONDONTWRITEBYTECODE 1 # 防止 Python 写入 .pyc 文件
ENV PYTHONUNBUFFERED 1     # 让 Python 输出直接打印到终端，方便看日志

# 3. 设置工作目录
WORKDIR /app
# 之后的所有命令都会在这个目录下执行
ENV PYTHONPATH /app

# 4. 安装依赖
#    首先只复制 requirements.txt，利用 Docker 缓存
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# 5. 复制项目代码
#    将当前目录 (blog_backend/ 里的所有内容) 复制到容器的 /app 目录
COPY . .

# 6. (开发阶段) 暴露端口
#    告诉 Docker 容器将监听 8000 端口
EXPOSE 8000

# 7. (开发阶段) 定义容器启动时运行的命令
#    启动 Django 开发服务器，监听所有 IP 地址
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# 注意：对于生产环境，CMD 应该使用 Gunicorn 或 uWSGI
# CMD ["gunicorn", "blog_backend.wsgi:application", "--bind", "0.0.0.0:8000"]