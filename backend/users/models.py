"""
User-related models: Farmer, AppUser, Worker.
All link to Django's auth.User via OneToOne.
"""
from django.db import models
from django.conf import settings


class Farmer(models.Model):
    """Farmer profile. Approved farmers can sell products and send work requests."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='farmer_profile',
        null=True,
        blank=True,
    )
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    place = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, help_text='Contact number')
    alternate_contact = models.CharField(max_length=255, blank=True, help_text='Alternate phone or contact')
    state = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('approved', 'Approved')],
        default='pending',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'farmer'
        verbose_name = 'Farmer'
        verbose_name_plural = 'Farmers'

    def __str__(self):
        return f"Farmer: {self.user.username if self.user else self.pk} ({self.state})"


class AppUser(models.Model):
    """General user (customer) who browses and buys farmer products."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='app_user_profile',
        null=True,
        blank=True,
    )
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    place = models.CharField(max_length=255)
    address = models.TextField()
    approved = models.BooleanField(default=False, help_text='Admin approval required')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_user'
        verbose_name = 'App User'
        verbose_name_plural = 'App Users'

    def __str__(self):
        return f"User: {self.user.username if self.user else self.pk}"


class Worker(models.Model):
    """Worker who receives work requests from farmers."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='worker_profile',
        null=True,
        blank=True,
    )
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    place = models.CharField(max_length=255)
    skills = models.CharField(max_length=500, help_text='Comma-separated skills')
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, help_text='Contact number')
    alternate_contact = models.CharField(max_length=255, blank=True, help_text='Alternate phone or contact')
    approved = models.BooleanField(default=False, help_text='Admin approval required')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'worker'
        verbose_name = 'Worker'
        verbose_name_plural = 'Workers'

    def __str__(self):
        return f"Worker: {self.user.username if self.user else self.pk}"


class StockItem(models.Model):
    """Admin-managed seed/fertilizer stock. Quantity decreases when requests are approved."""
    TYPE_CHOICES = [('seed', 'Seed'), ('fertilizer', 'Fertilizer')]
    name = models.CharField(max_length=255)
    item_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='seed')
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit = models.CharField(max_length=20, default='kg')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'stock_item'
        verbose_name = 'Stock Item'
        verbose_name_plural = 'Stock Items'
        ordering = ['item_type', 'name']

    def __str__(self):
        return f"{self.name} ({self.item_type})"


class SeedRequest(models.Model):
    """Farmer requests seeds/fertilizers from admin. Optional stock_item + quantity; else free-text description."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name='seed_requests',
    )
    stock_item = models.ForeignKey(
        StockItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requests',
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True, help_text='Free-text when not requesting from stock')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'seed_request'
        verbose_name = 'Seed Request'
        verbose_name_plural = 'Seed Requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"Seed request #{self.id} by {self.farmer}"


class SubsidyScheme(models.Model):
    """Admin-created subsidy scheme. Farmers can apply."""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'subsidy_scheme'
        verbose_name = 'Subsidy Scheme'
        verbose_name_plural = 'Subsidy Schemes'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class SubsidyApplication(models.Model):
    """Farmer applies for a subsidy scheme. Status: Pending, Approved, Rejected."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name='subsidy_applications',
    )
    scheme = models.ForeignKey(
        SubsidyScheme,
        on_delete=models.CASCADE,
        related_name='applications',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'subsidy_application'
        verbose_name = 'Subsidy Application'
        verbose_name_plural = 'Subsidy Applications'
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.farmer} - {self.scheme.name} ({self.status})"


class CropDiseaseReport(models.Model):
    """Farmer reports crop disease with image and description. Admin can respond."""
    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name='crop_disease_reports',
    )
    image = models.ImageField(upload_to='crop_disease/', blank=True, null=True)
    description = models.TextField()
    admin_reply = models.TextField(blank=True)
    replied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'crop_disease_report'
        verbose_name = 'Crop Disease Report'
        verbose_name_plural = 'Crop Disease Reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"Report #{self.id} by {self.farmer}"


class Notification(models.Model):
    """Admin posts announcements. Farmers view latest notifications."""
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posted_notifications',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notification'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
