# apps/accounts/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class CookieJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication that reads token from cookies"""
    
    def authenticate(self, request):
        # Get access token from cookie
        access_token = request.COOKIES.get(settings.ACCESS_TOKEN_COOKIE_NAME)
        
        logger.debug(f"🔐 Auth - Cookies: {list(request.COOKIES.keys())}")
        
        if not access_token:
            logger.debug("🔐 Auth - No access token found in cookies")
            return None
        
        logger.debug(f"🔐 Auth - Token found (first 20 chars): {access_token[:20]}...")
        
        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
            logger.debug(f"🔐 Auth - User authenticated: {user.email if user else 'None'}")
            return (user, validated_token)
        except (InvalidToken, AuthenticationFailed) as e:
            logger.warning(f"🔐 Auth - Validation error: {str(e)}")
            return None