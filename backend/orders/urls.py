from django.urls import path
from . import views

urlpatterns = [
    path('user-orders/', views.UserOrderList.as_view(), name='user-order-list'),
    path('user-orders/<int:pk>/', views.UserOrderDetail.as_view(), name='user-order-detail'),
    path('fp-orders/', views.FpOrderList.as_view(), name='fp-order-list'),
    path('fp-orders/<int:pk>/', views.FpOrderDetail.as_view(), name='fp-order-detail'),
    path('farmer-product-orders/', views.FarmerProductOrderList.as_view(), name='farmer-product-orders'),
    path('farmer-product-orders/<int:pk>/accept/', views.FarmerAcceptOrder.as_view(), name='farmer-accept-order'),
    path('farmer-product-orders/<int:pk>/ship/', views.FarmerShipOrder.as_view(), name='farmer-ship-order'),
    path('farmer-product-orders/<int:pk>/deliver/', views.FarmerDeliverOrder.as_view(), name='farmer-deliver-order'),
    path('cart/', views.CartList.as_view(), name='cart-list'),
    path('cart/<int:pk>/', views.CartDetail.as_view(), name='cart-detail'),
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
]
