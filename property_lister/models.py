from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, RegexValidator
from django.db import models


class ListerProfile(models.Model):
    """Approval state of a property lister. Created automatically for every
    non-superuser account (see signals.py); the admin approves/rejects it."""

    class ApprovalStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="lister_profile"
    )
    approval_status = models.CharField(
        max_length=10,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )

    def __str__(self):
        return f"{self.user.username} ({self.get_approval_status_display()})"

    @property
    def is_approved(self):
        return self.approval_status == self.ApprovalStatus.APPROVED


class PropertyDetail(models.Model):
    # ------------------------------------------------------------------
    # Choices
    # ------------------------------------------------------------------
    PROPERTY_TYPE_CHOICES = [
        ("apartment", "Apartment"),
        ("flat", "Flat"),
        ("villa", "Villa"),
        ("penthouse", "Penthouse"),
        ("studio_apartment", "Studio Apartment"),
        ("farmhouse", "Farmhouse"),
        ("plot", "Plot"),
        ("office", "Office"),
        ("shop", "Shop"),
        ("land", "Land"),
    ]

    LISTING_TYPE_CHOICES = [
        ("sale", "For Sale"),
        ("rent", "For Rent"),
        ("lease", "For Lease"),
    ]

    AREA_UNIT_CHOICES = [
        ("sqft", "Sq. Ft."),
        ("acre", "Acre"),
    ]

    BHK_CHOICES = [
        (1, "1 BHK"),
        (2, "2 BHK"),
        (3, "3 BHK"),
        (4, "4 BHK"),
        (5, "5 BHK"),
    ]

    BATHROOM_CHOICES = [
        (1, "1 Bathroom"),
        (2, "2 Bathrooms"),
    ]

    BALCONY_CHOICES = [
        (0, "No Balcony"),
        (1, "1 Balcony"),
        (2, "2 Balconies"),
        (3, "3 Balconies"),
        (4, "4 Balconies"),
    ]

    FLOOR_CHOICES = [
        (0, "Ground Floor"),
        (1, "1st Floor"),
        (2, "2nd Floor"),
        (3, "3rd Floor"),
        (4, "4th Floor"),
        (5, "5th Floor"),
        (6, "6th Floor"),
        (7, "7th Floor"),
        (8, "8th Floor"),
        (9, "9th Floor"),
        (10, "10+ Floor"),
    ]

    TOTAL_FLOORS_CHOICES = [
        ("1-5", "1–5 Floors"),
        ("6-10", "6–10 Floors"),
        ("11-20", "11–20 Floors"),
        ("21-30", "21–30 Floors"),
        ("30+", "30+ Floors"),
    ]

    FURNISHING_CHOICES = [
        ("unfurnished", "Unfurnished"),
        ("semi_furnished", "Semi-Furnished"),
        ("fully_furnished", "Fully Furnished"),
    ]

    PARKING_CHOICES = [
        ("none", "No Parking"),
        ("open", "Open Parking"),
        ("covered", "Covered Parking"),
        ("basement", "Basement Parking"),
        ("mechanical", "Mechanical Parking"),
    ]

    CONSTRUCTION_STATUS_CHOICES = [
        ("ready_to_move", "Ready to Move"),
        ("under_construction", "Under Construction"),
        ("new_launch", "New Launch"),
        ("upcoming", "Upcoming"),
        ("resale", "Resale"),
    ]

    AMENITY_CHOICES = [
        ("lift", "Lift"),
        ("gym", "Gym"),
        ("swimming_pool", "Swimming Pool"),
        ("club_house", "Club House"),
        ("garden", "Garden"),
        ("childrens_play_area", "Children's Play Area"),
        ("security_24x7", "24x7 Security"),
        ("cctv", "CCTV"),
        ("power_backup", "Power Backup"),
        ("water_supply_24x7", "24x7 Water Supply"),
        ("fire_safety", "Fire Safety"),
        ("intercom", "Intercom"),
        ("visitor_parking", "Visitor Parking"),
        ("jogging_track", "Jogging Track"),
        ("sports_area", "Sports Area"),
        ("indoor_games", "Indoor Games"),
        ("tennis_court", "Tennis Court"),
        ("badminton_court", "Badminton Court"),
        ("basketball_court", "Basketball Court"),
        ("community_hall", "Community Hall"),
        ("rooftop_garden", "Rooftop Garden"),
        ("gazebo", "Gazebo"),
        ("ev_charging", "EV Charging"),
        ("solar_power", "Solar Power"),
        ("rainwater_harvesting", "Rainwater Harvesting"),
        ("sewage_treatment_plant", "Sewage Treatment Plant"),
        ("waste_management", "Waste Management"),
        ("air_conditioning", "Air Conditioning"),
        ("wifi", "Wi-Fi Connectivity"),
        ("piped_gas", "Piped Gas"),
    ]

    # ------------------------------------------------------------------
    # Fields
    # ------------------------------------------------------------------
    lister = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="properties"
    )

    title = models.CharField(max_length=200)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES)
    listing_type = models.CharField(max_length=10, choices=LISTING_TYPE_CHOICES)
    description = models.TextField()

    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    locality = models.CharField(max_length=150)
    address = models.CharField(max_length=255)
    landmark = models.CharField(max_length=150, blank=True)
    pincode = models.CharField(
        max_length=6,
        validators=[RegexValidator(r"^\d{6}$", "Enter a valid 6-digit pincode.")],
    )

    carpet_area = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    built_up_area = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        blank=True,
        null=True,
    )
    area_unit = models.CharField(
        max_length=10, choices=AREA_UNIT_CHOICES, default="sqft"
    )

    # Optional because plots, land, shops etc. do not have them.
    bhk = models.PositiveSmallIntegerField(choices=BHK_CHOICES, blank=True, null=True)
    bathrooms = models.PositiveSmallIntegerField(
        choices=BATHROOM_CHOICES, blank=True, null=True
    )
    balconies = models.PositiveSmallIntegerField(
        choices=BALCONY_CHOICES, blank=True, null=True
    )
    floor = models.PositiveSmallIntegerField(
        choices=FLOOR_CHOICES, blank=True, null=True
    )
    total_floors = models.CharField(
        max_length=10, choices=TOTAL_FLOORS_CHOICES, blank=True
    )

    furnishing = models.CharField(max_length=20, choices=FURNISHING_CHOICES, blank=True)
    parking = models.CharField(max_length=20, choices=PARKING_CHOICES, blank=True)

    price = models.DecimalField(
        max_digits=14, decimal_places=2, validators=[MinValueValidator(1)]
    )

    construction_status = models.CharField(
        max_length=20, choices=CONSTRUCTION_STATUS_CHOICES
    )
    possession_date = models.DateField(blank=True, null=True)

    rera_registered = models.BooleanField(default=False)
    rera_number = models.CharField(max_length=50, blank=True)

    # List of AMENITY_CHOICES keys, validated by the form's MultipleChoiceField.
    amenities = models.JSONField(default=list, blank=True)

    image_1 = models.ImageField(upload_to="properties/")
    image_2 = models.ImageField(upload_to="properties/", blank=True)
    image_3 = models.ImageField(upload_to="properties/", blank=True)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.title
