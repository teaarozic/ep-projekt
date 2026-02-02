"""Serializers for Project and Task models."""

from rest_framework import serializers
from .models import Project, Task


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the Task model.

    Handles conversion between Task model instances and their JSON representations.
    Used for creating, retrieving, updating, and deleting task objects via the API.
    """

    class Meta:
        """Metadata for TaskSerializer defining model and serialized fields."""

        model = Task
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for the Project model.

    Includes a nested list of related tasks using the TaskSerializer (read-only).
    This allows clients to view associated tasks when retrieving project data,
    but prevents task creation directly through the Project serializer.
    """

    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        """Metadata for ProjectSerializer defining model and serialized fields."""

        model = Project
        fields = ["id", "name", "created_at", "tasks"]
