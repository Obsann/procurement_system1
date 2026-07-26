import os

# The base module deliberately refuses an unset secret.  This value is only
# suitable for a local, non-production development database.
os.environ.setdefault('DJANGO_SECRET_KEY', 'django-insecure-development-only')
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]']
CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
# Vite silently moves to 5174+ when its default port is taken, which otherwise
# produces opaque CORS failures that look like the API is down.
CORS_ALLOWED_ORIGIN_REGEXES = [r'^http://(localhost|127\.0\.0\.1):\d+$']

if os.environ.get('USE_SQLITE', 'True').lower() == 'true':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
