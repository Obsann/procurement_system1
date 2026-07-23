from .base import *

DEBUG = False

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost').split(',')

CORS_ALLOWED_ORIGINS = os.environ.get('DJANGO_CORS_ALLOWED_ORIGINS', 'http://localhost').split(',')
