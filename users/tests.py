from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from property_lister.models import ListerProfile
from property_lister.tests import make_lister, make_property


class PublicBrowseTests(TestCase):
    def setUp(self):
        self.ok = make_lister("ok")
        self.pending = make_lister("pend", ListerProfile.ApprovalStatus.PENDING)

    def test_only_approved_listers_properties_are_public(self):
        a = make_property(self.ok, title="Visible")
        make_property(self.pending, title="Hidden")
        r = self.client.get(reverse("users:property_list"))  # anonymous
        self.assertEqual([p["title"] for p in r.json()["results"]], ["Visible"])
        self.assertEqual(self.client.get(reverse("users:property_detail", args=[a.id])).status_code, 200)

    def test_pending_property_detail_404(self):
        h = make_property(self.pending)
        self.assertEqual(self.client.get(reverse("users:property_detail", args=[h.id])).status_code, 404)

    def test_no_lister_info_leaks(self):
        p = make_property(self.ok)
        body = self.client.get(reverse("users:property_detail", args=[p.id])).content.decode()
        self.assertNotIn("lister", body)
        self.assertNotIn("ok@", body)

    def test_filters(self):
        make_property(self.ok, title="Cheap flat", city="Pune", price=1_000_000, bhk=2)
        make_property(self.ok, title="Big villa", city="Mumbai", property_type="villa", price=90_000_000, bhk=5, listing_type="rent")
        url = reverse("users:property_list")
        t = lambda **q: [p["title"] for p in self.client.get(url, q).json()["results"]]
        self.assertEqual(t(city="pun"), ["Cheap flat"])
        self.assertEqual(t(property_type="villa"), ["Big villa"])
        self.assertEqual(t(listing_type="rent"), ["Big villa"])
        self.assertEqual(t(max_price="5000000"), ["Cheap flat"])
        self.assertEqual(t(min_price="5000000"), ["Big villa"])
        self.assertEqual(t(bhk="4"), ["Big villa"])
        self.assertEqual(t(bhk="2"), ["Cheap flat"])
        self.assertEqual(t(q="villa"), ["Big villa"])
        self.assertEqual(len(t(property_type="bogus", min_price="abc")), 2)  # bad input ignored

    def test_related_properties(self):
        base = make_property(self.ok, title="Base", city="Pune", property_type="flat")
        both = make_property(self.ok, title="Both", city="Pune", property_type="flat")
        city_only = make_property(self.ok, title="City", city="Pune", property_type="villa")
        type_only = make_property(self.ok, title="Type", city="Delhi", property_type="flat")
        make_property(self.ok, title="Unrelated", city="Delhi", property_type="villa")
        make_property(self.pending, title="Hidden", city="Pune", property_type="flat")
        data = self.client.get(reverse("users:property_detail", args=[base.id])).json()
        titles = [p["title"] for p in data["related"]]
        self.assertEqual(titles[0], "Both")
        self.assertEqual(set(titles), {"Both", "City", "Type"})
        self.assertNotIn("Base", titles)

    def test_options(self):
        data = self.client.get(reverse("users:options")).json()
        self.assertEqual(len(data["amenities"]), 30)
        self.assertEqual(len(data["property_type"]), 10)
