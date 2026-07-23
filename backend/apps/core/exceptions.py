from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

# Add this custom exception class
class InvalidTransitionError(Exception):
    """Raised when a workflow state transition is not allowed."""
    pass
    
def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': response.data.get('detail', str(response.data)),
                'details': response.data if isinstance(response.data, dict) else None
            }
        }
        response.data = custom_data
        return response

    return response