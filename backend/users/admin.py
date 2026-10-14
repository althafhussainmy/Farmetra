from django.contrib import admin
from .models import (
    Farmer, AppUser, Worker, SeedRequest, StockItem,
    SubsidyScheme, SubsidyApplication, CropDiseaseReport, Notification,
)


@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'place', 'state', 'created_at')
    list_filter = ('state',)
    search_fields = ('user__username', 'place')
    actions = ['approve_farmers', 'reject_farmers']

    @admin.action(description='Approve selected farmers')
    def approve_farmers(self, request, queryset):
        updated = queryset.update(state='approved')
        self.message_user(request, f'{updated} farmer(s) approved.')

    @admin.action(description='Reject selected farmers')
    def reject_farmers(self, request, queryset):
        updated = queryset.update(state='pending')  # or add 'rejected' if you add it to model
        self.message_user(request, f'{updated} farmer(s) set to pending.')


@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'place', 'approved', 'created_at')
    list_filter = ('approved',)
    search_fields = ('user__username', 'place')
    list_editable = ('approved',)
    actions = ['approve_users', 'unapprove_users']

    @admin.action(description='Approve selected users')
    def approve_users(self, request, queryset):
        updated = queryset.update(approved=True)
        self.message_user(request, f'{updated} user(s) approved.')

    @admin.action(description='Unapprove selected users')
    def unapprove_users(self, request, queryset):
        updated = queryset.update(approved=False)
        self.message_user(request, f'{updated} user(s) unapproved.')


@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'place', 'skills', 'approved', 'created_at')
    list_filter = ('approved',)
    search_fields = ('user__username', 'place', 'skills')
    list_editable = ('approved',)
    actions = ['approve_workers', 'unapprove_workers']

    @admin.action(description='Approve selected workers')
    def approve_workers(self, request, queryset):
        updated = queryset.update(approved=True)
        self.message_user(request, f'{updated} worker(s) approved.')

    @admin.action(description='Unapprove selected workers')
    def unapprove_workers(self, request, queryset):
        updated = queryset.update(approved=False)
        self.message_user(request, f'{updated} worker(s) unapproved.')


@admin.register(StockItem)
class StockItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'item_type', 'quantity', 'unit', 'updated_at')
    list_filter = ('item_type',)


@admin.register(SeedRequest)
class SeedRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'farmer', 'stock_item', 'quantity', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('farmer__user__username', 'description')


@admin.register(SubsidyScheme)
class SubsidySchemeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name', 'description')


@admin.register(SubsidyApplication)
class SubsidyApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'farmer', 'scheme', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('farmer__user__username', 'scheme__name')


@admin.register(CropDiseaseReport)
class CropDiseaseReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'farmer', 'created_at')
    search_fields = ('farmer__user__username', 'description')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_by', 'created_at')
    search_fields = ('title', 'content')
