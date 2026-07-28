from .base import *  # noqa

DEBUG = False

if not SECRET_KEY or SECRET_KEY.startswith('django-insecure-'):
    raise RuntimeError('Set a strong DJANGO_SECRET_KEY before running production settings.')

# Render injects RENDER_EXTERNAL_HOSTNAME automatically — add it so Django
# doesn't reject incoming requests with a 400 Bad Request.
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Also honour any manually configured hosts (e.g. a custom domain).
# DJANGO_ALLOWED_HOSTS is already parsed in base.py; we just ensure at least
# one host is set so the validation below passes.
if not ALLOWED_HOSTS:
    raise RuntimeError('No ALLOWED_HOSTS configured. Set RENDER_EXTERNAL_HOSTNAME or DJANGO_ALLOWED_HOSTS.')


# --- Security ---
CORS_ALLOW_CREDENTIALS = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SESSION_COOKIE_SECURE = os.environ.get('DJANGO_SECURE_COOKIES', 'True').lower() == 'true'
CSRF_COOKIE_SECURE = SESSION_COOKIE_SECURE
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# --- Static files: WhiteNoise serves them without a separate CDN ---
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# --- Media uploads ---
# Render's disk is ephemeral. If file uploads are needed in production,
# configure django-storages with an S3-compatible bucket (e.g. Cloudflare R2
# or AWS S3) by setting USE_S3=True and providing the S3 env vars.
USE_S3 = os.environ.get('USE_S3', 'False') == 'True'
if USE_S3:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_ENDPOINT_URL = os.environ.get('AWS_S3_ENDPOINT_URL')   # for R2 / MinIO
    AWS_S3_CUSTOM_DOMAIN = os.environ.get('AWS_S3_CUSTOM_DOMAIN')
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/' if AWS_S3_CUSTOM_DOMAIN else f'{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/'
