from django.contrib import admin
from .models import CropRecommendationRequest


@admin.register(CropRecommendationRequest)
class CropRecommendationRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'farmer', 'soil_type', 'climate', 'created_at')
