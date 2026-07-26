"""Settings used by `manage.py test`.

Kept separate from development so the suite is fast and deterministic without
weakening the settings a developer actually runs the server with.
"""
import os

os.environ.setdefault('USE_SQLITE', 'True')
from .development import *  # noqa: F401,F403

# The suite creates hundreds of users; the production hasher dominates runtime.
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']

# Throttles are process-wide and would otherwise leak between tests, turning
# a long run into spurious 429s.
REST_FRAMEWORK = {
    **REST_FRAMEWORK,  # noqa: F405
    'DEFAULT_THROTTLE_CLASSES': (),
    'DEFAULT_THROTTLE_RATES': {},
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}
