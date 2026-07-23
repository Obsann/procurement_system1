from rest_framework.exceptions import APIException
from rest_framework import status

class InvalidTransitionError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid workflow transition for entity current state and user role.'
    default_code = 'invalid_transition'
