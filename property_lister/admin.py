from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import ListerProfile, PropertyDetail


class ListerProfileInline(admin.StackedInline):
    model = ListerProfile
    can_delete = False
    extra = 0


class UserAdminWithProfile(UserAdmin):
    inlines = [ListerProfileInline]
    list_display = UserAdmin.list_display + ("lister_status",)

    def get_inline_instances(self, request, obj=None):
        # On the "add user" page the profile is created automatically (PENDING).
        return super().get_inline_instances(request, obj) if obj else []

    @admin.display(description="Lister status")
    def lister_status(self, obj):
        profile = getattr(obj, "lister_profile", None)
        return profile.get_approval_status_display() if profile else "—"


admin.site.unregister(User)
admin.site.register(User, UserAdminWithProfile)


@admin.register(ListerProfile)
class ListerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "user_email", "approval_status", "property_count")
    list_filter = ("approval_status",)
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name")
    list_select_related = ("user",)
    actions = ["approve_listers", "reject_listers"]

    @admin.display(description="Email")
    def user_email(self, obj):
        return obj.user.email

    @admin.display(description="Properties")
    def property_count(self, obj):
        return obj.user.properties.count()

    @admin.action(description="Approve selected listers")
    def approve_listers(self, request, queryset):
        n = queryset.update(approval_status=ListerProfile.ApprovalStatus.APPROVED)
        self.message_user(request, f"{n} lister(s) approved.", messages.SUCCESS)

    @admin.action(description="Reject selected listers")
    def reject_listers(self, request, queryset):
        n = queryset.update(approval_status=ListerProfile.ApprovalStatus.REJECTED)
        self.message_user(request, f"{n} lister(s) rejected.", messages.WARNING)


@admin.register(PropertyDetail)
class PropertyDetailAdmin(admin.ModelAdmin):
    list_display = ("title", "lister", "property_type", "listing_type", "city", "price")
    list_filter = ("listing_type", "property_type", "construction_status", "city", "rera_registered")
    search_fields = ("title", "city", "locality", "address", "pincode", "lister__username")
    autocomplete_fields = ("lister",)
    fieldsets = (
        ("Owner", {"fields": ("lister",)}),
        ("Basics", {"fields": ("title", "property_type", "listing_type", "description", "price")}),
        ("Location", {"fields": ("state", "city", "locality", "address", "landmark", "pincode")}),
        ("Area", {"fields": ("carpet_area", "built_up_area", "area_unit")}),
        (
            "Configuration",
            {"fields": ("bhk", "bathrooms", "balconies", "floor", "total_floors", "furnishing", "parking")},
        ),
        ("Status", {"fields": ("construction_status", "possession_date", "rera_registered", "rera_number")}),
        ("Amenities", {"fields": ("amenities",)}),
        ("Images", {"fields": ("image_1", "image_2", "image_3")}),
    )
