from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .engine import recommend_crops
from .models import CropRecommendationRequest
from users.models import Farmer


class CropRecommendationView(APIView):
    """POST with soil_type, water_availability, climate, ph (optional), previous_crop (optional)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        soil_type = request.data.get('soil_type', '').strip()
        water_availability = request.data.get('water_availability', '').strip()
        climate = request.data.get('climate', '').strip()
        ph = request.data.get('ph')
        previous_crop = request.data.get('previous_crop', '').strip()

        if not soil_type or not water_availability or not climate:
            return Response(
                {'error': 'soil_type, water_availability, and climate are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if ph is not None:
                ph = float(ph)
        except (TypeError, ValueError):
            ph = None

        results = recommend_crops(
            soil_type=soil_type,
            water_availability=water_availability,
            climate=climate,
            ph=ph,
            previous_crop=previous_crop,
        )

        farmer = None
        if hasattr(request.user, 'farmer_profile'):
            farmer = request.user.farmer_profile

        CropRecommendationRequest.objects.create(
            farmer=farmer,
            soil_type=soil_type,
            ph_min=ph,
            ph_max=ph,
            water_availability=water_availability,
            climate=climate,
            previous_crop=previous_crop,
            recommended_crops=','.join(r['crop'] for r in results),
        )

        return Response({'recommendations': results})
