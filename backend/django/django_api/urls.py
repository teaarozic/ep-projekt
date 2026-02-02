"""Root URL configuration for the Django REST API project."""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", include("health.urls")),
    path("api/", include("api.urls")),
]
