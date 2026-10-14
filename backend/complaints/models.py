"""
Complaint model: sent by farmers/users, replied by Krishi Bhavan.
"""
from django.db import models
from django.conf import settings


class Complaint(models.Model):
    """Complaint from a user (farmer or app user), reply from admin."""
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='complaints',
    )
    complaint = models.TextField()
    reply = models.TextField(blank=True)
    date = models.DateTimeField(auto_now_add=True)
    replied_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'complaint'
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'

    def __str__(self):
        return f"Complaint #{self.id} from {self.sender.username}"
