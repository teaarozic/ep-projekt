"""Database models for managing projects and their related tasks."""

from django.db import models


class Project(models.Model):
    """
    Represents a project entity that groups multiple tasks.

    Attributes:
        name (str): The name of the project (max length 100).
        created_at (datetime): The timestamp when the project was created.
    """

    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        """
        Returns a human-readable string representation of the project.

        Returns:
            str: The project's name.
        """
        return str(self.name)


class Task(models.Model):
    """
    Represents an individual task that belongs to a specific project.

    Attributes:
        project (Project): The project this task belongs to (foreign key).
        title (str): The title of the task (max length 100).
        description (str): Optional text description of the task.
        done (bool): Status flag indicating whether the task is completed.
        created_at (datetime): The timestamp when the task was created.
    """

    project = models.ForeignKey(Project, related_name="tasks", on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        """
        Returns a human-readable string representation of the task.

        Returns:
            str: The task's title.
        """
        return str(self.title)
