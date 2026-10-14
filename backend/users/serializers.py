from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Farmer, AppUser, Worker, SeedRequest, StockItem,
    SubsidyScheme, SubsidyApplication, CropDiseaseReport, Notification,
)
from .validators import (
    validate_address,
    validate_alternate_contact,
    validate_name,
    validate_password_strength,
    validate_phone,
    validate_place,
    validate_required_text,
    validate_skills,
    validate_unique_email,
    validate_username,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


def _create_auth_user(validated_data):
    return User.objects.create_user(
        username=validated_data['username'],
        email=validated_data['email'],
        password=validated_data['password'],
        first_name=validated_data.get('first_name', ''),
        last_name=validated_data.get('last_name', ''),
    )


class OfficerCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=100)

    def validate_username(self, value):
        return validate_username(value)

    def validate_email(self, value):
        return validate_unique_email(value)

    def validate_password(self, value):
        return validate_password_strength(value)

    def validate_first_name(self, value):
        return validate_name(value, 'First name')

    def validate_last_name(self, value):
        return validate_name(value, 'Last name')

    def create(self, validated_data):
        user = _create_auth_user(validated_data)
        user.is_staff = True  # Officer accounts are staff users
        user.save(update_fields=['is_staff'])
        return user


class BaseRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    age = serializers.IntegerField(required=False, allow_null=True, min_value=1, max_value=120)
    place = serializers.CharField()
    address = serializers.CharField()

    def validate_username(self, value):
        return validate_username(value)

    def validate_email(self, value):
        return validate_unique_email(value)

    def validate_password(self, value):
        return validate_password_strength(value)

    def validate_first_name(self, value):
        return validate_name(value, 'First name')

    def validate_last_name(self, value):
        return validate_name(value, 'Last name')

    def validate_place(self, value):
        return validate_place(value)

    def validate_address(self, value):
        return validate_address(value)


class FarmerRegisterSerializer(BaseRegisterSerializer):

    def create(self, validated_data):
        user = _create_auth_user(validated_data)
        Farmer.objects.create(
            user=user,
            age=validated_data.get('age'),
            place=validated_data['place'],
            address=validated_data['address'],
            state='pending',
        )
        return user


class AppUserRegisterSerializer(BaseRegisterSerializer):

    def create(self, validated_data):
        user = _create_auth_user(validated_data)
        AppUser.objects.create(
            user=user,
            age=validated_data.get('age'),
            place=validated_data['place'],
            address=validated_data['address'],
        )
        return user


class WorkerRegisterSerializer(BaseRegisterSerializer):
    skills = serializers.CharField()

    def validate_skills(self, value):
        return validate_skills(value)

    def create(self, validated_data):
        user = _create_auth_user(validated_data)
        Worker.objects.create(
            user=user,
            age=validated_data.get('age'),
            place=validated_data['place'],
            address=validated_data['address'],
            skills=validated_data['skills'],
        )
        return user


class FarmerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Farmer
        fields = ('id', 'user', 'age', 'place', 'address', 'phone', 'alternate_contact', 'state', 'created_at')
        read_only_fields = ('user', 'state', 'created_at')

    def validate_place(self, value):
        return validate_place(value)

    def validate_address(self, value):
        return validate_address(value)

    def validate_phone(self, value):
        return validate_phone(value, field_name='Phone')

    def validate_alternate_contact(self, value):
        return validate_alternate_contact(value)


class AppUserSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = AppUser
        fields = ('id', 'user', 'age', 'place', 'address', 'approved', 'created_at')
        read_only_fields = ('user', 'approved', 'created_at')

    def validate_place(self, value):
        return validate_place(value)

    def validate_address(self, value):
        return validate_address(value)


class WorkerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Worker
        fields = ('id', 'user', 'age', 'place', 'skills', 'address', 'phone', 'alternate_contact', 'approved', 'created_at')
        read_only_fields = ('user', 'approved', 'created_at')

    def validate_place(self, value):
        return validate_place(value)

    def validate_skills(self, value):
        return validate_skills(value)

    def validate_address(self, value):
        return validate_address(value)

    def validate_phone(self, value):
        return validate_phone(value, field_name='Phone')

    def validate_alternate_contact(self, value):
        return validate_alternate_contact(value)


class StockItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockItem
        fields = ('id', 'name', 'item_type', 'quantity', 'unit', 'created_at', 'updated_at')

    def validate_name(self, value):
        return validate_required_text(value, 'Name', min_length=2, max_length=255)

    def validate_unit(self, value):
        return validate_required_text(value, 'Unit', min_length=1, max_length=20)

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError('Quantity cannot be negative.')
        return value


class SeedRequestSerializer(serializers.ModelSerializer):
    farmer = FarmerSerializer(read_only=True)
    stock_item = StockItemSerializer(read_only=True)

    class Meta:
        model = SeedRequest
        fields = ('id', 'farmer', 'stock_item', 'quantity', 'description', 'status', 'admin_notes', 'created_at', 'updated_at')
        read_only_fields = ('farmer', 'status', 'admin_notes', 'created_at', 'updated_at')

    def validate_description(self, value):
        if not value:
            return value
        return validate_required_text(value, 'Description', min_length=5, max_length=1000)


class SubsidySchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubsidyScheme
        fields = ('id', 'name', 'description', 'created_at')

    def validate_name(self, value):
        return validate_required_text(value, 'Name', min_length=2, max_length=255)

    def validate_description(self, value):
        if not value:
            return ''
        return validate_required_text(value, 'Description', min_length=5, max_length=2000)


class SubsidyApplicationSerializer(serializers.ModelSerializer):
    scheme = SubsidySchemeSerializer(read_only=True)
    scheme_id = serializers.PrimaryKeyRelatedField(
        queryset=SubsidyScheme.objects.all(),
        write_only=True,
        source='scheme',
        required=True,
    )
    farmer = FarmerSerializer(read_only=True)

    class Meta:
        model = SubsidyApplication
        fields = ('id', 'farmer', 'scheme', 'scheme_id', 'status', 'admin_notes', 'applied_at')
        read_only_fields = ('farmer', 'status', 'admin_notes', 'applied_at')


class CropDiseaseReportSerializer(serializers.ModelSerializer):
    farmer = FarmerSerializer(read_only=True)

    class Meta:
        model = CropDiseaseReport
        fields = ('id', 'farmer', 'image', 'description', 'admin_reply', 'replied_at', 'created_at')
        read_only_fields = ('farmer', 'admin_reply', 'replied_at', 'created_at')

    def validate_description(self, value):
        return validate_required_text(value, 'Description', min_length=10, max_length=2000)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'title', 'content', 'created_by', 'created_at')
        read_only_fields = ('created_by', 'created_at')

    def validate_title(self, value):
        return validate_required_text(value, 'Title', min_length=2, max_length=255)

    def validate_content(self, value):
        return validate_required_text(value, 'Content', min_length=5, max_length=5000)
