import logging
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


class InvalidTransitionError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid workflow transition for entity current state and user role.'
    default_code = 'invalid_transition'


def custom_exception_handler(exc, context):
    """Return one safe, consistent JSON error shape for every API failure."""
    response = exception_handler(exc, context)
    if response is None:
        logger.exception('Unhandled API exception', exc_info=exc)
        return Response(
            {'success': False, 'error': {'code': 500, 'message': 'Internal server error', 'details': None}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    data = response.data
    message = data.get('detail', str(data)) if isinstance(data, dict) else str(data)
    response.data = {
        'success': False,
        'error': {'code': response.status_code, 'message': message, 'details': data},
    }
    return response
