from rest_framework import serializers
from .models import Complaint
from users.validators import validate_required_text


class ComplaintSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Complaint
        fields = ('id', 'sender', 'sender_username', 'complaint', 'reply', 'date', 'replied_at')
        read_only_fields = ('sender', 'reply', 'date', 'replied_at')

    def validate_complaint(self, value):
        return validate_required_text(value, 'Complaint', min_length=5, max_length=2000)
