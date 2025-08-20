from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt
from datetime import datetime, timedelta, timezone
import os
from urllib.parse import urlencode

from database import get_db
from models.user import User
from oauth_setup import oauth  # your initialized OAuth client

router = APIRouter(prefix="/auth", tags=["authentication"])

# Env variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
FRONTEND_URL = os.getenv("FRONTEND_URL")
BACKEND_URL = os.getenv("BACKEND_URL")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/google-login")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# -------------------- Google OAuth --------------------

@router.get("/google-login")
async def google_login(request: Request):
    redirect_uri = f"{BACKEND_URL}/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def auth_callback(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        # Get token from Google
        token = await oauth.google.authorize_access_token(request)
        user_info = await oauth.google.userinfo(token=token)
        email = user_info.get("email")
        if not email:
            print("No email found in Google token:", user_info)
            raise HTTPException(status_code=400, detail="No email found in token")

        # Fetch user from DB
        try:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalars().first()
        except Exception as db_err:
            print("Database query error:", db_err)
            raise HTTPException(status_code=500, detail="Database error")

        if not user:
            print("User not found:", email)
            error_query = urlencode({
                "error": "unauthorized",
                "message": "You are not yet registered. Contact admin."
            })
            redirect_url = f"{FRONTEND_URL}/oauth-callback?{error_query}"
            return RedirectResponse(url=redirect_url)

        # Create JWT token
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        token_data = {
            "sub": user.email,
            "employee_id": user.employee_id,
            "exp": expire,
        }
        jwt_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

        # Build query string for frontend
        query = urlencode({
            "token": jwt_token,
            "email": user.email,
            "name": user.name,
            "employee_id": user.employee_id,
            "id": user.id,
            "google_access_token": token.get("access_token", "")
        })

        redirect_url = f"{FRONTEND_URL}/oauth-callback?{query}"
        print("Redirecting to frontend:", redirect_url)
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        print("Error in callback:", e)
        raise HTTPException(status_code=500, detail="OAuth callback failed")



# from fastapi import APIRouter, Depends, HTTPException, status, Request
# from fastapi.responses import RedirectResponse
# from sqlalchemy.orm import Session
# from database import get_db
# from models.user import User
# from jose import jwt
# import requests
# import os

# router = APIRouter()

# GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
# GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
# FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
# REDIRECT_URI = os.environ.get("REDIRECT_URI", "http://localhost:8000/auth/callback")
# JWT_SECRET = os.environ.get("JWT_SECRET", "supersecret")

# @router.get("/login")
# def login():
#     google_auth_url = (
#         "https://accounts.google.com/o/oauth2/v2/auth"
#         "?response_type=code"
#         f"&client_id={GOOGLE_CLIENT_ID}"
#         f"&redirect_uri={REDIRECT_URI}"
#         "&scope=openid%20email%20profile"
#         "&access_type=offline"
#     )
#     return RedirectResponse(google_auth_url)

# @router.get("/callback")
# def callback(code: str, db: Session = Depends(get_db)):
#     # Exchange code for tokens
#     token_url = "https://oauth2.googleapis.com/token"
#     data = {
#         "code": code,
#         "client_id": GOOGLE_CLIENT_ID,
#         "client_secret": GOOGLE_CLIENT_SECRET,
#         "redirect_uri": REDIRECT_URI,
#         "grant_type": "authorization_code",
#     }
#     r = requests.post(token_url, data=data)
#     if not r.ok:
#         raise HTTPException(status_code=400, detail="Failed to get token")
#     tokens = r.json()
#     id_token = tokens.get("id_token")

#     # Decode Google ID token
#     payload = jwt.decode(id_token, options={"verify_signature": False})

#     email = payload.get("email")
#     name = payload.get("name")
#     sub = payload.get("sub")  # Google user id

#     if not email:
#         raise HTTPException(status_code=400, detail="Google login failed")

#     # Check if user exists, otherwise create
#     user = db.query(User).filter(User.email == email).first()
#     if not user:
#         user = User(email=email, name=name, employee_id=sub)
#         db.add(user)
#         db.commit()
#         db.refresh(user)

#     # Generate a simple token for frontend (can be JWT)
#     frontend_token = jwt.encode({"email": email, "id": user.id}, JWT_SECRET)

#     # Redirect to frontend with token
#     redirect_url = f"{FRONTEND_URL}/oauth-callback?token={frontend_token}&email={email}&name={name}&id={user.id}"
#     return RedirectResponse(redirect_url)
