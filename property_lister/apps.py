from django.apps import AppConfig


class PropertyListerConfig(AppConfig):
    name = "property_lister"

    def ready(self):
        from . import signals  # noqa: F401
