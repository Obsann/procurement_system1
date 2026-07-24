from .base import *

DEBUG = False

if not SECRET_KEY or SECRET_KEY.startswith('django-insecure-'):
    raise RuntimeError('Set a strong DJANGO_SECRET_KEY before running production settings.')
if not ALLOWED_HOSTS:
    raise RuntimeError('Set DJANGO_ALLOWED_HOSTS before running production settings.')

CORS_ALLOW_CREDENTIALS = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SESSION_COOKIE_SECURE = os.environ.get('DJANGO_SECURE_COOKIES', 'True').lower() == 'true'
CSRF_COOKIE_SECURE = SESSION_COOKIE_SECURE
