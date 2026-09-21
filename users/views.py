from decimal import Decimal, InvalidOperation

from django.core.paginator import EmptyPage, Paginator
from django.db.models import Case, IntegerField, Q, Value, When
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET

from property_lister.models import ListerProfile, PropertyDetail
from property_lister.serializers import choices_payload, property_to_dict

PAGE_SIZE = 9
RELATED_LIMIT = 3


def public_properties():
    """Only properties whose lister the admin has approved are public."""
    return PropertyDetail.objects.filter(
        lister__lister_profile__approval_status=ListerProfile.ApprovalStatus.APPROVED
    )


def _decimal(value):
    try:
        return Decimal(value)
    except (InvalidOperation, TypeError):
        return None


@require_GET
def options(request):
    return JsonResponse(choices_payload())


@require_GET
def property_list(request):
    qs = public_properties()
    params = request.GET

    q = params.get("q", "").strip()
    if q:
        qs = qs.filter(
            Q(title__icontains=q)
            | Q(city__icontains=q)
            | Q(locality__icontains=q)
            | Q(state__icontains=q)
        )

    city = params.get("city", "").strip()
    if city:
        qs = qs.filter(city__icontains=city)

    if params.get("listing_type") in dict(PropertyDetail.LISTING_TYPE_CHOICES):
        qs = qs.filter(listing_type=params["listing_type"])
    if params.get("property_type") in dict(PropertyDetail.PROPERTY_TYPE_CHOICES):
        qs = qs.filter(property_type=params["property_type"])

    bhk = params.get("bhk", "")
    if bhk.isdigit():
        # "4" means 4 BHK and above, matching the "4+ BHK" search option.
        qs = qs.filter(bhk__gte=int(bhk)) if int(bhk) >= 4 else qs.filter(bhk=int(bhk))

    min_price = _decimal(params.get("min_price"))
    max_price = _decimal(params.get("max_price"))
    if min_price is not None:
        qs = qs.filter(price__gte=min_price)
    if max_price is not None:
        qs = qs.filter(price__lte=max_price)

    try:
        page_size = min(max(int(params.get("page_size", PAGE_SIZE)), 1), 30)
        page_no = max(int(params.get("page", 1)), 1)
    except ValueError:
        page_size, page_no = PAGE_SIZE, 1

    paginator = Paginator(qs, page_size)
    try:
        page = paginator.page(page_no)
    except EmptyPage:
        page = paginator.page(paginator.num_pages)

    return JsonResponse(
        {
            "results": [property_to_dict(p) for p in page.object_list],
            "count": paginator.count,
            "page": page.number,
            "num_pages": paginator.num_pages,
        }
    )


@require_GET
def property_detail(request, property_id):
    obj = get_object_or_404(public_properties(), id=property_id)

    # Related: same city AND type ranks first, then same city OR same type.
    same_city = Q(city__iexact=obj.city)
    same_type = Q(property_type=obj.property_type)
    related = (
        public_properties()
        .exclude(id=obj.id)
        .filter(same_city | same_type)
        .annotate(
            score=Case(
                When(same_city & same_type, then=Value(2)),
                default=Value(1),
                output_field=IntegerField(),
            )
        )
        .order_by("-score", "-id")[:RELATED_LIMIT]
    )

    data = property_to_dict(obj)
    data["related"] = [property_to_dict(p) for p in related]
    return JsonResponse(data)
