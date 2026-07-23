from rest_framework import serializers
from .models import Supplier, SupplierContact

class SupplierContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierContact
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    contacts = SupplierContactSerializer(many=True, read_only=True)

    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ['id', 'supplier_code', 'created_at']
