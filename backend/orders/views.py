from decimal import Decimal
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db import transaction
from users.models import AppUser
from .models import OrderMaster, OrderDetails, FpOrderMaster, Cart
from .serializers import OrderMasterSerializer, FpOrderMasterSerializer, CartSerializer
from products.models import FarmerProduct


class UserOrderList(generics.ListAPIView):
    serializer_class = OrderMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        app_user = AppUser.objects.filter(user=self.request.user, approved=True).first()
        if not app_user:
            return OrderMaster.objects.none()
        return OrderMaster.objects.filter(app_user=app_user)


class UserOrderDetail(generics.RetrieveAPIView):
    serializer_class = OrderMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        app_user = AppUser.objects.filter(user=self.request.user, approved=True).first()
        if not app_user:
            return OrderMaster.objects.none()
        return OrderMaster.objects.filter(app_user=app_user)


class FpOrderList(generics.ListAPIView):
    serializer_class = FpOrderMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FpOrderMaster.objects.filter(farmer__user=self.request.user)


class FarmerProductOrderList(generics.ListAPIView):
    """Orders placed by users for the farmer's products."""
    serializer_class = OrderMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'farmer_profile'):
            return OrderMaster.objects.none()
        farmer = user.farmer_profile
        # Get orders that have at least one detail with this farmer's product
        from products.models import FarmerProduct
        farmer_product_ids = FarmerProduct.objects.filter(farmer=farmer).values_list('id', flat=True)
        order_ids = OrderDetails.objects.filter(farmer_product_id__in=farmer_product_ids).values_list('order_master_id', flat=True)
        return OrderMaster.objects.filter(id__in=order_ids).order_by('-date')


class FarmerAcceptOrder(APIView):
    """Farmer accepts a customer order."""
    permission_classes = [IsAuthenticated]

    @staticmethod
    def _ensure_order_has_farmer_product(order, farmer):
        farmer_product_ids = FarmerProduct.objects.filter(farmer=farmer).values_list('id', flat=True)
        return OrderDetails.objects.filter(
            order_master=order,
            farmer_product_id__in=farmer_product_ids
        ).exists()

    def patch(self, request, pk):
        user = request.user
        if not hasattr(user, 'farmer_profile'):
            return Response({'detail': 'Only farmers can accept orders.'}, status=status.HTTP_403_FORBIDDEN)
        
        farmer = user.farmer_profile
        try:
            order = OrderMaster.objects.get(pk=pk)
        except OrderMaster.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verify this order contains the farmer's products
        if not self._ensure_order_has_farmer_product(order, farmer):
            return Response({'detail': 'This order does not contain your products.'}, status=status.HTTP_403_FORBIDDEN)

        if order.farmer_accepted:
            return Response({'detail': 'Order already accepted.'}, status=status.HTTP_400_BAD_REQUEST)
        if order.status != 'pending':
            return Response({'detail': 'Only pending orders can be accepted.'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.farmer_accepted = True
        order.status = 'confirmed'
        order.save(update_fields=['farmer_accepted', 'status'])
        return Response(OrderMasterSerializer(order).data)


class FarmerShipOrder(APIView):
    """Farmer marks an order as shipped."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        if not hasattr(user, 'farmer_profile'):
            return Response({'detail': 'Only farmers can update shipping status.'}, status=status.HTTP_403_FORBIDDEN)

        farmer = user.farmer_profile
        try:
            order = OrderMaster.objects.get(pk=pk)
        except OrderMaster.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not FarmerAcceptOrder._ensure_order_has_farmer_product(order, farmer):
            return Response({'detail': 'This order does not contain your products.'}, status=status.HTTP_403_FORBIDDEN)

        if not order.farmer_accepted or order.status != 'confirmed':
            return Response({'detail': 'Order must be accepted before marking shipped.'}, status=status.HTTP_400_BAD_REQUEST)
        if order.status in ('shipped', 'delivered'):
            return Response({'detail': f'Order already {order.status}.'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'shipped'
        order.save(update_fields=['status'])
        return Response(OrderMasterSerializer(order).data)


class FarmerDeliverOrder(APIView):
    """Farmer marks an order as delivered."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        if not hasattr(user, 'farmer_profile'):
            return Response({'detail': 'Only farmers can update delivery status.'}, status=status.HTTP_403_FORBIDDEN)

        farmer = user.farmer_profile
        try:
            order = OrderMaster.objects.get(pk=pk)
        except OrderMaster.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not FarmerAcceptOrder._ensure_order_has_farmer_product(order, farmer):
            return Response({'detail': 'This order does not contain your products.'}, status=status.HTTP_403_FORBIDDEN)

        if not order.farmer_accepted:
            return Response({'detail': 'Order must be accepted before marking delivered.'}, status=status.HTTP_400_BAD_REQUEST)
        if order.status == 'delivered':
            return Response({'detail': 'Order already delivered.'}, status=status.HTTP_400_BAD_REQUEST)
        if order.status not in ('confirmed', 'shipped'):
            return Response({'detail': 'Order must be accepted or shipped before marking delivered.'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'delivered'
        order.save(update_fields=['status'])
        return Response(OrderMasterSerializer(order).data)


class FpOrderDetail(generics.RetrieveAPIView):
    serializer_class = FpOrderMasterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FpOrderMaster.objects.filter(farmer__user=self.request.user)


class CartList(generics.ListCreateAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        app_user = AppUser.objects.filter(user=self.request.user, approved=True).first()
        if not app_user:
            return Cart.objects.none()
        return Cart.objects.filter(app_user=app_user)

    def create(self, request, *args, **kwargs):
        try:
            app_user = AppUser.objects.get(user=request.user)
        except AppUser.DoesNotExist:
            return Response({'detail': 'Only app users can add to cart.'}, status=status.HTTP_403_FORBIDDEN)
        if not app_user.approved:
            return Response({'detail': 'Your account is awaiting approval.'}, status=status.HTTP_403_FORBIDDEN)
        farmer_product_id = request.data.get('farmer_product_id')
        quantity_raw = request.data.get('quantity', 1)
        if not farmer_product_id:
            return Response({'detail': 'farmer_product_id required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            quantity = int(quantity_raw)
        except (TypeError, ValueError):
            return Response({'detail': 'quantity must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)
        if quantity <= 0:
            return Response({'detail': 'quantity must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)
        from products.models import FarmerProduct
        try:
            fp = FarmerProduct.objects.get(pk=farmer_product_id)
        except FarmerProduct.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        has_other_farmer_items = Cart.objects.filter(app_user=app_user).exclude(
            farmer_product__farmer=fp.farmer
        ).exists()
        if has_other_farmer_items:
            return Response(
                {'detail': 'You can only add products from one farmer at a time. Clear your cart before adding another farmer\'s items.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity > fp.stock:
            return Response(
                {'detail': f'Only {fp.stock} kg available for {fp.name}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        cart_item, created = Cart.objects.get_or_create(
            app_user=app_user,
            farmer_product=fp,
            defaults={'quantity': quantity},
        )
        if not created:
            next_quantity = cart_item.quantity + quantity
            if next_quantity > fp.stock:
                return Response(
                    {'detail': f'Only {fp.stock} kg available for {fp.name}.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item.quantity = next_quantity
            cart_item.save()
        ser = CartSerializer(cart_item)
        return Response(ser.data, status=status.HTTP_201_CREATED)


class CartDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(app_user__user=self.request.user, app_user__approved=True)

    def update(self, request, *args, **kwargs):
        cart_item = self.get_object()
        quantity_raw = request.data.get('quantity')
        try:
            quantity = int(quantity_raw)
        except (TypeError, ValueError):
            return Response({'detail': 'quantity must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)
        if quantity <= 0:
            return Response({'detail': 'quantity must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)
        if quantity > cart_item.farmer_product.stock:
            return Response(
                {'detail': f'Only {cart_item.farmer_product.stock} kg available for {cart_item.farmer_product.name}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        cart_item.quantity = quantity
        cart_item.save(update_fields=['quantity'])
        return Response(self.get_serializer(cart_item).data)


class CheckoutView(APIView):
    """Convert cart to order, decrease stock, clear cart."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            app_user = AppUser.objects.get(user=request.user)
        except AppUser.DoesNotExist:
            return Response({'detail': 'Only app users can place orders.'}, status=status.HTTP_403_FORBIDDEN)
        if not app_user.approved:
            return Response({'detail': 'Your account is awaiting approval.'}, status=status.HTTP_403_FORBIDDEN)

        payment_method = request.data.get('payment_method', 'cod')
        if payment_method not in ('cod', 'online'):
            return Response({'detail': 'Invalid payment method. Use "cod" or "online".'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                cart_items = list(
                    Cart.objects.select_for_update()
                    .filter(app_user=app_user)
                    .select_related('farmer_product')
                )

                if not cart_items:
                    return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

                total = Decimal('0')
                order = OrderMaster.objects.create(app_user=app_user, total=0, payment_method=payment_method)

                for item in cart_items:
                    fp = FarmerProduct.objects.select_for_update().get(pk=item.farmer_product_id)
                    if fp.stock < item.quantity:
                        return Response(
                            {'detail': f'Insufficient stock for {fp.name}. Available: {fp.stock} kg, requested: {item.quantity} kg.'},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    amount = fp.price * item.quantity
                    total += amount
                    OrderDetails.objects.create(
                        order_master=order,
                        farmer_product=fp,
                        quantity=item.quantity,
                        amount=amount,
                    )
                    fp.stock -= item.quantity
                    fp.save(update_fields=['stock'])
                    item.delete()

                order.total = total
                order.save(update_fields=['total'])

            ser = OrderMasterSerializer(order)
            return Response(ser.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
