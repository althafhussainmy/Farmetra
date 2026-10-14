from django.contrib import admin
from .models import WorkRequest


@admin.register(WorkRequest)
class WorkRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'farmer', 'worker', 'wage', 'date', 'status')
    list_filter = ('status',)
