from supabase_config import supabase

def create_user(email, password):
    return supabase.table("users").insert({"email": email, "password": password}).execute()

def get_user_by_email(email):
    return supabase.table("users").select("*").eq("email", email).execute()

def update_user_password(email, new_password):
    return supabase.table("users").update({"password": new_password}).eq("email", email).execute()

def delete_user(email):
    return supabase.table("users").delete().eq("email", email).execute()
