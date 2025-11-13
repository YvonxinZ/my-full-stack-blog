# blog_backend/settings.py
import os 
from pathlib import Path
import environ # <-- 导入 environ

# --- ↓↓↓ 初始化 environ ↓↓↓ ---
env = environ.Env(
    # set casting, default value
    DEBUG=(bool, False) # DEBUG 默认为 False
)
# --- 初始化结束 ---


BASE_DIR = Path(__file__).resolve().parent.parent

# --- ↓↓↓ 读取 .env 文件 (主要用于本地非 Docker 开发) ↓↓↓ ---
#    Docker Compose 会直接注入环境变量，所以这行对 Docker 运行不是必须的
#    但保留它可以让你本地不通过 Docker 也能运行 (如果你配置了本地 .env)
# environ.Env.read_env(os.path.join(BASE_DIR, '../.env')) # 指向总项目根目录的 .env
# --- 读取结束 ---


# --- ↓↓↓ 使用 env() 读取环境变量 ↓↓↓ ---
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY') 

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG') 
# --- 读取结束 ---

ALLOWED_HOSTS = [] # 生产环境需要修改


# Application definition
INSTALLED_APPS = [
    # ...
]

MIDDLEWARE = [
   # ...
   'corsheaders.middleware.CorsMiddleware', # 确保 CORS 中间件在 CommonMiddleware 之后
   'django.middleware.common.CommonMiddleware',
   # ...
]

ROOT_URLCONF = 'blog_backend.urls'
# ... (TEMPLATES, WSGI_APPLICATION) ...


# --- ↓↓↓ 修改数据库配置 ↓↓↓ ---
DATABASES = {
    # 使用 DATABASE_URL 环境变量 (推荐)
    'default': env.db(), 
    # 或者分开读取 (如果你的 .env 文件是分开写的)
    # 'default': {
    #     'ENGINE': env('DB_ENGINE', default='django.db.backends.postgresql'),
    #     'NAME': env('DB_NAME'),
    #     'USER': env('DB_USER'),
    #     'PASSWORD': env('DB_PASSWORD'),
    #     'HOST': env('DB_HOST', default='db'), # 默认主机名为 'db'
    #     'PORT': env('DB_PORT', default='5432'),
    # }
}
# --- 修改结束 ---

# ... (AUTH_PASSWORD_VALIDATORS, I18N, STATIC_URL, DEFAULT_AUTO_FIELD) ...

# --- ↓↓↓ CORS 配置 (保持不变，确保允许你的 Next.js 地址) ↓↓↓ ---
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # 你的 Next.js 开发地址
    "http://127.0.0.1:3000",
]
# 或者使用 CORS_ALLOW_ALL_ORIGINS = True (开发时)
# --- CORS 配置结束 ---from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-$na4^k$lw_99zcj^g)*6$px4fe5$tfv0e!3g!5j!7sp0*!f8od'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'rest_framework_simplejwt',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'posts',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    #'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'blog_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'blog_backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'
# 告诉 Django 把所有静态文件收集到哪里
# "staticfiles" 目录将会在你的 /app 目录 (BASE_DIR) 下创建
STATIC_ROOT = BASE_DIR / 'staticfiles'  # (推荐)
# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # 你的 Vite React 应用的地址
    "http://127.0.0.1:5173", # 同时也允许 127.0.0.1
]