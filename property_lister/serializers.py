"""Plain-dict serialisation of properties.

The output never includes the lister (owner) so it is safe to reuse on the
public site.
"""

from .models import PropertyDetail

_CHOICE_FIELDS = [
    "property_type",
    "listing_type",
    "area_unit",
    "bhk",
    "bathrooms",
    "balconies",
    "floor",
    "total_floors",
    "furnishing",
    "parking",
    "construction_status",
]

_AMENITY_LABELS = dict(PropertyDetail.AMENITY_CHOICES)


def _image_url(field, request):
    if not field:
        return None
    # Absolute so the URL still works when the React frontend is served from a
    # different domain (Vercel) than the API (Render) - a bare "/media/..."
    # path would resolve against the wrong origin in the browser.
    return request.build_absolute_uri(field.url) if request else field.url


def property_to_dict(p, request=None):
    data = {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "state": p.state,
        "city": p.city,
        "locality": p.locality,
        "address": p.address,
        "landmark": p.landmark,
        "pincode": p.pincode,
        "carpet_area": str(p.carpet_area),
        "built_up_area": str(p.built_up_area) if p.built_up_area is not None else None,
        "price": str(p.price),
        "possession_date": p.possession_date.isoformat() if p.possession_date else None,
        "rera_registered": p.rera_registered,
        "rera_number": p.rera_number,
        "amenities": list(p.amenities or []),
        "amenity_labels": [
            _AMENITY_LABELS[a] for a in (p.amenities or []) if a in _AMENITY_LABELS
        ],
        "images": [
            url
            for url in (
                _image_url(p.image_1, request),
                _image_url(p.image_2, request),
                _image_url(p.image_3, request),
            )
            if url
        ],
    }
    for name in _CHOICE_FIELDS:
        data[name] = getattr(p, name)
        data[f"{name}_label"] = getattr(p, f"get_{name}_display")() if getattr(p, name) not in (None, "") else None
    return data


def choices_payload():
    """Choice lists for building forms/filters in the frontend."""

    def opts(choices):
        return [{"value": v, "label": l} for v, l in choices]

    return {
        "property_type": opts(PropertyDetail.PROPERTY_TYPE_CHOICES),
        "listing_type": opts(PropertyDetail.LISTING_TYPE_CHOICES),
        "area_unit": opts(PropertyDetail.AREA_UNIT_CHOICES),
        "bhk": opts(PropertyDetail.BHK_CHOICES),
        "bathrooms": opts(PropertyDetail.BATHROOM_CHOICES),
        "balconies": opts(PropertyDetail.BALCONY_CHOICES),
        "floor": opts(PropertyDetail.FLOOR_CHOICES),
        "total_floors": opts(PropertyDetail.TOTAL_FLOORS_CHOICES),
        "furnishing": opts(PropertyDetail.FURNISHING_CHOICES),
        "parking": opts(PropertyDetail.PARKING_CHOICES),
        "construction_status": opts(PropertyDetail.CONSTRUCTION_STATUS_CHOICES),
        "amenities": opts(PropertyDetail.AMENITY_CHOICES),
    }
