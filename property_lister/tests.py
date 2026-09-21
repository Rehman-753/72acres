import io
import shutil
import tempfile

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image

from .models import ListerProfile, PropertyDetail

TMP_MEDIA = tempfile.mkdtemp()


def make_image(name="a.png"):
    buf = io.BytesIO()
    Image.new("RGB", (10, 10), "white").save(buf, "PNG")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/png")


def property_payload(**over):
    data = {
        "title": "Test Villa",
        "property_type": "villa",
        "listing_type": "sale",
        "description": "Nice",
        "state": "Karnataka",
        "city": "Bangalore",
        "locality": "Whitefield",
        "address": "1 Main Rd",
        "pincode": "560066",
        "carpet_area": "1200",
        "area_unit": "sqft",
        "price": "5000000",
        "construction_status": "ready_to_move",
        "amenities": ["gym", "lift"],
        "image_1": make_image(),
    }
    data.update(over)
    return data


def make_lister(username, status=ListerProfile.ApprovalStatus.APPROVED):
    user = User.objects.create_user(username, password="pass12345")
    ListerProfile.objects.filter(user=user).update(approval_status=status)
    return user


def make_property(user, **over):
    fields = dict(
        lister=user, title="P", property_type="flat", listing_type="sale",
        description="d", state="S", city="C", locality="L", address="A",
        pincode="123456", carpet_area=100, price=100, construction_status="resale",
        image_1="properties/x.png",
    )
    fields.update(over)
    return PropertyDetail.objects.create(**fields)


@override_settings(MEDIA_ROOT=TMP_MEDIA)
class ListerPortalTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TMP_MEDIA, ignore_errors=True)

    def setUp(self):
        self.a = make_lister("a")
        self.b = make_lister("b")
        self.prop_a = make_property(self.a, title="A's")
        self.prop_b = make_property(self.b, title="B's")

    def login(self, user):
        self.client.force_login(user)

    # --- profile / approval -------------------------------------------
    def test_new_user_gets_pending_profile_but_superuser_does_not(self):
        u = User.objects.create_user("new", password="x")
        self.assertEqual(u.lister_profile.approval_status, "PENDING")
        su = User.objects.create_superuser("root", password="x")
        self.assertFalse(ListerProfile.objects.filter(user=su).exists())

    def test_login_returns_status_for_pending_lister(self):
        make_lister("p", ListerProfile.ApprovalStatus.PENDING)
        r = self.client.post(reverse("property_lister:login"), {"username": "p", "password": "pass12345"})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["approval_status"], "PENDING")

    def test_login_rejects_bad_password_and_non_listers(self):
        r = self.client.post(reverse("property_lister:login"), {"username": "a", "password": "nope"})
        self.assertEqual(r.status_code, 400)
        User.objects.create_superuser("root", password="pass12345")
        r = self.client.post(reverse("property_lister:login"), {"username": "root", "password": "pass12345"})
        self.assertEqual(r.status_code, 403)

    def test_anonymous_gets_401(self):
        for name in ("dashboard", "property_list", "profile"):
            self.assertEqual(self.client.get(reverse(f"property_lister:{name}")).status_code, 401)

    def test_pending_and_rejected_cannot_do_anything_restricted(self):
        for status in ("PENDING", "REJECTED"):
            u = make_lister(f"u_{status}", status)
            own = make_property(u)
            self.login(u)
            self.assertEqual(self.client.get(reverse("property_lister:me")).status_code, 200)
            checks = [
                self.client.get(reverse("property_lister:dashboard")),
                self.client.get(reverse("property_lister:property_list")),
                self.client.post(reverse("property_lister:property_add"), property_payload()),
                self.client.post(reverse("property_lister:property_edit", args=[own.id]), property_payload()),
                self.client.post(reverse("property_lister:property_delete", args=[own.id])),
                self.client.get(reverse("property_lister:profile")),
            ]
            for r in checks:
                self.assertEqual(r.status_code, 403, status)
            self.assertTrue(PropertyDetail.objects.filter(id=own.id).exists())

    # --- data isolation ----------------------------------------------
    def test_list_and_dashboard_only_show_own(self):
        self.login(self.a)
        titles = [p["title"] for p in self.client.get(reverse("property_lister:property_list")).json()["results"]]
        self.assertEqual(titles, ["A's"])
        self.assertEqual(self.client.get(reverse("property_lister:dashboard")).json()["total_properties"], 1)

    def test_cannot_view_edit_delete_other_listers_property(self):
        self.login(self.a)
        pid = self.prop_b.id
        self.assertEqual(self.client.get(reverse("property_lister:property_detail", args=[pid])).status_code, 404)
        r = self.client.post(reverse("property_lister:property_edit", args=[pid]), property_payload(title="Hacked"))
        self.assertEqual(r.status_code, 404)
        self.assertEqual(self.client.post(reverse("property_lister:property_delete", args=[pid])).status_code, 404)
        self.prop_b.refresh_from_db()
        self.assertEqual(self.prop_b.title, "B's")

    def test_delete_requires_post(self):
        self.login(self.a)
        r = self.client.get(reverse("property_lister:property_delete", args=[self.prop_a.id]))
        self.assertEqual(r.status_code, 405)
        self.assertTrue(PropertyDetail.objects.filter(id=self.prop_a.id).exists())

    # --- CRUD ---------------------------------------------------------
    def test_create_assigns_owner_from_session_and_ignores_submitted_lister(self):
        self.login(self.a)
        r = self.client.post(reverse("property_lister:property_add"), property_payload(lister=self.b.id))
        self.assertEqual(r.status_code, 201, r.content)
        obj = PropertyDetail.objects.get(id=r.json()["id"])
        self.assertEqual(obj.lister, self.a)
        self.assertEqual(obj.amenities, ["gym", "lift"])
        self.assertTrue(obj.image_1.name.startswith("properties/"))

    def test_edit_cannot_change_owner(self):
        self.login(self.a)
        r = self.client.post(
            reverse("property_lister:property_edit", args=[self.prop_a.id]),
            property_payload(title="New", lister=self.b.id),
        )
        self.assertEqual(r.status_code, 200, r.content)
        self.prop_a.refresh_from_db()
        self.assertEqual((self.prop_a.title, self.prop_a.lister), ("New", self.a))

    def test_delete_own(self):
        self.login(self.a)
        r = self.client.post(reverse("property_lister:property_delete", args=[self.prop_a.id]))
        self.assertEqual(r.status_code, 200)
        self.assertFalse(PropertyDetail.objects.filter(id=self.prop_a.id).exists())

    def test_validation_errors(self):
        self.login(self.a)
        r = self.client.post(
            reverse("property_lister:property_add"),
            property_payload(pincode="12", amenities=["not_real"], property_type="warehouse"),
        )
        self.assertEqual(r.status_code, 400)
        errs = r.json()["errors"]
        for field in ("pincode", "amenities", "property_type"):
            self.assertIn(field, errs)

    def test_image_1_required(self):
        self.login(self.a)
        data = property_payload()
        del data["image_1"]
        r = self.client.post(reverse("property_lister:property_add"), data)
        self.assertIn("image_1", r.json()["errors"])

    def test_profile_update(self):
        self.login(self.a)
        r = self.client.post(reverse("property_lister:profile"), {"first_name": "Al", "last_name": "B", "email": "a@x.com"})
        self.assertEqual(r.status_code, 200)
        self.a.refresh_from_db()
        self.assertEqual(self.a.email, "a@x.com")

    def test_csrf_enforced(self):
        from django.test import Client

        c = Client(enforce_csrf_checks=True)
        c.force_login(self.a)
        r = c.post(reverse("property_lister:property_delete", args=[self.prop_a.id]))
        self.assertEqual(r.status_code, 403)
