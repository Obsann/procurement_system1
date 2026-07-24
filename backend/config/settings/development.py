import os

# The base module deliberately refuses an unset secret.  This value is only
# suitable for a local, non-production development database.
os.environ.setdefault('DJANGO_SECRET_KEY', 'django-insecure-development-only')
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]']
CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

if os.environ.get('USE_SQLITE', 'True').lower() == 'true':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
