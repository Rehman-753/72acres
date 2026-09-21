from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),  # public browsing, no login needed
    path("api/lister/", include("property_lister.urls")),  # private lister portal
]

if settings.DEBUG:
    # Development only. In production serve MEDIA_ROOT via the web server / cloud storage.
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
