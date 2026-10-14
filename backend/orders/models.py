"""
Order and payment models.
- FpOrderMaster/Details: Farmer-side orders (farmer buying from catalog).
- OrderMaster/Details: User orders (user buying farmer products).
- FpPayment: Payment for farmer-side orders.
"""
from django.db import models
from users.models import Farmer, AppUser
from products.models import FarmingProduct, FarmerProduct


class FpOrderMaster(models.Model):
    """Order by a farmer (from farming product catalog)."""
    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name='fp_orders',
    )
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=30,
        choices=[
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('shipped', 'Shipped'),
            ('delivered', 'Delivered'),
            ('cancelled', 'Cancelled'),
        ],
        default='pending',
    )

    class Meta:
        db_table = 'fp_order_master'
        verbose_name = 'FP Order Master'
        verbose_name_plural = 'FP Order Masters'

    def __str__(self):
        return f"FP Order #{self.id} - {self.farmer}"


class FpOrderDetails(models.Model):
    """Line item in a farmer order."""
    order_master = models.ForeignKey(
        FpOrderMaster,
        on_delete=models.CASCADE,
        related_name='details',
    )
    farming_product = models.ForeignKey(
        FarmingProduct,
        on_delete=models.PROTECT,
        related_name='fp_order_details',
    )
    quantity = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'fp_order_details'
        verbose_name = 'FP Order Detail'
        verbose_name_plural = 'FP Order Details'


class FpPayment(models.Model):
    """Payment for a farmer order (linked to FpOrderMaster)."""
    order_master = models.OneToOneField(
        FpOrderMaster,
        on_delete=models.CASCADE,
        related_name='payment',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=30,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded'),
        ],
        default='pending',
    )

    class Meta:
        db_table = 'fp_payment'
        verbose_name = 'FP Payment'
        verbose_name_plural = 'FP Payments'


class OrderMaster(models.Model):
    """Order by an app user (buying farmer products)."""
    PAYMENT_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('online', 'Online Payment'),
    ]
    app_user = models.ForeignKey(
        AppUser,
        on_delete=models.CASCADE,
        related_name='orders',
    )
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES,
        default='cod',
    )
    farmer_accepted = models.BooleanField(default=False, help_text='Farmer accepted the order')
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=30,
        choices=[
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('shipped', 'Shipped'),
            ('delivered', 'Delivered'),
            ('cancelled', 'Cancelled'),
        ],
        default='pending',
    )

    class Meta:
        db_table = 'order_master'
        verbose_name = 'Order Master'
        verbose_name_plural = 'Order Masters'

    def __str__(self):
        return f"Order #{self.id} - {self.app_user}"


class OrderDetails(models.Model):
    """Line item in a user order (farmer product)."""
    order_master = models.ForeignKey(
        OrderMaster,
        on_delete=models.CASCADE,
        related_name='details',
    )
    farmer_product = models.ForeignKey(
        FarmerProduct,
        on_delete=models.PROTECT,
        related_name='order_details',
    )
    quantity = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'order_details'
        verbose_name = 'Order Detail'
        verbose_name_plural = 'Order Details'


class Cart(models.Model):
    """User cart: items (farmer products) before checkout."""
    app_user = models.ForeignKey(
        AppUser,
        on_delete=models.CASCADE,
        related_name='cart_items',
    )
    farmer_product = models.ForeignKey(
        FarmerProduct,
        on_delete=models.CASCADE,
        related_name='cart_entries',
    )
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cart'
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart'
        unique_together = [['app_user', 'farmer_product']]
