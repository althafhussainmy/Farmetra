from django.urls import path
from . import views

urlpatterns = [
    path('', views.MyComplaintList.as_view(), name='complaint-list'),
    path('<int:pk>/', views.MyComplaintDetail.as_view(), name='complaint-detail'),
]
