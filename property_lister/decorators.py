from functools import wraps

from django.http import JsonResponse

from .models import AuthToken, ListerProfile


def _error(code, message, status):
    return JsonResponse({"error": code, "message": message}, status=status)


def _user_from_token(request):
    header = request.headers.get("Authorization", "")
    if not header.startswith("Token "):
        return None
    key = header[len("Token ") :].strip()
    token = AuthToken.objects.select_related("user").filter(key=key).first()
    return token.user if token else None


def lister_required(view=None, *, approved=True):
    """Backend gate for every private lister endpoint.

    Auth is a bearer token in the Authorization header (see AuthToken), not a
    session cookie: the frontend and backend are on different sites, and
    browsers commonly block that cross-site cookie by default.

    401 -> missing/invalid token
    403 -> logged in but not a lister, or (when approved=True) not APPROVED
    """

    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            user = _user_from_token(request)
            if user is None or not user.is_active:
                return _error("not_authenticated", "Please log in.", 401)
            profile = ListerProfile.objects.filter(user=user).first()
            if profile is None:
                return _error("not_a_lister", "This account is not a property lister.", 403)
            if approved and not profile.is_approved:
                msg = (
                    "Your account was rejected by the admin."
                    if profile.approval_status == ListerProfile.ApprovalStatus.REJECTED
                    else "Your account is awaiting admin approval."
                )
                return _error("not_approved", msg, 403)
            request.user = user
            request.lister_profile = profile
            return func(request, *args, **kwargs)

        return wrapper

    return decorator(view) if view else decorator
