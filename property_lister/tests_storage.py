from django.core.files.base import ContentFile
from django.http import Http404
from django.test import RequestFactory, TestCase, override_settings
from django.urls import reverse

from .models import PropertyDetail, StoredFile
from .storage import DatabaseStorage
from .tests import make_image, make_lister, property_payload
from .views import media_file

DB_STORAGES = {
    "default": {"BACKEND": "property_lister.storage.DatabaseStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}


class DatabaseStorageTests(TestCase):
    def test_save_open_exists_delete_roundtrip(self):
        s = DatabaseStorage()
        name = s.save("properties/a.png", ContentFile(b"bytes"))
        self.assertEqual(name, "properties/a.png")
        self.assertTrue(s.exists(name))
        self.assertEqual(s.open(name).read(), b"bytes")
        self.assertEqual(s.size(name), 5)
        self.assertEqual(s.url(name), "/media/properties/a.png")
        s.delete(name)
        self.assertFalse(s.exists(name))

    def test_same_name_gets_unique_name(self):
        s = DatabaseStorage()
        a = s.save("properties/x.png", ContentFile(b"1"))
        b = s.save("properties/x.png", ContentFile(b"2"))
        self.assertNotEqual(a, b)
        self.assertEqual(s.open(a).read(), b"1")

    @override_settings(STORAGES=DB_STORAGES)
    def test_lister_upload_goes_to_database_and_is_served(self):
        user = make_lister("dbl")
        self.client.force_login(user)
        r = self.client.post(reverse("property_lister:property_add"), property_payload(image_1=make_image("pic.png")))
        self.assertEqual(r.status_code, 201, r.content)
        prop = PropertyDetail.objects.get()
        self.assertTrue(StoredFile.objects.filter(name=prop.image_1.name).exists())

        resp = media_file(RequestFactory().get("/media/x"), prop.image_1.name)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp["Content-Type"], "image/png")
        self.assertEqual(resp.content[:4], b"\x89PNG")

    def test_only_raster_images_are_served(self):
        StoredFile.objects.create(name="evil.svg", content=b"<svg/>", content_type="image/svg+xml")
        StoredFile.objects.create(name="evil.html", content=b"<script>", content_type="text/html")
        for name in ("evil.svg", "evil.html", "missing.png"):
            with self.assertRaises(Http404):
                media_file(RequestFactory().get("/media/x"), name)
