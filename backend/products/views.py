from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import FarmingProduct, FarmerProduct
from .serializers import FarmingProductSerializer, FarmerProductSerializer, FarmerProductCreateSerializer
from users.models import Farmer


class FarmingProductList(generics.ListAPIView):
    queryset = FarmingProduct.objects.all()
    serializer_class = FarmingProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class FarmingProductDetail(generics.RetrieveAPIView):
    queryset = FarmingProduct.objects.all()
    serializer_class = FarmingProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class FarmerProductList(generics.ListAPIView):
    queryset = FarmerProduct.objects.all()
    serializer_class = FarmerProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['farmer']


class FarmerProductDetail(generics.RetrieveAPIView):
    queryset = FarmerProduct.objects.all()
    serializer_class = FarmerProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class FarmerProductCreate(APIView):
    """Farmer adds their product (approved farmers only)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            farmer = Farmer.objects.get(user=request.user)
        except Farmer.DoesNotExist:
            return Response({'detail': 'Farmer profile not found.'}, status=status.HTTP_403_FORBIDDEN)
        if farmer.state != 'approved':
            return Response({'detail': 'Only approved farmers can add products.'}, status=status.HTTP_403_FORBIDDEN)
        ser = FarmerProductCreateSerializer(data=request.data)
        if ser.is_valid():
            ser.save(farmer=farmer)
            return Response(ser.data, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
