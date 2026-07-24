import os
from django.core.wsgi import get_wsgi_application

# Production process default; manage.py explicitly selects development locally.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

application = get_wsgi_application()
