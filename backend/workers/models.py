"""
Work request: farmer sends to worker, worker approves/rejects.
"""
from django.db import models
from users.models import Farmer, Worker


class WorkRequest(models.Model):
    """Work request from farmer to worker."""
    worker = models.ForeignKey(
        Worker,
        on_delete=models.CASCADE,
        related_name='work_requests',
    )
    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name='work_requests',
    )
    work_description = models.TextField()
    wage = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=30,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending',
    )

    class Meta:
        db_table = 'work_request'
        verbose_name = 'Work Request'
        verbose_name_plural = 'Work Requests'

    def __str__(self):
        return f"Work request #{self.id} - {self.farmer} to {self.worker} ({self.status})"
