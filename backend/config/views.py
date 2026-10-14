"""API root: list available endpoints."""
from django.http import JsonResponse
from django.conf import settings


def api_root(request):
    base = request.build_absolute_uri('/api/').rstrip('/')
    return JsonResponse({
        'message': 'Krishi Bhavan Management System API',
        'endpoints': {
            'auth': f'{base}/auth/',
            'products': f'{base}/products/',
            'orders': f'{base}/orders/',
            'complaints': f'{base}/complaints/',
            'workers': f'{base}/workers/',
            'crop_recommendation': f'{base}/crop-recommendation/',
        },
    })
