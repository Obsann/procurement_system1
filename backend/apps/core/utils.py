import uuid
import string
import random

def generate_uuid():
    return uuid.uuid4()

def generate_random_string(length=10):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
