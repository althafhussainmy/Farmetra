import re

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers


USERNAME_RE = re.compile(r"^[A-Za-z0-9_.@+-]{3,150}$")
NAME_RE = re.compile(r"^[A-Za-z][A-Za-z '\-]{0,99}$")
PHONE_RE = re.compile(r"^\+?[0-9][0-9()\-\s]{6,19}$")
PASSWORD_SPECIAL_RE = re.compile(r"[^\w\s]")


def normalize_text(value):
    if value is None:
        return ""
    return str(value).strip()


def validate_required_text(value, field_name, min_length=2, max_length=255):
    cleaned = normalize_text(value)
    if not cleaned:
        raise serializers.ValidationError(f"{field_name} is required.")
    if len(cleaned) < min_length:
        raise serializers.ValidationError(f"{field_name} must be at least {min_length} characters.")
    if len(cleaned) > max_length:
        raise serializers.ValidationError(f"{field_name} must be at most {max_length} characters.")
    return cleaned


def validate_optional_text(value, field_name, max_length=255):
    cleaned = normalize_text(value)
    if not cleaned:
        return ""
    if len(cleaned) > max_length:
        raise serializers.ValidationError(f"{field_name} must be at most {max_length} characters.")
    return cleaned


def validate_username(value, current_user_id=None):
    cleaned = normalize_text(value)
    if not cleaned:
        raise serializers.ValidationError("Username is required.")
    if not USERNAME_RE.fullmatch(cleaned):
        raise serializers.ValidationError(
            "Username must be 3-150 characters and use only letters, numbers, or . _ @ + -"
        )

    qs = User.objects.filter(username__iexact=cleaned)
    if current_user_id is not None:
        qs = qs.exclude(pk=current_user_id)
    if qs.exists():
        raise serializers.ValidationError("A user with this username already exists.")
    return cleaned


def validate_unique_email(value, current_user_id=None):
    cleaned = normalize_text(value).lower()
    if not cleaned:
        raise serializers.ValidationError("Email is required.")
    qs = User.objects.filter(email__iexact=cleaned)
    if current_user_id is not None:
        qs = qs.exclude(pk=current_user_id)
    if qs.exists():
        raise serializers.ValidationError("An account with this email already exists.")
    return cleaned


def validate_name(value, field_name, required=False):
    cleaned = normalize_text(value)
    if not cleaned:
        if required:
            raise serializers.ValidationError(f"{field_name} is required.")
        return ""
    if not NAME_RE.fullmatch(cleaned):
        raise serializers.ValidationError(
            f"{field_name} can contain only letters, spaces, apostrophes, and hyphens."
        )
    return cleaned


def validate_place(value):
    return validate_required_text(value, "Place", min_length=2, max_length=255)


def validate_address(value):
    return validate_required_text(value, "Address", min_length=10, max_length=1000)


def validate_skills(value):
    return validate_required_text(value, "Skills", min_length=2, max_length=500)


def validate_phone(value, field_name="Phone"):
    cleaned = normalize_text(value)
    if not cleaned:
        return ""
    if not PHONE_RE.fullmatch(cleaned):
        raise serializers.ValidationError(
            f"{field_name} must be a valid phone number (digits, spaces, (), -, optional leading +)."
        )
    return cleaned


def validate_alternate_contact(value):
    return validate_optional_text(value, "Alternate contact", max_length=255)


def validate_password_strength(value, user=None):
    password = value or ""
    if len(password) < 8:
        raise serializers.ValidationError("Password must be at least 8 characters.")
    if not re.search(r"[A-Z]", password):
        raise serializers.ValidationError("Password must include at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        raise serializers.ValidationError("Password must include at least one lowercase letter.")
    if not re.search(r"\d", password):
        raise serializers.ValidationError("Password must include at least one number.")
    if not PASSWORD_SPECIAL_RE.search(password):
        raise serializers.ValidationError("Password must include at least one special character.")

    try:
        validate_password(password, user=user)
    except DjangoValidationError as exc:
        raise serializers.ValidationError(list(exc.messages))
    return password
