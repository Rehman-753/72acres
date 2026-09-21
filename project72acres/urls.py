from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path, re_path


def backend_home(request):
    """Landing page for the API server; the website itself is the React app."""
    return HttpResponse(
        "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'>"
        "<title>72acres backend</title>"
        "<style>body{font-family:Poppins,Arial,sans-serif;max-width:560px;margin:80px auto;"
        "padding:0 22px;color:#1B1F1E}h1{color:#183430}a{color:#183430;font-weight:600}"
        "li{margin:10px 0}</style></head><body>"
        "<h1>72acres backend is running</h1>"
        "<p>This is the Django API server. The website is the React app.</p>"
        "<ul>"
        "<li><a href='http://localhost:5173/'>Website (React, port 5173)</a></li>"
        "<li><a href='/admin/'>Django admin</a></li>"
        "<li><a href='/api/properties/'>Public properties API</a></li>"
        "</ul></body></html>"
    )


urlpatterns = [
    path("", backend_home, name="backend_home"),
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),  # public browsing, no login needed
    path("api/lister/", include("property_lister.urls")),  # private lister portal
]

if settings.MEDIA_IN_DATABASE:
    # Photos live in the database (Render free plan): serve them from there.
    from property_lister.views import media_file

    urlpatterns += [re_path(r"^media/(?P<name>.+)$", media_file, name="media_file")]
elif settings.DEBUG:
    # Development: serve MEDIA_ROOT from disk.
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
