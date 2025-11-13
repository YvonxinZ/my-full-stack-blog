# 从 django.db 中导入 models 模块，这是定义模型的基础
from django.db import models
# 从 Django 自带的用户认证系统中导入 User 模型，用来关联作者
from django.contrib.auth.models import User
from django.utils.text import slugify

# --- 分类模型 ---
class Author(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Name")
    slug = models.SlugField(max_length=100, unique=True, blank=True, verbose_name="Slug (auto-generated)")
    
    # 使用 CharField 而不是 URLField 来灵活支持本地路径 (如 /static/avatar.png)
    avatar_url = models.CharField(max_length=500, blank=True, null=True, verbose_name="Avatar URL or Path")
    
    occupation = models.CharField(max_length=100, blank=True, null=True, verbose_name="Occupation")
    company = models.CharField(max_length=100, blank=True, null=True, verbose_name="Company")
    email = models.EmailField(blank=True, null=True, verbose_name="Email")
    
    # URLField 适合外部链接
    twitter = models.URLField(max_length=200, blank=True, null=True, verbose_name="Twitter URL")
    linkedin = models.URLField(max_length=200, blank=True, null=True, verbose_name="LinkedIn URL")
    github = models.URLField(max_length=200, blank=True, null=True, verbose_name="GitHub URL")
    
    bio = models.TextField(blank=True, null=True, verbose_name="Biography (supports Markdown/HTML)")

    class Meta:
        verbose_name = "Author"
        verbose_name_plural = "Authors"

    def save(self, *args, **kwargs):
        if not self.slug:
            # 自动从 name 生成 slug
            self.slug = slugify(self.name, allow_unicode=True) 
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
# 一个分类下可以有多篇文章 (一对多)
class Category(models.Model):
    # 分类名称：CharField 表示这是一个字符串字段，max_length 是最大长度
    # unique=True 保证了每个分类名都是唯一的，不会重复
    name = models.CharField(max_length=100, unique=True, verbose_name="Category Name")
    parent=models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children'
    )
    slug = models.SlugField(max_length=100, unique=True, blank=True, verbose_name="Slug")
    class Meta:
        # 这个是模型元数据，verbose_name_plural 是后台管理界面中模型的复数形式
        verbose_name = "Category"
        verbose_name_plural = 'Categories'
        ordering = ['name']
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)

    # __str__ 方法定义了当打印这个对象时，显示的内容。这里我们显示分类的名称。
    def __str__(self):
        full_path = [self.name]
        k = self.parent
        while k is not None:
            full_path.append(k.name)
            k=k.parent
        return ' > '.join(full_path[::-1])

# --- 标签模型 ---
# 一篇文章可以有多个标签，一个标签也可以对应多篇文章 (多对多)
class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Tag Name")
    slug = models.SlugField(max_length=100, unique=True, blank=True, verbose_name="Slug")
    class Meta:
        verbose_name = "Tag"
        verbose_name_plural = "Tags"
    def save(self, *args, **kwargs):
            if not self.slug:
                self.slug = slugify(self.name, allow_unicode=True)
            super().save(*args, **kwargs)
    def __str__(self):
        return self.name

# --- 文章模型 ---
class Post(models.Model):
    title = models.CharField(max_length=200, verbose_name="Title")
    # TextField 用于存储大段文本，比如文章内容
    content = models.TextField(verbose_name="Content")
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name="Slug")
    # DateTimeField 用于存储日期和时间
    # auto_now_add=True 表示在对象第一次被创建时，自动将当前时间存入
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creation Time")
    # auto_now=True 表示在对象每次被保存时，自动将当前时间存入
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Last Updated")
    post_type = models.CharField(max_length=10, choices=[('blog', 'Blog Post'), ('moment', 'Moment Card')], default='blog')
    image_url = models.CharField(max_length=500, blank=True, null=True)
    image_alt = models.CharField(max_length=200, blank=True)
    # 【关系字段】
    # 作者 (一对多): 使用 ForeignKey 关联到 Django 的 User 模型
    # on_delete=models.CASCADE 表示当关联的作者(User)被删除时，这篇帖子也一并被删除
    author = models.ForeignKey(Author, on_delete=models.CASCADE, verbose_name="Author")

    # 分类 (一对多): 使用 ForeignKey 关联到我们上面定义的 Category 模型
    # on_delete=models.SET_NULL 表示当分类被删除时，这篇文章的 category 字段被设为 NULL，而不是删除文章
    # null=True, blank=True 允许这篇文章不选择任何分类
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Category"
    )

    # 标签 (多对多): 使用 ManyToManyField 关联到我们上面定义的 Tag 模型
    # blank=True 允许这篇文章没有任何标签
    tags = models.ManyToManyField(Tag, blank=True, verbose_name="标签")
    def save(self, *args, **kwargs):
        if not self.slug:
            # 注意：这里我们用 self.title 来生成 slug
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)
    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Posts"
        ordering = ['-created_at'] # 最新的在前面

    def __str__(self):
        return self.title
    
class PDFAttachment(models.Model):
    # 2. 核心：使用 ForeignKey 关联到 Post
    # related_name='pdf_attachments' 非常重要, 它允许我们从 Post 反向查询
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='pdf_attachments')
    
    # 3. PDF 文件字段
    file = models.FileField(upload_to='pdf_attachments/', verbose_name="PDF文件")
    
    # (可选) 您还可以给附件加个描述
    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="文件描述")

    def __str__(self):
        # 返回文件名
        return self.file.name.split('/')[-1]

    class Meta:
        verbose_name = "PDF附件"
        verbose_name_plural = "PDF附件"

