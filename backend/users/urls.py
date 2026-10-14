from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/farmer/', views.FarmerRegisterView.as_view(), name='register_farmer'),
    path('register/user/', views.AppUserRegisterView.as_view(), name='register_user'),
    path('register/worker/', views.WorkerRegisterView.as_view(), name='register_worker'),
    path('profile/farmer/', views.FarmerProfileView.as_view(), name='farmer_profile'),
    path('profile/user/', views.AppUserProfileView.as_view(), name='user_profile'),
    path('profile/worker/', views.WorkerProfileView.as_view(), name='worker_profile'),
    path('password-change/', views.PasswordChangeView.as_view(), name='password_change'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('seed-requests/', views.SeedRequestListCreate.as_view(), name='seed_request_list_create'),
    path('stock-items/', views.StockItemListForFarmer.as_view(), name='stock_item_list'),
    path('subsidy-schemes/', views.SubsidySchemeList.as_view(), name='subsidy_scheme_list'),
    path('subsidy-applications/', views.SubsidyApplicationListCreate.as_view(), name='subsidy_application_list_create'),
    path('crop-disease-reports/', views.CropDiseaseReportListCreate.as_view(), name='crop_disease_report_list_create'),
    path('notifications/', views.NotificationListForFarmer.as_view(), name='notification_list'),
]
