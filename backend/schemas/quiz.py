from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class QuizCategoryItem(BaseModel):
    id: str
    name: str
    description: str
    icon: str

class QuizCategoryListResponse(BaseModel):
    categories: list[QuizCategoryItem]
    difficulties: list[str]

class QuizQuestionPublic(BaseModel):
    id: int
    question: str
    options: list[str]
    category: str
    difficulty: str

class UserAnswerItem(BaseModel):
    question_id: int
    selected_answer: int  # 0, 1, 2, 3

class QuizSubmissionRequest(BaseModel):
    category: str
    difficulty: str
    answers: list[UserAnswerItem]

class QuestionResultDetail(BaseModel):
    question_id: int
    question: str
    options: list[str]
    selected_answer: int
    correct_answer: int
    is_correct: bool
    explanation: str

class QuizSubmissionResponse(BaseModel):
    score: int
    total_questions: int
    percentage: int
    results: list[QuestionResultDetail]
    recommendations: list[str]
    saved_to_history: bool

class QuizHistoryItem(BaseModel):
    id: int
    category: str
    difficulty: str
    score: int
    total_questions: int
    percentage: int
    created_at: datetime

    class Config:
        from_attributes = True

