from rest_framework import serializers
from .models import Post, Category, Tag, Author, PDFAttachment
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = [
            'id', 'name', 'slug', 'avatar_url', 'occupation', 
            'company', 'email', 'twitter', 'linkedin', 'github', 'bio'
        ]
class PDFAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFAttachment
        fields = ['id', 'file', 'description']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'slug']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class PostSerializer(serializers.ModelSerializer):
    # category = CategorySerializer(read_only=True)
    tags = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name' # 或者 'slug'，取决于你想显示哪个
    )

    summary = serializers.SerializerMethodField()
    author = AuthorSerializer(read_only=True)
    pdf_attachments = PDFAttachmentSerializer(many=True, read_only=True)
    def get_summary(self, obj):
        # 从 obj.content (完整内容) 中截取前 150 个字符
        return obj.content[:150] + '...'
    class Meta: 
        model = Post
        fields = ['id',
                   'title', 
                   'content',
                   'category',
                   'tags',
                   'created_at', 
                   'updated_at',
                   'author',
                   'slug',
                   'summary',
                   'post_type',
                   'image_url',
                   'image_alt',
                   'author',
                   'author_id',
                   'pdf_attachments']