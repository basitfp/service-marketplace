import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Form, Input, InputNumber, Select, Switch, Upload, Button, Divider, Skeleton, Card } from 'antd';
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import useDynamicFields from '@/Components/DynamicFields/useDynamicFields';
import DynamicFieldRenderer from '@/Components/DynamicFields/DynamicFieldRenderer';

export default function ServiceForm({ service, categories, workers = [], existingFieldValues = {} }) {
    const isEdit = !!service;
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    
    const categoryId = Form.useWatch('category_id', form);
    const { fields, loading } = useDynamicFields(categoryId);

    useEffect(() => {
        if (service) {
            let imageList = [];
            if (service.image) {
                imageList = [{
                    uid: '-1',
                    name: 'Cover Image',
                    status: 'done',
                    url: `/storage/${service.image}`
                }];
            }
            form.setFieldsValue({
                ...service,
                image: imageList,
                is_active: Boolean(service.is_active),
                is_featured: Boolean(service.is_featured),
                is_deliverable: Boolean(service.is_deliverable),
                dynamic_fields: existingFieldValues,
                worker_ids: service.eligible_workers ? service.eligible_workers.map(w => w.id) : []
            });
        } else {
            form.setFieldsValue({
                is_active: true,
                is_featured: false,
                is_deliverable: true,
                revisions: 1,
                extra_revision_cost: 0,
                credit_cost: 10,
                delivery_days: 1,
            });
        }
    }, [service, existingFieldValues, form]);

    const handleNameChange = (e) => {
        if (!isEdit) {
            const val = e.target.value;
            const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            form.setFieldValue('slug', slug);
        }
    };

    const onFinish = (values) => {
        setSubmitting(true);
        
        if (values.image) {
            if (Array.isArray(values.image) && values.image[0]?.originFileObj) {
                values.image = values.image[0].originFileObj;
            } else if (Array.isArray(values.image) && values.image.length === 0) {
                values.image = null;
            } else {
                delete values.image;
            }
        }

        if (values.dynamic_fields) {
            Object.keys(values.dynamic_fields).forEach(key => {
                const val = values.dynamic_fields[key];
                if (val && Array.isArray(val)) {
                    if (val[0]?.originFileObj) {
                        values.dynamic_fields[key] = val[0].originFileObj;
                    } else if (val[0]?.originalPath) {
                        values.dynamic_fields[key] = val[0].originalPath;
                    } else if (val.length === 0) {
                        values.dynamic_fields[key] = null;
                    }
                }
            });
        }

        const options = {
            onSuccess: () => setSubmitting(false),
            onError: (errors) => {
                setSubmitting(false);
                const formattedErrors = Object.keys(errors).map(key => ({
                    name: key.split('.'),
                    errors: [errors[key]]
                }));
                form.setFields(formattedErrors);
            }
        };

        if (isEdit) {
            router.post(route('admin.services.update', service.id), {
                _method: 'PUT',
                ...values
            }, options);
        } else {
            router.post(route('admin.services.store'), values, options);
        }
    };

    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Service' : 'New Service'} />

            <PageHeader 
                title={isEdit ? `Edit: ${service.name}` : 'Create New Service'}
                onBack={() => router.get(route('admin.services.index'))}
                actions={isEdit ? [
                    <Button 
                        key="steps" 
                        onClick={() => router.get(route('admin.services.steps.index', service.id))}
                    >
                        Manage Workflow Steps
                    </Button>
                ] : []}
            />

            <div className="pb-12 w-full">
                <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                    <Form 
                        form={form} 
                        layout="vertical" 
                        onFinish={onFinish}
                        scrollToFirstError
                        size="large"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <Form.Item label="Category" name="category_id" rules={[{ required: true }]}>
                                <Select 
                                    options={categories.map(c => ({ label: c.name, value: c.id }))} 
                                    placeholder="Select a category" 
                                    showSearch
                                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>

                            <Form.Item label="Service Name" name="name" rules={[{ required: true }]}>
                                <Input onChange={handleNameChange} placeholder="e.g. Logo Design" />
                            </Form.Item>

                            <Form.Item label="Slug URL" name="slug">
                                <Input placeholder="e.g. logo-design" />
                            </Form.Item>

                            <Form.Item label="Credit Cost" name="credit_cost" rules={[{ required: true }]}>
                                <InputNumber min={1} className="w-full" prefix="C" />
                            </Form.Item>

                            <Form.Item label="Delivery Days" name="delivery_days" rules={[{ required: true }]}>
                                <InputNumber min={1} className="w-full" suffix="Days" />
                            </Form.Item>

                            <Form.Item label="Included Revisions" name="revisions" rules={[{ required: true }]}>
                                <InputNumber min={0} className="w-full" />
                            </Form.Item>

                            <Form.Item label="Extra Revision Cost" name="extra_revision_cost" rules={[{ required: true }]}>
                                <InputNumber min={0} className="w-full" prefix="C" />
                            </Form.Item>
                        </div>

                        <Form.Item label="Short Description (Max 500 chars)" name="short_description" rules={[{ max: 500 }]}>
                            <Input.TextArea rows={2} placeholder="Brief summary of the service" showCount maxLength={500} />
                        </Form.Item>

                        <Form.Item label="Full Description" name="description">
                            <Input.TextArea rows={6} placeholder="Detailed description of what the buyer gets..." />
                        </Form.Item>

                        <Form.Item label="Service Image" name="image" valuePropName="fileList" getValueFromEvent={normFile}>
                            <Upload name="image" listType="picture-card" maxCount={1} beforeUpload={() => false}>
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Upload Cover</div>
                                </div>
                            </Upload>
                        </Form.Item>

                        <div className="flex gap-10 mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                            <Form.Item label="Active" name="is_active" valuePropName="checked" className="mb-0">
                                <Switch />
                            </Form.Item>
                            <Form.Item label="Featured" name="is_featured" valuePropName="checked" className="mb-0">
                                <Switch />
                            </Form.Item>
                            <Form.Item label="Digital Delivery?" name="is_deliverable" valuePropName="checked" className="mb-0">
                                <Switch />
                            </Form.Item>
                        </div>

                        <Divider titlePlacement="left" className="!text-lg font-medium !text-indigo-900 border-indigo-200">
                            Fulfillment & Eligibility
                        </Divider>
                        <Form.Item 
                            label="Eligible Workers" 
                            name="worker_ids" 
                            help="Select which workers are authorized to fulfill orders for this service. If empty, no workers can be assigned."
                        >
                            <Select 
                                mode="multiple"
                                options={workers.map(w => ({ label: w.name, value: w.id }))}
                                placeholder="Search and assign workers..."
                                showSearch
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                maxTagCount="responsive"
                            />
                        </Form.Item>

                        {categoryId && (
                            <div className="mt-8 mb-8 w-full">
                                <Divider titlePlacement="left" className="!text-lg font-medium !text-indigo-900 border-indigo-200">
                                    Category-Specific Details
                                </Divider>
                                

                                
                                {loading ? (
                                    <Skeleton active paragraph={{ rows: 4 }} />
                                ) : (
                                    <div className="bg-indigo-50/40 p-8 rounded-xl border border-indigo-100">
                                        {fields.length > 0 ? (
                                            <DynamicFieldRenderer fields={fields} prefix="dynamic_fields" />
                                        ) : (
                                            <div className="text-gray-500 text-center py-4">No custom fields configured for this category.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <Divider />

                        <div className="flex justify-end gap-3 pt-2">
                            <Button onClick={() => router.get(route('admin.services.index'))} icon={<ArrowLeftOutlined />} size="large">
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />} size="large">
                                Save Service
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </>
    );
}

export const __serviceFormLayout__ = null;

ServiceForm.layout = page => <AdminLayout breadcrumbs={[ 
            { title: 'Dashboard', href: route('admin.dashboard') },
            { title: 'Services', href: route('admin.services.index') },
            { title: 'Service Form' }
        ]}>{page}</AdminLayout>;
