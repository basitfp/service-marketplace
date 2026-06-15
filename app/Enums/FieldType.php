<?php

namespace App\Enums;

enum FieldType: string
{
    case Text = 'text';
    case Textarea = 'textarea';
    case Number = 'number';
    case Decimal = 'decimal';
    case Email = 'email';
    case Phone = 'phone';
    case Date = 'date';
    case Dropdown = 'dropdown';
    case MultiSelect = 'multi_select';
    case RadioGroup = 'radio_group';
    case CheckboxGroup = 'checkbox_group';
    case Switch = 'switch';
    case ImageUpload = 'image_upload';
    case FileUpload = 'file_upload';
    case Url = 'url';
    case Tags = 'tags';
}
