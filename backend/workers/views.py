from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend

from .models import WorkRequest
from .serializers import WorkRequestSerializer, WorkerListSerializer
from users.models import Worker


class WorkerList(generics.ListAPIView):
    """List workers (for farmers to send work requests)."""
    serializer_class = WorkerListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['place']

    def get_queryset(self):
        if not hasattr(self.request.user, 'farmer_profile'):
            raise PermissionDenied('Only farmers can view the workers list.')
        return Worker.objects.filter(approved=True).order_by('user__username', 'id')


class WorkRequestList(generics.ListCreateAPIView):
    serializer_class = WorkRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'farmer_profile'):
            return WorkRequest.objects.filter(farmer=user.farmer_profile)
        if hasattr(user, 'worker_profile'):
            if not user.worker_profile.approved:
                raise PermissionDenied('Your worker account is awaiting approval.')
            return WorkRequest.objects.filter(worker=user.worker_profile)
        raise PermissionDenied('Only farmers and workers can view work requests.')

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'farmer_profile'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only farmers can send work requests.')
        farmer = self.request.user.farmer_profile
        if farmer.state != 'approved':
            raise PermissionDenied('Your farmer account is awaiting approval.')
        serializer.save(farmer=farmer)


class WorkRequestDetail(generics.RetrieveAPIView):
    serializer_class = WorkRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'farmer_profile'):
            return WorkRequest.objects.filter(farmer=user.farmer_profile)
        if hasattr(user, 'worker_profile'):
            if not user.worker_profile.approved:
                raise PermissionDenied('Your worker account is awaiting approval.')
            return WorkRequest.objects.filter(worker=user.worker_profile)
        raise PermissionDenied('Only farmers and workers can view work requests.')


class WorkRequestApprove(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not hasattr(request.user, 'worker_profile') or not request.user.worker_profile.approved:
            return Response({'detail': 'Your worker account is awaiting approval.'}, status=status.HTTP_403_FORBIDDEN)
        wr = WorkRequest.objects.filter(worker__user=request.user, pk=pk).first()
        if not wr:
            return Response({'detail': 'Not found.'}, status=404)
        wr.status = 'approved'
        wr.save()
        return Response({'status': 'approved'})


class WorkRequestReject(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not hasattr(request.user, 'worker_profile') or not request.user.worker_profile.approved:
            return Response({'detail': 'Your worker account is awaiting approval.'}, status=status.HTTP_403_FORBIDDEN)
        wr = WorkRequest.objects.filter(worker__user=request.user, pk=pk).first()
        if not wr:
            return Response({'detail': 'Not found.'}, status=404)
        wr.status = 'rejected'
        wr.save()
        return Response({'status': 'rejected'})


class WorkRequestAllList(generics.ListAPIView):
    """Admin view: all work requests."""
    serializer_class = WorkRequestSerializer
    permission_classes = [IsAdminUser]
    queryset = WorkRequest.objects.all().order_by('-date')
