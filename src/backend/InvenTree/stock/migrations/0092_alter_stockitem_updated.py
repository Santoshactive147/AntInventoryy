# Generated by Django 3.2.16 on 2023-01-15 14:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0091_alter_stockitem_delete_on_deplete'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stockitem',
            name='updated',
            field=models.DateTimeField(auto_now=True, help_text='Timestamp of last update', null=True, verbose_name='Updated'),
        ),
    ]
