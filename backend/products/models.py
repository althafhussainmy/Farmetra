"""
Product models: FarmingProduct (admin-managed catalog), FarmerProduct (farmer listings), Review.
"""
from django.db import models
from django.conf import settings
from users.models import Farmer


class FarmingProduct(models.Model):
    """Master product catalog managed by Krishi Bhavan (admin)."""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='farming_products/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'farming_product'
        verbose_name = 'Farming Product'
        verbose_name_plural = 'Farming Products'

    def __str__(self):
        return self.name


class FarmerProduct(models.Model):
    """Product listed by a farmer (linked to farmer)."""
    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name='farmer_products',
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='farmer_products/', blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'farmer_product'
        verbose_name = 'Farmer Product'
        verbose_name_plural = 'Farmer Products'

    def __str__(self):
        return f"{self.name} (by {self.farmer})"


class Review(models.Model):
    """User review/rating for a farmer product."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews',
    )
    farmer_product = models.ForeignKey(
        FarmerProduct,
        on_delete=models.CASCADE,
        related_name='reviews',
    )
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    rating = models.PositiveSmallIntegerField(
        default=5,
        choices=[(i, str(i)) for i in range(1, 6)],
    )
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'review'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        unique_together = [['user', 'farmer_product']]

    def __str__(self):
        return f"Review by {self.user.username} on {self.farmer_product.name}"
