from django.contrib import admin
from .models import (
    FpOrderMaster, FpOrderDetails, FpPayment,
    OrderMaster, OrderDetails, Cart,
)


class FpOrderDetailsInline(admin.TabularInline):
    model = FpOrderDetails
    extra = 0


@admin.register(FpOrderMaster)
class FpOrderMasterAdmin(admin.ModelAdmin):
    list_display = ('id', 'farmer', 'total', 'date', 'status')
    list_filter = ('status',)
    inlines = [FpOrderDetailsInline]


@admin.register(FpPayment)
class FpPaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_master', 'amount', 'date', 'status')
    list_filter = ('status',)


class OrderDetailsInline(admin.TabularInline):
    model = OrderDetails
    extra = 0


@admin.register(OrderMaster)
class OrderMasterAdmin(admin.ModelAdmin):
    list_display = ('id', 'app_user', 'total', 'date', 'status')
    list_filter = ('status',)
    inlines = [OrderDetailsInline]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'app_user', 'farmer_product', 'quantity', 'added_at')
