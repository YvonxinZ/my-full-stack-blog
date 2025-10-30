from django.contrib import admin
from .models import Post, Category, Tag, Author
# Register your models here.


# 注册模型到 admin 站点
admin.site.register(Post)
admin.site.register(Category)
admin.site.register(Tag)
admin.site.register(Author)