from django.urls import path
from . import views

urlpatterns = [
    path('', views.WorkerList.as_view(), name='worker-list'),
    path('requests/', views.WorkRequestList.as_view(), name='work-request-list'),
    path('requests/all/', views.WorkRequestAllList.as_view(), name='work-request-all-list'),
    path('requests/<int:pk>/', views.WorkRequestDetail.as_view(), name='work-request-detail'),
    path('requests/<int:pk>/approve/', views.WorkRequestApprove.as_view(), name='work-request-approve'),
    path('requests/<int:pk>/reject/', views.WorkRequestReject.as_view(), name='work-request-reject'),
]
