"""
Wrapper para autenticación usando GoTrue (Supabase Auth) vía HTTP,
evita colisión de nombres con el paquete 'supabase' de PyPI.
"""

from __future__ import annotations
from typing import Optional, Dict, Any
import requests

from app.core.config import settings

BASE_URL = str(settings.SUPABASE_URL).strip().rstrip("/")
API_KEY = str(settings.SUPABASE_API_KEY).strip()
SERVICE_ROLE_KEY = (settings.SUPABASE_SERVICE_ROLE_KEY or "").strip()

# Para endpoints públicos (signup/login) basta con enviar 'apikey'
PUBLIC_HEADERS = {
    "apikey": API_KEY,
    "Content-Type": "application/json",
}

ADMIN_HEADERS = None
if SERVICE_ROLE_KEY:
    ADMIN_HEADERS = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }


def sign_up_user(
    email: str,
    password: str,
    *,
    full_name: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    role: Optional[str] = None,
    redirect_to: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Crea un usuario en Supabase Auth.
    Devuelve el JSON de GoTrue (user, session, etc) o lanza una excepción en error.
    """
    print(f"📝 sign_up_user called for: {email}")
    print(
        f"📋 Parameters: full_name='{full_name}', first_name='{first_name}', last_name='{last_name}', role='{role}', redirect_to='{redirect_to}'"
    )

    url = f"{BASE_URL}/auth/v1/signup"
    payload: Dict[str, Any] = {"email": email, "password": password}

    # Datos adicionales en el perfil
    user_metadata: Dict[str, Any] = {}
    if full_name:
        user_metadata["full_name"] = full_name
    if first_name:
        user_metadata["first_name"] = first_name
    if last_name:
        user_metadata["last_name"] = last_name
    if role:
        user_metadata["role"] = role
    if user_metadata:
        payload["data"] = user_metadata

    if redirect_to:
        payload["redirect_to"] = redirect_to

    print(f"🌐 Making request to: {url}")
    print(f"📦 Payload: {payload}")
    print(f"🔑 Headers: {PUBLIC_HEADERS}")

    resp = requests.post(url, json=payload, headers=PUBLIC_HEADERS, timeout=15)

    print(f"📊 Response status: {resp.status_code}")
    print(f"📝 Response headers: {dict(resp.headers)}")

    if resp.status_code >= 400:
        try:
            detail = resp.json()
            print(f"❌ Error response body: {detail}")
        except Exception:
            detail = {"message": resp.text}
            print(f"❌ Error response text: {resp.text}")
        raise ValueError({"status": resp.status_code, "detail": detail})

    result = resp.json()
    print(f"✅ Signup successful")
    print(f"📝 Response keys: {list(result.keys())}")
    if "user" in result and result["user"] and "user_metadata" in result["user"]:
        print(f"👤 User metadata: {result['user'].get('user_metadata', {})}")

    return result


def sign_in_user(email: str, password: str) -> Dict[str, Any]:
    """
    Inicia sesión (password grant) en Supabase Auth.
    Devuelve access_token, refresh_token, token_type, user, etc.
    """
    url = f"{BASE_URL}/auth/v1/token?grant_type=password"
    payload = {"email": email, "password": password}

    print(f"🌐 Making request to: {url}")
    print(f"📦 Payload: {{'email': '{email}', 'password': '[HIDDEN]'}}")
    print(f"🔑 Headers: {PUBLIC_HEADERS}")

    resp = requests.post(url, json=payload, headers=PUBLIC_HEADERS, timeout=15)

    print(f"📊 Response status: {resp.status_code}")
    print(f"📝 Response headers: {dict(resp.headers)}")

    if resp.status_code >= 400:
        try:
            detail = resp.json()
            print(f"❌ Error response body: {detail}")
        except Exception:
            detail = {"message": resp.text}
            print(f"❌ Error response text: {resp.text}")
        raise ValueError({"status": resp.status_code, "detail": detail})

    result = resp.json()
    print(f"✅ Login success response keys: {list(result.keys())}")
    return result


def refresh_session(refresh_token: str) -> Dict[str, Any]:
    """Intercambia refresh_token por nuevos tokens."""
    url = f"{BASE_URL}/auth/v1/token?grant_type=refresh_token"
    payload = {"refresh_token": refresh_token}
    resp = requests.post(url, json=payload, headers=PUBLIC_HEADERS, timeout=15)
    if resp.status_code >= 400:
        try:
            detail = resp.json()
        except Exception:
            detail = {"message": resp.text}
        raise ValueError({"status": resp.status_code, "detail": detail})
    return resp.json()


def logout(access_token: str) -> None:
    """Revoca la sesión del access_token actual."""
    url = f"{BASE_URL}/auth/v1/logout"
    headers = {"apikey": API_KEY, "Authorization": f"Bearer {access_token}"}
    resp = requests.post(url, headers=headers, timeout=15)
    if resp.status_code >= 400:
        try:
            detail = resp.json()
        except Exception:
            detail = {"message": resp.text}
        raise ValueError({"status": resp.status_code, "detail": detail})


def get_user_from_token(access_token: str) -> Dict[str, Any]:
    """
    Obtiene el usuario asociado a un access_token de Supabase.
    """
    url = f"{BASE_URL}/auth/v1/user"
    headers = {
        "apikey": API_KEY,
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }
    resp = requests.get(url, headers=headers, timeout=15)
    if resp.status_code >= 400:
        try:
            detail = resp.json()
        except Exception:
            detail = {"message": resp.text}
        raise ValueError({"status": resp.status_code, "detail": detail})
    return resp.json()


def validate_api_key() -> bool:
    """Valida que SUPABASE_URL/API_KEY respondan correctamente."""
    try:
        url = f"{BASE_URL}/auth/v1/settings"
        resp = requests.get(url, headers=PUBLIC_HEADERS, timeout=10)
        return resp.status_code == 200
    except Exception:
        return False


# ==== Updates de usuario ====


def update_user_self(
    access_token: str,
    *,
    new_email: Optional[str] = None,
    new_password: Optional[str] = None,
    full_name: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
) -> Dict[str, Any]:
    """Actualiza el usuario autenticado (email/password/metadata)."""
    url = f"{BASE_URL}/auth/v1/user"
    headers = {
        "apikey": API_KEY,
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }
    payload: Dict[str, Any] = {}
    if new_email:
        payload["email"] = new_email
    if new_password:
        payload["password"] = new_password
    metadata: Dict[str, Any] = {}
    if full_name is not None:
        metadata["full_name"] = full_name
    if first_name is not None:
        metadata["first_name"] = first_name
    if last_name is not None:
        metadata["last_name"] = last_name
    if metadata:
        payload["data"] = metadata
    if not payload:
        return get_user_from_token(access_token)

    resp = requests.patch(url, json=payload, headers=headers, timeout=15)
    if resp.status_code >= 400:
        try:
            detail = resp.json()
        except Exception:
            detail = {"message": resp.text}
        raise ValueError({"status": resp.status_code, "detail": detail})
    return resp.json()


def admin_confirm_user(user_id: str) -> bool:
    """Confirma por admin un usuario (requiere service_role)."""
    if not ADMIN_HEADERS:
        return False
    url = f"{BASE_URL}/auth/v1/admin/users/{user_id}"
    payload = {"email_confirm": True}
    resp = requests.patch(url, json=payload, headers=ADMIN_HEADERS, timeout=15)
    return resp.status_code < 400


def admin_get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Obtiene usuario por email usando admin (requiere service_role)."""
    print(f"🔍 admin_get_user_by_email called for: {email}")

    if not ADMIN_HEADERS:
        print("❌ No ADMIN_HEADERS available")
        return None

    url = f"{BASE_URL}/auth/v1/admin/users"
    params = {"email": email}

    print(f"🌐 Making request to: {url}")
    print(f"📦 Params: {params}")
    print(f"🔑 Headers: {ADMIN_HEADERS}")

    resp = requests.get(url, headers=ADMIN_HEADERS, params=params, timeout=15)

    print(f"📊 Response status: {resp.status_code}")
    print(f"📝 Response headers: {dict(resp.headers)}")

    if resp.status_code >= 400:
        try:
            error_detail = resp.json()
            print(f"❌ Error response body: {error_detail}")
        except:
            print(f"❌ Error response text: {resp.text}")
        return None

    data = resp.json()
    print(f"📋 Raw response data: {data}")

    # API devuelve {users:[...]} o un user directo según versión; manejamos ambos
    if isinstance(data, dict) and "users" in data:
        users_list = data.get("users", [])
        print(f"👥 Found {len(users_list)} users in response")

        # Buscar el usuario específico por email
        for user in users_list:
            user_email = user.get("email", "").lower()
            print(f"🔍 Checking user: {user_email} vs {email.lower()}")
            if user_email == email.lower():
                print(f"✅ Found matching user: {user_email}")
                return user

        print(f"❌ No user found with email: {email}")
        return None

    # Si es un user directo, verificar que el email coincida
    if isinstance(data, dict) and data.get("email"):
        user_email = data.get("email", "").lower()
        print(f"🔍 Direct user response: {user_email} vs {email.lower()}")
        if user_email == email.lower():
            print(f"✅ Found matching direct user: {user_email}")
            return data
        else:
            print(
                f"❌ Direct user email doesn't match: {user_email} != {email.lower()}"
            )
            return None

    print(f"❌ Unexpected response format: {data}")
    return None


def admin_confirm_user_by_email(email: str) -> bool:
    user = admin_get_user_by_email(email)
    if not user:
        return False
    uid = user.get("id") or user.get("user", {}).get("id")
    if not uid:
        return False
    return admin_confirm_user(uid)


def admin_delete_user(user_id: str) -> bool:
    if not ADMIN_HEADERS:
        return False
    url = f"{BASE_URL}/auth/v1/admin/users/{user_id}"
    resp = requests.delete(url, headers=ADMIN_HEADERS, timeout=15)
    return resp.status_code < 400


def admin_delete_user_by_email(email: str) -> bool:
    user = admin_get_user_by_email(email)
    if not user:
        return False
    uid = user.get("id") or (user.get("user") or {}).get("id")
    if not uid:
        return False
    return admin_delete_user(uid)


def admin_create_user(
    email: str,
    password: str,
    *,
    full_name: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    role: Optional[str] = None,
    email_confirm: bool = True,
) -> Optional[Dict[str, Any]]:
    print(f"🏗️ admin_create_user called for: {email}")
    print(
        f"📋 Parameters: full_name='{full_name}', first_name='{first_name}', last_name='{last_name}', role='{role}', email_confirm={email_confirm}"
    )

    if not ADMIN_HEADERS:
        print("❌ No ADMIN_HEADERS available")
        return None

    print(f"🔑 Using ADMIN_HEADERS: {ADMIN_HEADERS}")

    url = f"{BASE_URL}/auth/v1/admin/users"
    payload: Dict[str, Any] = {
        "email": email,
        "password": password,
        "email_confirm": email_confirm,
    }
    data: Dict[str, Any] = {}
    if full_name:
        data["full_name"] = full_name
    if first_name:
        data["first_name"] = first_name
    if last_name:
        data["last_name"] = last_name
    if role:
        data["role"] = role
    if data:
        payload["user_metadata"] = data

    print(f"🌐 Making request to: {url}")
    print(f"📦 Payload: {payload}")

    resp = requests.post(url, json=payload, headers=ADMIN_HEADERS, timeout=15)

    print(f"📊 Response status: {resp.status_code}")
    print(f"📝 Response headers: {dict(resp.headers)}")

    if resp.status_code >= 400:
        try:
            error_detail = resp.json()
            print(f"❌ Error response body: {error_detail}")
        except:
            print(f"❌ Error response text: {resp.text}")
        return None

    result = resp.json()
    print(f"✅ User created successfully")
    print(f"📝 Response keys: {list(result.keys())}")
    if "user_metadata" in result:
        print(f"👤 User metadata: {result.get('user_metadata', {})}")

    return result


def admin_update_user(
    user_id: str,
    *,
    email: Optional[str] = None,
    email_confirm: Optional[bool] = None,
    password: Optional[str] = None,
    full_name: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    role: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Actualiza atributos del usuario por Admin API."""
    if not ADMIN_HEADERS:
        return None
    url = f"{BASE_URL}/auth/v1/admin/users/{user_id}"
    payload: Dict[str, Any] = {}
    if email is not None:
        payload["email"] = email
    if email_confirm is not None:
        payload["email_confirm"] = email_confirm
    if password is not None:
        payload["password"] = password
    meta: Dict[str, Any] = {}
    if full_name is not None:
        meta["full_name"] = full_name
    if first_name is not None:
        meta["first_name"] = first_name
    if last_name is not None:
        meta["last_name"] = last_name
    if role is not None:
        meta["role"] = role
    if meta:
        payload["user_metadata"] = meta
    if not payload:
        return None
    resp = requests.patch(url, json=payload, headers=ADMIN_HEADERS, timeout=15)
    if resp.status_code >= 400:
        return None
    return resp.json()


def admin_update_user_by_email(email: str, **kwargs) -> Optional[Dict[str, Any]]:
    user = admin_get_user_by_email(email)
    if not user:
        return None
    uid = user.get("id") or (user.get("user") or {}).get("id")
    if not uid:
        return None
    return admin_update_user(uid, **kwargs)
