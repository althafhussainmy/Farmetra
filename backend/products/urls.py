from django.urls import path
from . import views

urlpatterns = [
    path('farming/', views.FarmingProductList.as_view(), name='farming-product-list'),
    path('farming/<int:pk>/', views.FarmingProductDetail.as_view(), name='farming-product-detail'),
    path('farmer-products/', views.FarmerProductList.as_view(), name='farmer-product-list'),
    path('farmer-products/create/', views.FarmerProductCreate.as_view(), name='farmer-product-create'),
    path('farmer-products/<int:pk>/', views.FarmerProductDetail.as_view(), name='farmer-product-detail'),
]
