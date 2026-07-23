import os

base_dir = r"d:\Projects\procurement_system\backend\apps"

apps = {
    "procurement": {
        "__init__.py": "",
        "apps.py": "from django.apps import AppConfig\n\nclass ProcurementConfig(AppConfig):\n    default_auto_field = 'django.db.models.BigAutoField'\n    name = 'apps.procurement'\n",
        "models.py": "from django.db import models\nfrom django.conf import settings\n\nclass PurchaseRequisition(models.Model):\n    pr_number = models.CharField(max_length=50, unique=True)\n    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)\n    title = models.CharField(max_length=255)\n    description = models.TextField()\n    status = models.CharField(max_length=50, default='DRAFT')\n    created_at = models.DateTimeField(auto_now_add=True)\n    \n    def __str__(self):\n        return self.pr_number\n\nclass PurchaseRequisitionLine(models.Model):\n    purchase_requisition = models.ForeignKey(PurchaseRequisition, related_name='lines', on_delete=models.CASCADE)\n    item_name = models.CharField(max_length=255)\n    quantity = models.DecimalField(max_digits=10, decimal_places=2)\n    unit_of_measure = models.CharField(max_length=20)\n    \n    def __str__(self):\n        return f\"{self.item_name} - {self.purchase_requisition.pr_number}\"\n\nclass PurchaseRequisitionAttachment(models.Model):\n    purchase_requisition = models.ForeignKey(PurchaseRequisition, related_name='attachments', on_delete=models.CASCADE)\n    file = models.FileField(upload_to='pr_attachments/')\n    uploaded_at = models.DateTimeField(auto_now_add=True)\n",
        "serializers.py": "from rest_framework import serializers\nfrom .models import PurchaseRequisition, PurchaseRequisitionLine, PurchaseRequisitionAttachment\n\nclass PurchaseRequisitionLineSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = PurchaseRequisitionLine\n        fields = '__all__'\n\nclass PurchaseRequisitionSerializer(serializers.ModelSerializer):\n    lines = PurchaseRequisitionLineSerializer(many=True)\n    \n    class Meta:\n        model = PurchaseRequisition\n        fields = '__all__'\n        \n    def create(self, validated_data):\n        lines_data = validated_data.pop('lines', [])\n        pr = PurchaseRequisition.objects.create(**validated_data)\n        for line_data in lines_data:\n            PurchaseRequisitionLine.objects.create(purchase_requisition=pr, **line_data)\n        return pr\n",
        "views.py": "from rest_framework import viewsets\nfrom .models import PurchaseRequisition\nfrom .serializers import PurchaseRequisitionSerializer\n\nclass PurchaseRequisitionViewSet(viewsets.ModelViewSet):\n    queryset = PurchaseRequisition.objects.all()\n    serializer_class = PurchaseRequisitionSerializer\n",
        "urls.py": "from django.urls import path, include\nfrom rest_framework.routers import DefaultRouter\nfrom .views import PurchaseRequisitionViewSet\n\nrouter = DefaultRouter()\nrouter.register(r'requisitions', PurchaseRequisitionViewSet)\n\nurlpatterns = [\n    path('', include(router.urls)),\n]\n",
        "admin.py": "from django.contrib import admin\nfrom .models import PurchaseRequisition, PurchaseRequisitionLine\n\nadmin.site.register(PurchaseRequisition)\nadmin.site.register(PurchaseRequisitionLine)\n"
    },
    "suppliers": {
        "__init__.py": "",
        "apps.py": "from django.apps import AppConfig\n\nclass SuppliersConfig(AppConfig):\n    default_auto_field = 'django.db.models.BigAutoField'\n    name = 'apps.suppliers'\n",
        "models.py": "from django.db import models\n\nclass Supplier(models.Model):\n    supplier_code = models.CharField(max_length=50, unique=True)\n    legal_name = models.CharField(max_length=255)\n    email = models.EmailField()\n    status = models.CharField(max_length=50, default='ACTIVE')\n    \n    def __str__(self):\n        return self.legal_name\n\nclass SupplierContact(models.Model):\n    supplier = models.ForeignKey(Supplier, related_name='contacts', on_delete=models.CASCADE)\n    name = models.CharField(max_length=255)\n    email = models.EmailField()\n    is_primary = models.BooleanField(default=False)\n",
        "serializers.py": "from rest_framework import serializers\nfrom .models import Supplier, SupplierContact\n\nclass SupplierSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Supplier\n        fields = '__all__'\n",
        "views.py": "from rest_framework import viewsets\nfrom .models import Supplier\nfrom .serializers import SupplierSerializer\n\nclass SupplierViewSet(viewsets.ModelViewSet):\n    queryset = Supplier.objects.all()\n    serializer_class = SupplierSerializer\n",
        "urls.py": "from django.urls import path, include\nfrom rest_framework.routers import DefaultRouter\nfrom .views import SupplierViewSet\n\nrouter = DefaultRouter()\nrouter.register(r'suppliers', SupplierViewSet)\n\nurlpatterns = [\n    path('', include(router.urls)),\n]\n",
        "admin.py": "from django.contrib import admin\nfrom .models import Supplier\n\nadmin.site.register(Supplier)\n"
    },
    "rfq": {
        "__init__.py": "",
        "apps.py": "from django.apps import AppConfig\n\nclass RfqConfig(AppConfig):\n    default_auto_field = 'django.db.models.BigAutoField'\n    name = 'apps.rfq'\n",
        "models.py": "from django.db import models\nfrom django.conf import settings\n\nclass RFQ(models.Model):\n    rfq_number = models.CharField(max_length=50, unique=True)\n    title = models.CharField(max_length=255)\n    status = models.CharField(max_length=50, default='DRAFT')\n    \n    def __str__(self):\n        return self.rfq_number\n\nclass RFQLine(models.Model):\n    rfq = models.ForeignKey(RFQ, related_name='lines', on_delete=models.CASCADE)\n    item_name = models.CharField(max_length=255)\n    quantity = models.IntegerField()\n\nclass RFQSupplier(models.Model):\n    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE)\n    supplier_id = models.PositiveIntegerField()\n",
        "serializers.py": "from rest_framework import serializers\nfrom .models import RFQ\n\nclass RFQSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = RFQ\n        fields = '__all__'\n",
        "views.py": "from rest_framework import viewsets\nfrom .models import RFQ\nfrom .serializers import RFQSerializer\n\nclass RFQViewSet(viewsets.ModelViewSet):\n    queryset = RFQ.objects.all()\n    serializer_class = RFQSerializer\n",
        "urls.py": "from django.urls import path, include\nfrom rest_framework.routers import DefaultRouter\nfrom .views import RFQViewSet\n\nrouter = DefaultRouter()\nrouter.register(r'rfqs', RFQViewSet)\n\nurlpatterns = [\n    path('', include(router.urls)),\n]\n",
        "admin.py": "from django.contrib import admin\nfrom .models import RFQ\n\nadmin.site.register(RFQ)\n"
    },
    "bids": {
        "__init__.py": "",
        "apps.py": "from django.apps import AppConfig\n\nclass BidsConfig(AppConfig):\n    default_auto_field = 'django.db.models.BigAutoField'\n    name = 'apps.bids'\n",
        "models.py": "from django.db import models\n\nclass Bid(models.Model):\n    rfq_id = models.PositiveIntegerField()\n    supplier_id = models.PositiveIntegerField()\n    grand_total = models.DecimalField(max_digits=15, decimal_places=2)\n    is_winner = models.BooleanField(default=False)\n    \n    def __str__(self):\n        return f\"Bid {self.id} for RFQ {self.rfq_id}\"\n\nclass BidLine(models.Model):\n    bid = models.ForeignKey(Bid, related_name='lines', on_delete=models.CASCADE)\n    unit_price = models.DecimalField(max_digits=10, decimal_places=2)\n",
        "serializers.py": "from rest_framework import serializers\nfrom .models import Bid\n\nclass BidSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Bid\n        fields = '__all__'\n",
        "views.py": "from rest_framework import viewsets\nfrom .models import Bid\nfrom .serializers import BidSerializer\n\nclass BidViewSet(viewsets.ModelViewSet):\n    queryset = Bid.objects.all()\n    serializer_class = BidSerializer\n",
        "urls.py": "from django.urls import path, include\nfrom rest_framework.routers import DefaultRouter\nfrom .views import BidViewSet\n\nrouter = DefaultRouter()\nrouter.register(r'bids', BidViewSet)\n\nurlpatterns = [\n    path('', include(router.urls)),\n]\n",
        "admin.py": "from django.contrib import admin\nfrom .models import Bid\n\nadmin.site.register(Bid)\n"
    }
}

for app_name, files in apps.items():
    app_dir = os.path.join(base_dir, app_name)
    os.makedirs(app_dir, exist_ok=True)
    for filename, content in files.items():
        with open(os.path.join(app_dir, filename), 'w') as f:
            f.write(content)

print("Done generating remaining apps.")
