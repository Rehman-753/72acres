from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .decorators import lister_required
from .forms import ListerProfileForm, PropertyForm
from .models import ListerProfile, PropertyDetail, StoredFile
from .serializers import property_to_dict


def _profile_dict(user, profile):
    return {
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "approval_status": profile.approval_status,
    }


def _form_errors(form):
    return JsonResponse({"error": "validation", "errors": form.errors.get_json_data()}, status=400)


# --------------------------------------------------------------- media ----

@require_GET
def media_file(request, name):
    """Public, read-only image download for DatabaseStorage. Only raster images
    are served (never SVG/HTML) so an upload can't become stored XSS."""
    row = StoredFile.objects.filter(name=name).first()
    ctype = row.content_type if row else ""
    if not row or not ctype.startswith("image/") or "svg" in ctype:
        raise Http404
    response = HttpResponse(bytes(row.content), content_type=ctype)
    response["Cache-Control"] = "public, max-age=86400"
    return response


# ---------------------------------------------------------------- auth ----

@require_GET
@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"ok": True})


@require_POST
def login_view(request):
    form = AuthenticationForm(request, data=request.POST)
    if not form.is_valid():
        return _form_errors(form)
    user = form.get_user()
    profile = ListerProfile.objects.filter(user=user).first()
    if profile is None:
        return JsonResponse(
            {"error": "not_a_lister", "message": "This account is not a property lister."},
            status=403,
        )
    login(request, user)
    return JsonResponse(_profile_dict(user, profile))


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"ok": True})


@require_GET
@lister_required(approved=False)
def me(request):
    """Session state, used by the frontend to route pending/rejected/approved."""
    return JsonResponse(_profile_dict(request.user, request.lister_profile))


# ----------------------------------------------------------- dashboard ----

@require_GET
@lister_required
def dashboard(request):
    # Only this lister's own properties are counted.
    total = PropertyDetail.objects.filter(lister=request.user).count()
    return JsonResponse({"total_properties": total})


# ---------------------------------------------------------- properties ----

@require_GET
@lister_required
def property_list(request):
    qs = PropertyDetail.objects.filter(lister=request.user)
    return JsonResponse({"results": [property_to_dict(p) for p in qs]})


@require_POST
@lister_required
def property_add(request):
    form = PropertyForm(request.POST, request.FILES)
    if not form.is_valid():
        return _form_errors(form)
    obj = form.save(commit=False)
    obj.lister = request.user  # never taken from the request
    obj.save()
    return JsonResponse(property_to_dict(obj), status=201)


@require_GET
@lister_required
def property_detail(request, property_id):
    obj = get_object_or_404(PropertyDetail, id=property_id, lister=request.user)
    return JsonResponse(property_to_dict(obj))


@require_POST
@lister_required
def property_edit(request, property_id):
    obj = get_object_or_404(PropertyDetail, id=property_id, lister=request.user)
    form = PropertyForm(request.POST, request.FILES, instance=obj)
    if not form.is_valid():
        return _form_errors(form)
    obj = form.save(commit=False)
    obj.lister = request.user  # re-assert ownership
    obj.save()
    return JsonResponse(property_to_dict(obj))


@require_POST
@lister_required
def property_delete(request, property_id):
    obj = get_object_or_404(PropertyDetail, id=property_id, lister=request.user)
    obj.delete()
    return JsonResponse({"ok": True})


# ------------------------------------------------------------- profile ----

@lister_required
def profile(request):
    if request.method == "POST":
        form = ListerProfileForm(request.POST, instance=request.user)
        if not form.is_valid():
            return _form_errors(form)
        form.save()
    elif request.method != "GET":
        return JsonResponse({"error": "method_not_allowed"}, status=405)
    return JsonResponse(_profile_dict(request.user, request.lister_profile))
