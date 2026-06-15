import React from 'react';
import { Form, Input, InputNumber, Select, Radio, Checkbox, Switch, Upload, DatePicker, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export default function DynamicFieldRenderer({ fields, prefix }) {
    if (!fields || !fields.length) return null;

    const renderInput = (field) => {
        const { field_type, options, placeholder, min_value, max_value, allowed_extensions } = field;

        switch (field_type) {
            case 'text':
                return <Input placeholder={placeholder} />;
            case 'textarea':
                return <Input.TextArea rows={4} placeholder={placeholder} />;
            case 'number':
                return <InputNumber 
                    precision={0} 
                    min={min_value ? Number(min_value) : undefined} 
                    max={max_value ? Number(max_value) : undefined} 
                    style={{width:'100%'}} 
                    placeholder={placeholder} 
                />;
            case 'decimal':
                return <InputNumber 
                    precision={2} 
                    step={0.01} 
                    min={min_value ? Number(min_value) : undefined} 
                    max={max_value ? Number(max_value) : undefined} 
                    style={{width:'100%'}} 
                    placeholder={placeholder} 
                />;
            case 'email':
                return <Input type="email" placeholder={placeholder} />;
            case 'phone':
                return <Input type="tel" placeholder={placeholder} />;
            case 'date':
                return <DatePicker style={{width:'100%'}} placeholder={placeholder} />;
            case 'dropdown':
                return <Select options={options} placeholder={placeholder} />;
            case 'multi_select':
                return <Select mode="multiple" options={options} placeholder={placeholder} />;
            case 'radio_group':
                return <Radio.Group options={options} />;
            case 'checkbox_group':
                return <Checkbox.Group options={options} />;
            case 'switch':
                return <Switch />;
            case 'image_upload':
                return (
                    <Upload 
                        accept="image/*" 
                        listType="picture-card" 
                        maxCount={1}
                        beforeUpload={() => false}
                    >
                        <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    </Upload>
                );
            case 'file_upload': {
                const acceptStr = allowed_extensions 
                    ? allowed_extensions.split(',').map(e => e.trim().startsWith('.') ? e.trim() : '.' + e.trim()).join(',')
                    : undefined;
                return (
                    <Upload 
                        accept={acceptStr}
                        beforeUpload={() => false}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>Select File</Button>
                    </Upload>
                );
            }
            case 'url':
                return <Input type="url" placeholder={placeholder} />;
            case 'tags':
                return <Select mode="tags" placeholder={placeholder} />;
            default:
                return <Input placeholder={placeholder} />;
        }
    };

    return (
        <>
            {fields.map(field => {
                const namePath = prefix ? [prefix, field.field_key] : field.field_key;
                
                const rules = [];
                if (field.is_required) {
                    rules.push({ required: true, message: `${field.label} is required` });
                }
                if (field.min_length) {
                    rules.push({ min: field.min_length, message: `Minimum length is ${field.min_length}` });
                }
                if (field.max_length) {
                    rules.push({ max: field.max_length, message: `Maximum length is ${field.max_length}` });
                }
                if (field.field_type === 'email') {
                    rules.push({ type: 'email', message: 'Please enter a valid email address' });
                }
                if (field.field_type === 'url') {
                    rules.push({ type: 'url', message: 'Please enter a valid URL' });
                }

                const formItemProps = {
                    key: field.id,
                    name: namePath,
                    label: field.label,
                    extra: field.help_text,
                    rules: rules,
                    initialValue: field.default_value || undefined,
                };

                if (field.field_type === 'switch') {
                    formItemProps.valuePropName = 'checked';
                    formItemProps.initialValue = field.default_value === 'true' || field.default_value === '1';
                }

                if (field.field_type === 'image_upload' || field.field_type === 'file_upload') {
                    formItemProps.valuePropName = 'fileList';
                    formItemProps.getValueFromEvent = (e) => {
                        if (Array.isArray(e)) return e;
                        return e?.fileList;
                    };
                }

                return (
                    <Form.Item {...formItemProps}>
                        {renderInput(field)}
                    </Form.Item>
                );
            })}
        </>
    );
}
