from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from .models import Ubicacion, ProveedorUbicacion
from .serializers import UbicacionSerializer, ProveedorUbicacionSerializer


class UbicacionListView(generics.ListAPIView):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['departamento', 'municipio']
    ordering_fields = ['departamento', 'municipio']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        departamento = self.request.query_params.get('departamento')
        if departamento:
            queryset = queryset.filter(departamento__icontains=departamento)
        return queryset


class UbicacionDetailView(generics.RetrieveAPIView):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer


class ProveedorUbicacionView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProveedorUbicacionSerializer
    
    def get_queryset(self):
        return ProveedorUbicacion.objects.filter(proveedor=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(proveedor=self.request.user)


class ProveedorUbicacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProveedorUbicacionSerializer
    
    def get_queryset(self):
        return ProveedorUbicacion.objects.filter(proveedor=self.request.user)