from django.urls import path

from . import views

app_name = "users"

urlpatterns = [
    path("options/", views.options, name="options"),
    path("properties/", views.property_list, name="property_list"),
    path("properties/<int:property_id>/", views.property_detail, name="property_detail"),
]
