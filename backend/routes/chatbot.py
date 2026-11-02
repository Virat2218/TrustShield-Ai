from fastapi import APIRouter, HTTPException
from schemas.analysis import ChatRequest, ChatResponse
from services.chatbot_service import generate_chat_response

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Conversational digital safety assistant endpoint.
    Answers security queries, clarifies fraud tactics, and explains analysis reports.
    """
    try:
        reply = await generate_chat_response(
            message=request.message,
            context=request.context,
            history=request.history,
        )
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat assistant error: {str(e)}")

