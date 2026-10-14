"""
Crop recommendation: store request params and result for history/analytics.
"""
from django.db import models
from django.conf import settings
from users.models import Farmer


class CropRecommendationRequest(models.Model):
    """Stores crop recommendation request and result (optional, for history)."""
    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name='crop_requests',
        null=True,
        blank=True,
    )
    # Land parameters
    soil_type = models.CharField(max_length=100)   # e.g. loam, clay, sandy
    ph_min = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    ph_max = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    water_availability = models.CharField(max_length=50)  # high, medium, low
    climate = models.CharField(max_length=100)    # tropical, subtropical, etc.
    previous_crop = models.CharField(max_length=255, blank=True)
    # Result (JSON or comma-separated crop names)
    recommended_crops = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'crop_recommendation_request'
        verbose_name = 'Crop Recommendation Request'
        verbose_name_plural = 'Crop Recommendation Requests'
