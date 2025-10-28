from rest_framework import viewsets
from .models import Post, Category, Tag
from .serializers import PostSerializer, CategorySerializer, TagSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]



class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer

    # 我们不再使用简单的 queryset = Post.objects.all()
    queryset = Post.objects.all()
    # 而是重写 get_queryset 方法来实现动态过滤
    lookup_field = 'slug'
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # 'list' (列表) 和 'retrieve' (详情) 允许任何人
            permission_classes = [AllowAny]
        else:
            # 'create', 'update', 'destroy' 等操作需要登录
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    def get_queryset(self):
        # 1. 先获取所有文章
        queryset = Post.objects.all()

        # 2. 检查 URL 参数中是否有 'tag_slug'
        tag_slug = self.request.query_params.get('tag_slug')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)

        # 3. 检查 URL 参数中是否有 'category_slug'
        category_slug = self.request.query_params.get('category_slug')
        if category_slug:
            try:
                # 找到这个 slug 对应的分类
                category = Category.objects.get(slug=category_slug)
                
                # --- 获取所有子孙分类 ---
                # 这是一个递归函数，用来获取所有子孙ID
                def get_all_descendants(cat):
                    categories = [cat]
                    for child in cat.children.all():
                        categories.extend(get_all_descendants(child))
                    return categories
                
                all_categories = get_all_descendants(category)
                all_category_ids = [cat.id for cat in all_categories]
                
                # 过滤出所有在这些分类 (包括子孙分类) 中的文章
                queryset = queryset.filter(category__id__in=all_category_ids)
            except Category.DoesNotExist:
                # 如果 slug 不存在，返回一个空列表
                return Post.objects.none()
        requested_type = self.request.query_params.get('type')
        if requested_type in ['blog', 'moment']:
            queryset = queryset.filter(post_type=requested_type)

        return queryset