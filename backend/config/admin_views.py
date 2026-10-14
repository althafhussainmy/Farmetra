"""
Staff-only API for admin panel (React). All views require is_staff.
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from django.contrib.auth.models import User

from users.models import (
    Farmer, AppUser, Worker, SeedRequest, StockItem,
    SubsidyScheme, SubsidyApplication, CropDiseaseReport, Notification,
)
from users.serializers import (
    FarmerSerializer, AppUserSerializer, WorkerSerializer, SeedRequestSerializer,
    StockItemSerializer, SubsidySchemeSerializer, SubsidyApplicationSerializer,
    CropDiseaseReportSerializer, NotificationSerializer, UserSerializer, OfficerCreateSerializer,
)
from products.models import FarmingProduct, FarmerProduct
from products.serializers import FarmingProductSerializer
from orders.models import OrderMaster, FpOrderMaster
from orders.serializers import OrderMasterSerializer, FpOrderMasterSerializer
from complaints.models import Complaint
from complaints.serializers import ComplaintSerializer


class AdminFarmerList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = FarmerSerializer
    queryset = Farmer.objects.all().order_by('-created_at')


class AdminFarmerApprove(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            farmer = Farmer.objects.get(pk=pk)
        except Farmer.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        farmer.state = 'approved'
        farmer.save()
        return Response(FarmerSerializer(farmer).data)


class AdminFarmerReject(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            farmer = Farmer.objects.get(pk=pk)
        except Farmer.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        farmer.state = 'pending'
        farmer.save()
        return Response(FarmerSerializer(farmer).data)


class AdminAppUserList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AppUserSerializer
    queryset = AppUser.objects.all().order_by('-created_at')


class AdminAppUserApprove(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            app_user = AppUser.objects.get(pk=pk)
        except AppUser.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        app_user.approved = True
        app_user.save()
        return Response(AppUserSerializer(app_user).data)


class AdminAppUserUnapprove(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            app_user = AppUser.objects.get(pk=pk)
        except AppUser.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        app_user.approved = False
        app_user.save()
        return Response(AppUserSerializer(app_user).data)


class AdminWorkerList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = WorkerSerializer
    queryset = Worker.objects.all().order_by('-created_at')


class AdminWorkerApprove(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            worker = Worker.objects.get(pk=pk)
        except Worker.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        worker.approved = True
        worker.save()
        return Response(WorkerSerializer(worker).data)


class AdminWorkerUnapprove(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            worker = Worker.objects.get(pk=pk)
        except Worker.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        worker.approved = False
        worker.save()
        return Response(WorkerSerializer(worker).data)


class AdminOfficerListCreate(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        officers = User.objects.filter(is_staff=True, is_superuser=False).order_by('username')
        return Response(UserSerializer(officers, many=True).data)

    def post(self, request):
        ser = OfficerCreateSerializer(data=request.data)
        if ser.is_valid():
            user = ser.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminOfficerDelete(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk, is_staff=True)
        except User.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if user.is_superuser:
            return Response({'detail': 'Cannot remove superuser.'}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.pk == user.pk:
            return Response({'detail': 'You cannot remove your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminFarmingProductList(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = FarmingProductSerializer
    queryset = FarmingProduct.objects.all().order_by('-id')


class AdminOrderMasterList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = OrderMasterSerializer
    queryset = OrderMaster.objects.all().order_by('-date')


class AdminFpOrderMasterList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = FpOrderMasterSerializer
    queryset = FpOrderMaster.objects.all().order_by('-date')


class AdminComplaintList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = ComplaintSerializer
    queryset = Complaint.objects.all().order_by('-date')


class AdminComplaintReply(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        reply = request.data.get('reply', '')
        complaint.reply = reply
        complaint.replied_at = timezone.now()
        complaint.save()
        return Response(ComplaintSerializer(complaint).data)


class AdminSeedRequestList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = SeedRequestSerializer
    queryset = SeedRequest.objects.all().order_by('-created_at')


class AdminSeedRequestApprove(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        from django.db import transaction
        try:
            req = SeedRequest.objects.select_related('stock_item').get(pk=pk)
        except SeedRequest.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        with transaction.atomic():
            req = SeedRequest.objects.select_for_update().select_related('stock_item').get(pk=pk)
            if req.status != 'pending':
                return Response({'detail': 'Only pending requests can be approved.'}, status=status.HTTP_400_BAD_REQUEST)
            admin_notes = request.data.get('admin_notes', req.admin_notes or '')
            if req.stock_item and req.quantity is not None:
                stock_item = StockItem.objects.select_for_update().get(pk=req.stock_item_id)
                if stock_item.quantity < req.quantity:
                    return Response(
                        {'detail': f'Insufficient stock. Available: {stock_item.quantity} {stock_item.unit}'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                stock_item.quantity -= req.quantity
                stock_item.save(update_fields=['quantity', 'updated_at'])
            req.status = 'approved'
            req.admin_notes = admin_notes
            req.save()
        return Response(SeedRequestSerializer(req).data)


class AdminSeedRequestReject(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            req = SeedRequest.objects.get(pk=pk)
        except SeedRequest.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if req.status != 'pending':
            return Response({'detail': 'Only pending requests can be rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        req.status = 'rejected'
        req.admin_notes = request.data.get('admin_notes', req.admin_notes)
        req.save()
        return Response(SeedRequestSerializer(req).data)


class AdminStockItemList(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = StockItemSerializer
    queryset = StockItem.objects.all().order_by('item_type', 'name')


class AdminSubsidySchemeList(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = SubsidySchemeSerializer
    queryset = SubsidyScheme.objects.all().order_by('-created_at')


class AdminSubsidyApplicationList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = SubsidyApplicationSerializer
    queryset = SubsidyApplication.objects.all().order_by('-applied_at')


class AdminSubsidyApplicationApprove(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            app = SubsidyApplication.objects.get(pk=pk)
        except SubsidyApplication.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        app.status = 'approved'
        app.admin_notes = request.data.get('admin_notes', app.admin_notes or '')
        app.save()
        return Response(SubsidyApplicationSerializer(app).data)


class AdminSubsidyApplicationReject(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            app = SubsidyApplication.objects.get(pk=pk)
        except SubsidyApplication.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        app.status = 'rejected'
        app.admin_notes = request.data.get('admin_notes', app.admin_notes or '')
        app.save()
        return Response(SubsidyApplicationSerializer(app).data)


class AdminCropDiseaseReportList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CropDiseaseReportSerializer
    queryset = CropDiseaseReport.objects.all().order_by('-created_at')


class AdminCropDiseaseReportReply(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            report = CropDiseaseReport.objects.get(pk=pk)
        except CropDiseaseReport.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        report.admin_reply = request.data.get('admin_reply', '')
        report.replied_at = timezone.now()
        report.save()
        return Response(CropDiseaseReportSerializer(report).data)


class AdminNotificationList(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        farmers = Farmer.objects.all()
        users = AppUser.objects.all()
        workers = Worker.objects.all()
        complaints = Complaint.objects.all()
        seed_requests = SeedRequest.objects.all()
        subsidy_applications = SubsidyApplication.objects.all()
        crop_disease_reports = CropDiseaseReport.objects.all()
        notifications = Notification.objects.all()
        officers = User.objects.filter(is_staff=True, is_superuser=False)
        orders = OrderMaster.objects.all()
        fp_orders = FpOrderMaster.objects.all()

        payload = {
            'metrics': {
                'totalFarmers': farmers.count(),
                'pendingFarmers': farmers.filter(state='pending').count(),
                'approvedFarmers': farmers.filter(state='approved').count(),
                'pendingUsers': users.filter(approved=False).count(),
                'pendingWorkers': workers.filter(approved=False).count(),
                'openComplaints': complaints.filter(reply='').count(),
                'pendingSeed': seed_requests.filter(status='pending').count(),
                'pendingSubsidy': subsidy_applications.filter(status='pending').count(),
                'openDisease': crop_disease_reports.filter(admin_reply='').count(),
                'ordersCount': orders.count(),
                'fpOrdersCount': fp_orders.count(),
                'officersCount': officers.count(),
                'notificationsCount': notifications.count(),
            },
            'latestComplaints': ComplaintSerializer(
                complaints.filter(reply='').order_by('-date')[:3],
                many=True,
            ).data,
            'latestDisease': CropDiseaseReportSerializer(
                crop_disease_reports.order_by('-created_at')[:3],
                many=True,
            ).data,
            'latestSeedRequests': SeedRequestSerializer(
                seed_requests.order_by('-created_at')[:3],
                many=True,
            ).data,
        }
        return Response(payload)
