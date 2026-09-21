from functools import wraps

from django.http import JsonResponse

from .models import ListerProfile


def _error(code, message, status):
    return JsonResponse({"error": code, "message": message}, status=status)


def lister_required(view=None, *, approved=True):
    """Backend gate for every private lister endpoint.

    401 -> not logged in
    403 -> logged in but not a lister, or (when approved=True) not APPROVED
    """

    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return _error("not_authenticated", "Please log in.", 401)
            profile = ListerProfile.objects.filter(user=request.user).first()
            if profile is None:
                return _error("not_a_lister", "This account is not a property lister.", 403)
            if approved and not profile.is_approved:
                msg = (
                    "Your account was rejected by the admin."
                    if profile.approval_status == ListerProfile.ApprovalStatus.REJECTED
                    else "Your account is awaiting admin approval."
                )
                return _error("not_approved", msg, 403)
            request.lister_profile = profile
            return func(request, *args, **kwargs)

        return wrapper

    return decorator(view) if view else decorator
