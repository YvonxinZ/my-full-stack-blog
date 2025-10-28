from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CategoryViewSet, TagViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'categories', CategoryViewSet) # <-- 新增
router.register(r'tags', TagViewSet)

urlpatterns = [
    path('', include(router.urls)),
]