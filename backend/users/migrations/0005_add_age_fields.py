from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_add_stock_subsidy_disease_notifications'),
    ]

    operations = [
        migrations.AddField(
            model_name='farmer',
            name='age',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='appuser',
            name='age',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='worker',
            name='age',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
    ]
