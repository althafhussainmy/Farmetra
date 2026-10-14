from rest_framework import serializers
from .models import (
    FpOrderMaster, FpOrderDetails, FpPayment,
    OrderMaster, OrderDetails, Cart,
)
from products.serializers import FarmerProductSerializer, FarmingProductSerializer


class FpOrderDetailsSerializer(serializers.ModelSerializer):
    farming_product = FarmingProductSerializer(read_only=True)

    class Meta:
        model = FpOrderDetails
        fields = ('id', 'farming_product', 'quantity', 'amount')


class FpPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FpPayment
        fields = ('id', 'amount', 'date', 'status')


class FpOrderMasterSerializer(serializers.ModelSerializer):
    details = FpOrderDetailsSerializer(many=True, read_only=True)
    payment = FpPaymentSerializer(read_only=True)

    class Meta:
        model = FpOrderMaster
        fields = ('id', 'farmer', 'total', 'date', 'status', 'details', 'payment')


class OrderDetailsSerializer(serializers.ModelSerializer):
    farmer_product = FarmerProductSerializer(read_only=True)

    class Meta:
        model = OrderDetails
        fields = ('id', 'farmer_product', 'quantity', 'amount')


class OrderMasterSerializer(serializers.ModelSerializer):
    details = OrderDetailsSerializer(many=True, read_only=True)

    class Meta:
        model = OrderMaster
        fields = ('id', 'app_user', 'total', 'payment_method', 'farmer_accepted', 'date', 'status', 'details')


class CartSerializer(serializers.ModelSerializer):
    farmer_product = FarmerProductSerializer(read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'farmer_product', 'quantity', 'added_at')
