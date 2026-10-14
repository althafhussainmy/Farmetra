from django.contrib import admin
from .models import FarmingProduct, FarmerProduct, Review


@admin.register(FarmingProduct)
class FarmingProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'stock', 'created_at')
    search_fields = ('name',)


@admin.register(FarmerProduct)
class FarmerProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'farmer', 'price', 'stock', 'created_at')
    list_filter = ('farmer',)
    search_fields = ('name', 'farmer__user__username')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'farmer_product', 'rating', 'date')
    list_filter = ('rating',)
