from rest_framework import serializers
from .models import WorkRequest
from users.models import Worker
from users.serializers import FarmerSerializer, WorkerSerializer, UserSerializer
from users.validators import validate_required_text


class WorkRequestSerializer(serializers.ModelSerializer):
    farmer = FarmerSerializer(read_only=True)
    worker = WorkerSerializer(read_only=True)
    worker_id = serializers.PrimaryKeyRelatedField(
        queryset=Worker.objects.all(), write_only=True, required=True, source='worker'
    )

    class Meta:
        model = WorkRequest
        fields = ('id', 'farmer', 'worker', 'worker_id', 'work_description', 'wage', 'date', 'status')
        read_only_fields = ('farmer', 'worker', 'date', 'status')

    def validate_worker(self, value):
        if not value.approved:
            raise serializers.ValidationError('Only approved workers can receive work requests.')
        return value

    def validate_work_description(self, value):
        return validate_required_text(value, 'Work description', min_length=5, max_length=2000)

    def validate_wage(self, value):
        if value is None:
            return value
        if value <= 0:
            raise serializers.ValidationError('Wage must be greater than 0.')
        return value


class WorkerListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Worker
        fields = ('id', 'user', 'place', 'skills', 'address', 'phone', 'alternate_contact')
