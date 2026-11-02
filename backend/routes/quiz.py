import json
import random
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db, QuizQuestion, QuizAttempt, User
from schemas.quiz import (
    QuizCategoryListResponse,
    QuizCategoryItem,
    QuizQuestionPublic,
    QuizSubmissionRequest,
    QuizSubmissionResponse,
    QuestionResultDetail,
    QuizHistoryItem,
)
from services.quiz_service import (
    CATEGORIES,
    DIFFICULTIES,
    seed_quiz_questions,
    get_recommendations_for_score,
)
from services.auth_service import get_current_user_optional, get_current_user

router = APIRouter()

@router.get("/categories", response_model=QuizCategoryListResponse)
def get_categories(db: Session = Depends(get_db)):
    """Returns available quiz categories and difficulty levels."""
    seed_quiz_questions(db)
    return QuizCategoryListResponse(
        categories=[QuizCategoryItem(**c) for c in CATEGORIES],
        difficulties=DIFFICULTIES,
    )

@router.get("/questions", response_model=list[QuizQuestionPublic])
def get_questions(
    category: str = Query("all", description="Category ID"),
    difficulty: str = Query("Beginner", description="Difficulty: Beginner, Intermediate, Advanced"),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    Fetches randomized quiz questions according to category and difficulty.
    Does NOT leak correct answers or explanations before submission.
    """
    seed_quiz_questions(db)
    query = db.query(QuizQuestion)

    if category and category.lower() != "all":
        query = query.filter(QuizQuestion.category == category.lower())

    if difficulty and difficulty.capitalize() in DIFFICULTIES:
        query = query.filter(QuizQuestion.difficulty == difficulty.capitalize())

    all_questions = query.all()
    if not all_questions:
        # Fallback to all if specific combo has few questions
        all_questions = db.query(QuizQuestion).all()

    sampled = random.sample(all_questions, min(len(all_questions), limit))

    return [
        QuizQuestionPublic(
            id=q.id,
            question=q.question,
            options=json.loads(q.options),
            category=q.category,
            difficulty=q.difficulty,
        )
        for q in sampled
    ]

@router.post("/submit", response_model=QuizSubmissionResponse)
def submit_quiz(
    request: QuizSubmissionRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Validates user submitted answers, evaluates score, generates explanations,
    and records the attempt for authenticated users.
    """
    if not request.answers:
        raise HTTPException(status_code=400, detail="No answers provided in quiz submission.")

    question_ids = [a.question_id for a in request.answers]
    questions_in_db = {q.id: q for q in db.query(QuizQuestion).filter(QuizQuestion.id.in_(question_ids)).all()}

    score = 0
    results = []
    incorrect_categories = []

    for item in request.answers:
        q = questions_in_db.get(item.question_id)
        if not q:
            continue

        is_correct = (item.selected_answer == q.correct_answer)
        if is_correct:
            score += 1
        else:
            incorrect_categories.append(q.category)

        results.append(
            QuestionResultDetail(
                question_id=q.id,
                question=q.question,
                options=json.loads(q.options),
                selected_answer=item.selected_answer,
                correct_answer=q.correct_answer,
                is_correct=is_correct,
                explanation=q.explanation,
            )
        )

    total = len(results)
    percentage = int((score / total) * 100) if total > 0 else 0

    recs = get_recommendations_for_score(request.category, percentage, incorrect_categories)

    saved = False
    if current_user and total > 0:
        attempt = QuizAttempt(
            user_id=current_user.id,
            category=request.category,
            difficulty=request.difficulty,
            score=score,
            total_questions=total,
            percentage=percentage,
        )
        db.add(attempt)
        db.commit()
        saved = True

    return QuizSubmissionResponse(
        score=score,
        total_questions=total,
        percentage=percentage,
        results=results,
        recommendations=recs,
        saved_to_history=saved,
    )

@router.get("/history", response_model=list[QuizHistoryItem])
def get_quiz_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns past quiz attempts for authenticated user."""
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(desc(QuizAttempt.created_at)).limit(30).all()

    return [QuizHistoryItem.model_validate(a) for a in attempts]

