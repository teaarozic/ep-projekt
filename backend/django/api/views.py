"""
ViewSets for Project and Task models providing CRUD operations,
and AI endpoints for text summarization and sentiment analysis.

Modules:
    - RegisterView: Handles user registration.
    - ProjectViewSet / TaskViewSet: Provide CRUD endpoints.
    - summarize_view: Text summarization (extractive + abstractive).
    - sentiment_view: VADER sentiment analysis.
"""

import logging
import re
from typing import List

import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User

from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer

logger = logging.getLogger(__name__)

_summarizer = None
analyzer = SentimentIntensityAnalyzer()

MAX_INPUT_CHARS = 1000
SENTIMENT_NEUTRAL_THRESHOLD = 0.25


def get_summarizer():
    """Lazy-load BART summarization model."""
    global _summarizer
    if _summarizer is None:
        from transformers import pipeline

        _summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    return _summarizer


class RegisterView(APIView):
    """
    API endpoint for user registration.
    Allows anyone to create a new account.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Username and password required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "User already exists"}, status=400)

        user = User.objects.create(
            username=username,
            email=email,
            password=make_password(password),
        )

        return Response(
            {"message": "User registered successfully", "id": user.id},
            status=status.HTTP_201_CREATED,
        )


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.prefetch_related("tasks").order_by("-created_at")
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by("-created_at")
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination


def _split_sentences(text: str) -> List[str]:
    """
    Splits a block of text into a list of sentences using punctuation (.!?).
    """
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p.strip() for p in parts if p.strip()]


def _smart_extractive_summary(text: str, max_sentences: int = 2) -> str:
    """
    Basic extractive summarization for medium-length text.
    """
    sentences = _split_sentences(text)
    if len(sentences) <= max_sentences:
        return text

    scored = []
    for idx, sentence in enumerate(sentences):
        score = 0
        if idx == 0:
            score += 3
        if idx == len(sentences) - 1:
            score += 1
        wc = len(sentence.split())
        if 10 <= wc <= 25:
            score += 2
        scored.append((score, sentence))

    scored.sort(reverse=True, key=lambda x: x[0])
    selected = [s[1] for s in scored[:max_sentences]]
    return " ".join(s for s in sentences if s in selected)


@api_view(["POST"])
@permission_classes([AllowAny])
def summarize_view(request):
    """
    AI Summarization endpoint (POST /api/ai/summarize/).
    Supports short→medium→long text logic.
    """
    service_key = request.headers.get("X-Service-Key")
    expected_key = getattr(settings, "DJANGO_SERVICE_KEY", None)

    if not expected_key or service_key != expected_key:
        logger.warning("Unauthorized summarize request: missing/invalid X-Service-Key")
        return Response({"error": "Unauthorized service request"}, status=401)

    text = (request.data.get("text") or "").strip()
    if not text:
        return Response({"error": "Text is required"}, status=400)

    if len(text) > MAX_INPUT_CHARS:
        return Response(
            {"error": f"Input must be <= {MAX_INPUT_CHARS} characters"},
            status=400,
        )

    try:
        word_count = len(text.split())

        if word_count < 30:
            summary = text
            strategy = "original-too-short"

        elif word_count < 70:
            summary = _smart_extractive_summary(text, max_sentences=2)
            strategy = "extractive-smart"

        else:
            summarizer = get_summarizer()
            input_len = word_count
            max_len = min(int(input_len * 0.6), 130)
            min_len = min(int(input_len * 0.3), 40)

            result = summarizer(
                text,
                max_length=max_len,
                min_length=min_len,
                do_sample=False,
                truncation=True,
                num_beams=4,
                length_penalty=1.0,
                early_stopping=True,
            )
            summary = result[0]["summary_text"].strip()
            strategy = "bart-abstractive"

    except RuntimeError as e:
        logger.error(f"Summarization model error: {e}")
        return Response({"error": "Model error"}, status=500)

    return Response(
        {
            "original": text,
            "summary": summary,
            "meta": {
                "strategy": strategy,
                "original_words": word_count,
                "summary_words": len(summary.split()),
            },
        },
        status=200,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def sentiment_view(request):
    """
    AI Sentiment Analysis endpoint (POST /api/ai/sentiment/).
    Uses VADER and a ±0.25 neutral threshold.
    Requires X-Service-Key.
    """
    service_key = request.headers.get("X-Service-Key")
    expected_key = getattr(settings, "DJANGO_SERVICE_KEY", None)

    if not expected_key or service_key != expected_key:
        logger.warning("Unauthorized sentiment request: missing/invalid X-Service-Key")
        return Response({"error": "Unauthorized service request"}, status=401)

    text = (request.data.get("text") or "").strip()
    if not text:
        return Response({"error": "Text is required"}, status=400)

    try:
        scores = analyzer.polarity_scores(text)
        polarity = round(scores["compound"], 3)

        if polarity >= SENTIMENT_NEUTRAL_THRESHOLD:
            tone = "Positive"
        elif polarity <= -SENTIMENT_NEUTRAL_THRESHOLD:
            tone = "Negative"
        else:
            tone = "Neutral"

        return Response({"polarity": polarity, "tone": tone}, status=200)

    except Exception as e:
        return Response({"error": f"Model error: {str(e)}"}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def csv_analysis_view(request):
    """
    CSV Analysis endpoint (POST /api/ai/csv)

    - Accepts multipart file upload
    - Validates if file is CSV
    - Parses CSV using pandas
    - Calculates:
        rows, columns, columnNames,
        numeric columns min/max/avg
    """

    service_key = request.headers.get("X-Service-Key")
    expected_key = getattr(settings, "DJANGO_SERVICE_KEY", None)

    if not expected_key or service_key != expected_key:
        return Response({"error": "Unauthorized service request"}, status=401)

    if "file" not in request.FILES:
        return Response({"error": "CSV file is required"}, status=400)

    file = request.FILES["file"]

    if not file.name.lower().endswith(".csv"):
        return Response({"error": "Only CSV files are supported"}, status=400)

    try:
        df = pd.read_csv(file)

        rows = len(df)
        columns = len(df.columns)
        column_names = list(df.columns)

        numeric_summary = {}

        numeric_df = df.select_dtypes(include="number")
        for col in numeric_df.columns:
            min_value = numeric_df[col].min()
            max_value = numeric_df[col].max()
            avg_value = numeric_df[col].mean()

            numeric_summary[col] = {
                "min": None if pd.isna(min_value) else float(min_value),
                "max": None if pd.isna(max_value) else float(max_value),
                "avg": None if pd.isna(avg_value) else float(round(avg_value, 4)),
            }

        return Response(
            {
                "success": True,
                "rows": rows,
                "columns": columns,
                "columnNames": column_names,
                "numericSummary": numeric_summary,
                "fileName": file.name,
            },
            status=200,
        )

    except Exception as e:
        return Response({"error": f"Failed to parse CSV: {str(e)}"}, status=400)
