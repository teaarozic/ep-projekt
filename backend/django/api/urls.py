"""
API routing configuration for the Django REST API.

Includes:
    - CRUD routes for Project and Task viewsets
    - Authentication endpoints (register, login, refresh)
    - AI endpoints (/api/ai/summarize, sentiment)
"""

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    TaskViewSet,
    RegisterView,
    summarize_view,
    sentiment_view,
    csv_analysis_view,
)

router = DefaultRouter()
router.register(r"projects", ProjectViewSet)
router.register(r"tasks", TaskViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("ai/summarize/", summarize_view, name="ai_summarize"),
    path("ai/sentiment/", sentiment_view, name="ai_sentiment"),
    path("ai/csv/", csv_analysis_view, name="ai_csv"),
]
