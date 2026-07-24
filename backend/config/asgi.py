
import os
from django.core.asgi import get_asgi_application

# Production process default; manage.py explicitly selects development locally.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')


application = get_asgi_application()
