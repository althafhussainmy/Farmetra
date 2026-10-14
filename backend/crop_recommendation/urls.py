from django.urls import path
from . import views

urlpatterns = [
    path('', views.CropRecommendationView.as_view(), name='crop_recommend'),
]
