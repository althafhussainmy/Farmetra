from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'date', 'replied_at')
    search_fields = ('complaint', 'reply')
