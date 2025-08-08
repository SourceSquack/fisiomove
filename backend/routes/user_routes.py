from fastapi import APIRouter
from supabase_config import supabase

router = APIRouter()

@router.post("/users")
def create_user_route(email: str, password: str):
    return supabase.auth.sign_up(email=email, password=password)

@router.get("/users/{email}")
def get_user_route(email: str):
    user = supabase.auth.get_user_by_email(email=email)
    return user if user else {"error": "User not found"}
