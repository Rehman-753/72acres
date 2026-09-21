from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import ListerProfile


@receiver(post_save, sender=User)
def create_lister_profile(sender, instance, created, **kwargs):
    """Every account the admin creates becomes a PENDING lister.
    Superusers are platform admins, not listers."""
    if created and not instance.is_superuser:
        ListerProfile.objects.get_or_create(user=instance)
