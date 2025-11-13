from django.contrib import admin
from .models import Post, Category, Tag, Author, PDFAttachment
# Register your models here.
# 1. 定义 PDFAttachment 的 "Inline" 界面
class PDFAttachmentInline(admin.TabularInline):
    model = PDFAttachment
    extra = 1 # 默认显示 1 个空的上传槽

# 2. 定义 Post 的自定义管理界面
class PostAdmin(admin.ModelAdmin):
    list_display = ('title',) # 举个例子，您可以在列表页看到标题
    # 您还可以添加搜索、过滤等
    # search_fields = ['title', 'body']
    # list_filter = ('category',)
    
    # 3. 将 PDF Inline 嵌入 Post Admin
    inlines = [PDFAttachmentInline]



# 使用自定义的 PostAdmin 来注册 Post
admin.site.register(Post, PostAdmin) 

# 其他模型使用默认方式注册
admin.site.register(Category)
admin.site.register(Tag)
admin.site.register(Author)

# PDFAttachment 模型不需要单独注册，因为它已经通过 Inline 注册到 Post 里面了
