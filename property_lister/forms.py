from django import forms
from django.contrib.auth.models import User

from .models import PropertyDetail


class PropertyForm(forms.ModelForm):
    """`lister` is intentionally NOT a field: the owner is always assigned
    from the authenticated user in the view."""

    amenities = forms.MultipleChoiceField(
        choices=PropertyDetail.AMENITY_CHOICES, required=False
    )
    possession_date = forms.DateField(required=False)

    class Meta:
        model = PropertyDetail
        fields = [
            "title",
            "property_type",
            "listing_type",
            "description",
            "state",
            "city",
            "locality",
            "address",
            "landmark",
            "pincode",
            "carpet_area",
            "built_up_area",
            "area_unit",
            "bhk",
            "bathrooms",
            "balconies",
            "floor",
            "total_floors",
            "furnishing",
            "parking",
            "price",
            "construction_status",
            "possession_date",
            "rera_registered",
            "rera_number",
            "amenities",
            "image_1",
            "image_2",
            "image_3",
        ]


class ListerProfileForm(forms.ModelForm):
    """Editable parts of a lister's own profile (Django's built-in User)."""

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email"]
