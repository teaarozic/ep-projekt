"""Admin configuration for Project and Task models."""

from django.contrib import admin
from .models import Project, Task


class TaskInline(admin.TabularInline):
    """
    Inline display for tasks inside the project admin view.
    Allows adding and editing related tasks directly under each project.
    """

    model = Task
    extra = 1
    fields = ("title", "description", "done", "created_at")
    readonly_fields = ("created_at",)
    show_change_link = True


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """
    Admin configuration for Project model.
    Shows tasks inline and allows searching/filtering projects.
    """

    list_display = ("name", "created_at")
    search_fields = ("name",)
    list_filter = ("created_at",)
    inlines = [TaskInline]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """
    Admin configuration for Task model.
    """

    list_display = ("title", "project", "done", "created_at")
    list_filter = ("done", "created_at", "project")
    search_fields = ("title", "description")
    readonly_fields = ("created_at",)
