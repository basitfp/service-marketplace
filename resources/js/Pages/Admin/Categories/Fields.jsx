import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Button, Drawer, Form, Input, Select, Switch, Space, 
    Table, Tag, Typography, InputNumber, Popconfirm, Badge,
    message
} from 'antd';
import { 
    PlusOutlined, EditOutlined, DeleteOutlined, 
    MenuOutlined, MinusCircleOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';

const { Text } = Typography;

const FIELD_TYPES = [
    'text', 'textarea', 'number', 'decimal', 'email', 'phone', 'date',
    'dropdown', 'multi_select', 'radio_group', 'checkbox_group', 'switch',
    'image_upload', 'file_upload', 'url', 'tags'
];

export default function Fields({ category, fields }) {
    const [localFields, setLocalFields] = useState(fields);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    
    const [currentType, setCurrentType] = useState('text');
    const [suggestedType, setSuggestedType] = useState(null);
    const [userSelectedType, setUserSelectedType] = useState(false);

    useEffect(() => {
        setLocalFields(fields);
    }, [fields]);

    const suggestFieldType = (label) => {
        const l = label.toLowerCase();
        if (/(brand|make|manufacturer|company)/.test(l)) return 'dropdown';
        if (/(type|category|class|tier|plan)/.test(l)) return 'radio_group';
        if (/(description|notes|instructions)/.test(l)) return 'textarea';
        if (/(qty|quantity|count|bedrooms|year)/.test(l)) return 'number';
        if (/(price|cost|area|size|weight)/.test(l)) return 'decimal';
        if (/email/.test(l)) return 'email';
        if (/(phone|mobile|whatsapp)/.test(l)) return 'phone';
        if (/(date|dob|expiry)/.test(l)) return 'date';
        if (/(features|formats|amenities)/.test(l)) return 'multi_select';
        if (/(active|enabled|included|urgent)/.test(l)) return 'switch';
        if (/(image|photo|logo)/.test(l)) return 'image_upload';
        if (/(document|file|certificate)/.test(l)) return 'file_upload';
        if (/(url|website|link)/.test(l)) return 'url';
        return 'text';
    };

    const handleLabelChange = (e) => {
        const val = e.target.value;
        const generatedKey = val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)+/g, '');
        
        form.setFieldValue('field_key', generatedKey);

        if (!editingField && !userSelectedType) {
            const suggested = suggestFieldType(val);
            form.setFieldValue('field_type', suggested);
            setCurrentType(suggested);
            setSuggestedType(suggested);
        }
    };

    const handleTypeChange = (val) => {
        setCurrentType(val);
        setUserSelectedType(true);
        setSuggestedType(null);
    };

    const openCreateDrawer = () => {
        setEditingField(null);
        setUserSelectedType(false);
        setSuggestedType(null);
        setCurrentType('text');
        form.resetFields();
        form.setFieldsValue({
            field_type: 'text',
            is_required: false,
            is_visible: true,
            sort_order: localFields.length
        });
        setDrawerOpen(true);
    };

    const openEditDrawer = (field) => {
        setEditingField(field);
        setUserSelectedType(true);
        setSuggestedType(null);
        setCurrentType(field.field_type);
        form.resetFields();
        form.setFieldsValue({
            ...field,
            is_required: Boolean(field.is_required),
            is_visible: Boolean(field.is_visible),
        });
        setDrawerOpen(true);
    };

    const onFinish = (values) => {
        setSubmitting(true);
        
        const options = {
            onSuccess: () => {
                setDrawerOpen(false);
            },
            onError: (errors) => {
                const formattedErrors = Object.keys(errors).map(key => ({
                    name: key.split('.'),
                    errors: [errors[key]]
                }));
                form.setFields(formattedErrors);
            },
            onFinish: () => setSubmitting(false)
        };

        if (editingField) {
            router.put(route('admin.categories.fields.update', { category: category.id, field: editingField.id }), values, options);
        } else {
            router.post(route('admin.categories.fields.store', category.id), values, options);
        }
    };

    const handleDelete = (field) => {
        router.delete(route('admin.categories.fields.destroy', { category: category.id, field: field.id }), {
            preserveScroll: true
        });
    };

    // --- Native Drag and Drop ---
    const onDragStart = (e, index) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('dragIndex', index.toString());
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = Number(e.dataTransfer.getData('dragIndex'));
        if (dragIndex === dropIndex) return;

        const newFields = [...localFields];
        const [draggedItem] = newFields.splice(dragIndex, 1);
        newFields.splice(dropIndex, 0, draggedItem);
        setLocalFields(newFields);

        router.post(route('admin.categories.fields.reorder', category.id), {
            orderedIds: newFields.map(f => f.id)
        }, { preserveScroll: true, preserveState: true });
    };

    const components = {
        body: {
            row: ({ children, 'data-row-key': rowKey, className, index, ...restProps }) => {
                return (
                    <tr
                        {...restProps}
                        className={`${className} cursor-move`}
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, index)}
                    >
                        {children}
                    </tr>
                );
            }
        }
    };

    const columns = [
        {
            title: 'Sort',
            key: 'sort',
            width: 60,
            render: () => <MenuOutlined className="text-gray-400" />
        },
        {
            title: 'Label',
            dataIndex: 'label',
            key: 'label',
            render: (text, record) => (
                <Space>
                    <span className="font-medium">{text}</span>
                    {record.is_required && <Badge status="error" title="Required" />}
                </Space>
            )
        },
        {
            title: 'Key',
            dataIndex: 'field_key',
            key: 'field_key',
            render: (text) => <Text code>{text}</Text>
        },
        {
            title: 'Type',
            dataIndex: 'field_type',
            key: 'field_type',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'is_visible',
            key: 'is_visible',
            render: (visible) => <Tag color={visible ? 'green' : 'default'}>{visible ? 'Visible' : 'Hidden'}</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space onClick={e => e.stopPropagation()}>
                    <Button type="text" icon={<EditOutlined />} onClick={() => openEditDrawer(record)} />
                    <Popconfirm title="Delete this field?" onConfirm={() => handleDelete(record)} okText="Yes" cancelText="No">
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const showOptions = ['dropdown', 'radio_group', 'checkbox_group', 'multi_select'].includes(currentType);
    const showMinMaxVal = ['number', 'decimal'].includes(currentType);
    const showMinMaxLen = ['text', 'textarea'].includes(currentType);
    const showFileRules = ['file_upload', 'image_upload'].includes(currentType);

    return (
        <>
            <Head title={`Fields - ${category.name}`} />

            <PageHeader 
                title={`${category.name} — Manage Custom Fields`}
                actions={[
                    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
                        Add Field
                    </Button>
                ]}
            />

            <div className="bg-white rounded-lg border border-gray-200">
                <Table
                    components={components}
                    rowKey="id"
                    columns={columns}
                    dataSource={localFields}
                    pagination={false}
                    onRow={(record, index) => ({
                        index,
                        'data-row-key': record.id,
                    })}
                />
            </div>

            <Drawer
                title={editingField ? 'Edit Field' : 'New Field'}
                width={520}
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                extra={
                    <Space>
                        <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
                        <Button type="primary" onClick={() => form.submit()} loading={submitting}>
                            {editingField ? 'Update' : 'Create'}
                        </Button>
                    </Space>
                }
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Field Label" name="label" rules={[{ required: true }]}>
                        <Input onChange={handleLabelChange} placeholder="e.g. Property Type" />
                    </Form.Item>

                    <Form.Item label="Field Key (Unique identifier)" name="field_key" rules={[{ required: true }]}>
                        <Input placeholder="e.g. property_type" />
                    </Form.Item>

                    <Form.Item label={
                        <Space>
                            Field Type
                            {suggestedType && <Tag color="blue" icon={<InfoCircleOutlined />}>Auto-suggested</Tag>}
                        </Space>
                    } name="field_type" rules={[{ required: true }]}>
                        <Select showSearch onChange={handleTypeChange}>
                            {FIELD_TYPES.map(type => (
                                <Select.Option key={type} value={type}>{type}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item label="Required?" name="is_required" valuePropName="checked">
                            <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>
                        <Form.Item label="Visible in Forms?" name="is_visible" valuePropName="checked">
                            <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>
                    </div>

                    <Form.Item label="Placeholder Text" name="placeholder">
                        <Input placeholder="Shown inside the input field" />
                    </Form.Item>

                    <Form.Item label="Help Text" name="help_text">
                        <Input.TextArea rows={2} placeholder="Shown below the input field to help the user" />
                    </Form.Item>

                    <Form.Item label="Default Value" name="default_value">
                        <Input placeholder="Optional default value" />
                    </Form.Item>

                    {showOptions && (
                        <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
                            <Typography.Title level={5} className="!mt-0 !mb-4">Options</Typography.Title>
                            <Form.List name="options">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'label']}
                                                    rules={[{ required: true, message: 'Missing label' }]}
                                                >
                                                    <Input placeholder="Label (e.g. Standard)" />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'value']}
                                                    rules={[{ required: true, message: 'Missing value' }]}
                                                >
                                                    <Input placeholder="Value (e.g. standard)" />
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500 cursor-pointer" />
                                            </Space>
                                        ))}
                                        <Form.Item className="mb-0">
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add Option
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </div>
                    )}

                    {showMinMaxVal && (
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item label="Min Value" name="min_value">
                                <InputNumber className="w-full" />
                            </Form.Item>
                            <Form.Item label="Max Value" name="max_value">
                                <InputNumber className="w-full" />
                            </Form.Item>
                        </div>
                    )}

                    {showMinMaxLen && (
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item label="Min Length" name="min_length">
                                <InputNumber min={0} className="w-full" />
                            </Form.Item>
                            <Form.Item label="Max Length" name="max_length">
                                <InputNumber min={0} className="w-full" />
                            </Form.Item>
                        </div>
                    )}

                    {showFileRules && (
                        <>
                            <Form.Item label="Allowed Extensions" name="allowed_extensions">
                                <Input placeholder="e.g. jpg, png, pdf (comma separated)" />
                            </Form.Item>
                            <Form.Item label="Max File Size (MB)" name="max_file_size_mb">
                                <InputNumber min={1} className="w-full" />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item name="sort_order" hidden>
                        <InputNumber />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    );
}

Fields.layout = page => <AdminLayout breadcrumbs={[
            { title: 'Admin', href: route('admin.dashboard') },
            { title: 'Categories', href: route('admin.categories.index') },
            { title: 'Manage Fields' }
        ]}>{page}</AdminLayout>;
