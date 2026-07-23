import random
import string
from django.utils import timezone

def generate_code(prefix):
    timestamp = timezone.now().strftime('%Y%m%d')
    rand = ''.join(random.choices(string.digits, k=4))
    return f"{prefix}-{timestamp}-{rand}"

def generate_pr_number():
    return generate_code('PR')

def generate_po_number():
    return generate_code('PO')

def generate_rfq_number():
    return generate_code('RFQ')

def generate_grn_number():
    return generate_code('GRN')

def generate_supplier_code():
    return generate_code('SUP')
