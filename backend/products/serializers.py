from rest_framework import serializers
from .models import FarmingProduct, FarmerProduct, Review
from users.serializers import FarmerSerializer
from users.validators import validate_required_text


class FarmingProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmingProduct
        fields = ('id', 'name', 'description', 'price', 'stock', 'image', 'created_at')

    def validate_name(self, value):
        return validate_required_text(value, 'Name', min_length=2, max_length=255)

    def validate_description(self, value):
        if not value:
            return ''
        return validate_required_text(value, 'Description', min_length=5, max_length=2000)

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than 0.')
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock cannot be negative.')
        return value


class FarmerProductSerializer(serializers.ModelSerializer):
    farmer = FarmerSerializer(read_only=True)

    class Meta:
        model = FarmerProduct
        fields = ('id', 'farmer', 'name', 'description', 'image', 'stock', 'price', 'created_at')
        read_only_fields = ('farmer',)

    def validate_name(self, value):
        return validate_required_text(value, 'Name', min_length=2, max_length=255)

    def validate_description(self, value):
        if not value:
            return ''
        return validate_required_text(value, 'Description', min_length=5, max_length=2000)

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than 0.')
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock cannot be negative.')
        return value


class FarmerProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerProduct
        fields = ('name', 'description', 'image', 'stock', 'price')

    def validate_name(self, value):
        return validate_required_text(value, 'Name', min_length=2, max_length=255)

    def validate_description(self, value):
        if not value:
            return ''
        return validate_required_text(value, 'Description', min_length=5, max_length=2000)

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than 0.')
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock cannot be negative.')
        return value


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('id', 'user', 'farmer_product', 'title', 'description', 'rating', 'date')
        read_only_fields = ('user', 'date')

    def validate_title(self, value):
        if not value:
            return ''
        return validate_required_text(value, 'Title', min_length=2, max_length=255)

    def validate_description(self, value):
        if not value:
            return ''
        return validate_required_text(value, 'Description', min_length=2, max_length=1000)
