import mimetypes
from urllib.parse import quote

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible

from .models import StoredFile


@deconstructible
class DatabaseStorage(Storage):
    """Stores uploaded files as rows in StoredFile (see the model docstring)."""

    def _save(self, name, content):
        content.seek(0)
        data = content.read()
        content_type = (
            getattr(content, "content_type", None)
            or mimetypes.guess_type(name)[0]
            or "application/octet-stream"
        )
        StoredFile.objects.update_or_create(
            name=name, defaults={"content": data, "content_type": content_type}
        )
        return name

    def _open(self, name, mode="rb"):
        try:
            row = StoredFile.objects.get(name=name)
        except StoredFile.DoesNotExist:
            raise FileNotFoundError(name)
        return ContentFile(bytes(row.content), name=name)

    def exists(self, name):
        return StoredFile.objects.filter(name=name).exists()

    def delete(self, name):
        StoredFile.objects.filter(name=name).delete()

    def size(self, name):
        return len(self._open(name).read())

    def url(self, name):
        return settings.MEDIA_URL + quote(name)
