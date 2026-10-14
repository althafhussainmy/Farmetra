from rest_framework import generics, status, serializers as drf_serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.conf import settings
from django.shortcuts import get_object_or_404
from decimal import Decimal, InvalidOperation

from .models import (
    Farmer, AppUser, Worker, SeedRequest, StockItem,
    SubsidyScheme, SubsidyApplication, CropDiseaseReport, Notification,
)
from .serializers import (
    FarmerRegisterSerializer,
    AppUserRegisterSerializer,
    WorkerRegisterSerializer,
    FarmerSerializer,
    AppUserSerializer,
    WorkerSerializer,
    SeedRequestSerializer,
    StockItemSerializer,
    SubsidySchemeSerializer,
    SubsidyApplicationSerializer,
    CropDiseaseReportSerializer,
    NotificationSerializer,
)
from .validators import validate_password_strength


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


def require_farmer_profile(user, message='Only farmers can access this resource.'):
    if not hasattr(user, 'farmer_profile'):
        raise PermissionDenied(message)
    return user.farmer_profile


class FarmerRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = FarmerRegisterSerializer(data=request.data)
        if ser.is_valid():
            try:
                user = ser.save()
            except IntegrityError:
                return Response(
                    {'detail': 'Username already exists. Please choose a different username.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except Exception as e:
                msg = str(e) if settings.DEBUG else 'Registration failed. Verify username/email uniqueness and password policy.'
                return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)
            tokens = get_tokens_for_user(user)
            return Response({'user_id': user.id, **tokens}, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class AppUserRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = AppUserRegisterSerializer(data=request.data)
        if ser.is_valid():
            try:
                user = ser.save()
            except IntegrityError:
                return Response(
                    {'detail': 'Username already exists. Please choose a different username.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except Exception as e:
                msg = str(e) if settings.DEBUG else 'Registration failed. Verify username/email uniqueness and password policy.'
                return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)
            tokens = get_tokens_for_user(user)
            return Response({'user_id': user.id, **tokens}, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkerRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = WorkerRegisterSerializer(data=request.data)
        if ser.is_valid():
            try:
                user = ser.save()
            except IntegrityError:
                return Response(
                    {'detail': 'Username already exists. Please choose a different username.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except Exception as e:
                msg = str(e) if settings.DEBUG else 'Registration failed. Verify username/email uniqueness and password policy.'
                return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)
            tokens = get_tokens_for_user(user)
            return Response({'user_id': user.id, **tokens}, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    """Return current user info including is_staff (for admin detection)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({
            'id': u.id,
            'username': u.username,
            'email': u.email or '',
            'first_name': u.first_name or '',
            'last_name': u.last_name or '',
            'is_superuser': u.is_superuser,
            'is_staff': u.is_staff,
        })


class FarmerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = FarmerSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Farmer, user=self.request.user)


class AppUserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = AppUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(AppUser, user=self.request.user)


class WorkerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = WorkerSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Worker, user=self.request.user)


class StockItemListForFarmer(generics.ListAPIView):
    """List stock items (seeds/fertilizers) for farmers to request."""
    serializer_class = StockItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        require_farmer_profile(self.request.user, 'Only farmers can view stock items.')
        return StockItem.objects.filter(quantity__gt=0).order_by('item_type', 'name')


class SeedRequestListCreate(generics.ListCreateAPIView):
    """Farmer: list own seed/fertilizer requests, create new request."""
    serializer_class = SeedRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        farmer = require_farmer_profile(self.request.user, 'Only farmers can view seed/fertilizer requests.')
        return SeedRequest.objects.filter(farmer=farmer).select_related('stock_item')

    def create(self, request, *args, **kwargs):
        farmer = require_farmer_profile(request.user, 'Only farmers can request seeds/fertilizers.')
        stock_item_id = request.data.get('stock_item_id')
        quantity_raw = request.data.get('quantity')
        description = request.data.get('description', '').strip()
        if stock_item_id and quantity_raw is not None:
            try:
                quantity = Decimal(str(quantity_raw))
            except (InvalidOperation, TypeError):
                return Response({'detail': 'quantity must be a number.'}, status=status.HTTP_400_BAD_REQUEST)
            if quantity <= 0:
                return Response({'detail': 'quantity must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                stock_item = StockItem.objects.get(pk=stock_item_id)
            except StockItem.DoesNotExist:
                return Response({'detail': 'Stock item not found.'}, status=status.HTTP_404_NOT_FOUND)
            if stock_item.quantity < quantity:
                return Response(
                    {'detail': f'Insufficient stock. Available: {stock_item.quantity} {stock_item.unit}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            req = SeedRequest.objects.create(
                farmer=farmer,
                stock_item=stock_item,
                quantity=quantity,
                description=description or f'{stock_item.name} - {quantity} {stock_item.unit}',
                status='pending',
            )
        else:
            if not description:
                return Response({'detail': 'Provide stock_item_id and quantity, or description.'}, status=status.HTTP_400_BAD_REQUEST)
            req = SeedRequest.objects.create(farmer=farmer, description=description, status='pending')
        return Response(SeedRequestSerializer(req).data, status=status.HTTP_201_CREATED)


class SubsidySchemeList(generics.ListAPIView):
    """List subsidy schemes for farmers to apply."""
    serializer_class = SubsidySchemeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        require_farmer_profile(self.request.user, 'Only farmers can view subsidy schemes.')
        return SubsidyScheme.objects.all().order_by('-created_at')


class SubsidyApplicationListCreate(generics.ListCreateAPIView):
    """Farmer: list own applications, apply for a scheme."""
    serializer_class = SubsidyApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        farmer = require_farmer_profile(self.request.user, 'Only farmers can view subsidy applications.')
        return SubsidyApplication.objects.filter(farmer=farmer).select_related('scheme')

    def perform_create(self, serializer):
        serializer.save(farmer=require_farmer_profile(self.request.user, 'Only farmers can apply for subsidies.'))


class CropDiseaseReportListCreate(generics.ListCreateAPIView):
    """Farmer: list own reports, create new report (image + description)."""
    serializer_class = CropDiseaseReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        farmer = require_farmer_profile(self.request.user, 'Only farmers can view crop disease reports.')
        return CropDiseaseReport.objects.filter(farmer=farmer)

    def perform_create(self, serializer):
        serializer.save(farmer=require_farmer_profile(self.request.user, 'Only farmers can submit crop disease reports.'))


class NotificationListForFarmer(generics.ListAPIView):
    """Farmers view latest notifications/announcements."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        require_farmer_profile(self.request.user, 'Only farmers can view notifications.')
        return Notification.objects.all().order_by('-created_at')


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = (request.data.get('old_password') or '').strip()
        new_password = request.data.get('new_password') or ''
        if not old_password or not new_password:
            return Response(
                {'detail': 'old_password and new_password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if old_password == new_password:
            return Response(
                {'detail': 'New password must be different from current password.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not request.user.check_password(old_password):
            return Response(
                {'detail': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            validate_password_strength(new_password, user=request.user)
        except drf_serializers.ValidationError as exc:
            detail = exc.detail
            if isinstance(detail, list):
                detail = ' '.join(str(msg) for msg in detail)
            return Response({'detail': str(detail)}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()
        return Response({'detail': 'Password changed successfully.'})
