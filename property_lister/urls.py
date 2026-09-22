from django.urls import path

from . import views

app_name = "property_lister"

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("me/", views.me, name="me"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("properties/", views.property_list, name="property_list"),
    path("properties/add/", views.property_add, name="property_add"),
    path("properties/<int:property_id>/", views.property_detail, name="property_detail"),
    path("properties/<int:property_id>/edit/", views.property_edit, name="property_edit"),
    path("properties/<int:property_id>/delete/", views.property_delete, name="property_delete"),
    path("profile/", views.profile, name="profile"),
]
