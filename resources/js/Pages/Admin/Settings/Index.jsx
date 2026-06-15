import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button, Form, Input, InputNumber, Switch, Upload, message, Divider, Card, Tabs, Space, Typography } from 'antd';
import { UploadOutlined, SaveOutlined, SettingOutlined, BuildOutlined, NotificationOutlined, DollarOutlined, CreditCardOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';

const { Title } = Typography;

export default function SettingsIndex({ settings }) {
    const { auth } = usePage().props;
    const [form] = Form.useForm();
    const { data, setData, post, processing, errors } = useForm({
        platform_name: settings?.platform_name || '',
        support_email: settings?.support_email || '',
        currency_symbol: settings?.currency_symbol || '$',
        logo: null,
        favicon: null,
        
        auto_assign_worker: settings?.auto_assign_worker === '1',
        max_active_orders_per_worker: parseInt(settings?.max_active_orders_per_worker || '3'),
        
        notify_worker_on_new_order: settings?.notify_worker_on_new_order !== '0',
        notify_client_on_order_accepted: settings?.notify_client_on_order_accepted !== '0',
        notify_client_on_order_completed: settings?.notify_client_on_order_completed !== '0',
        enable_in_app_notifications: settings?.enable_in_app_notifications !== '0',
        
        min_credit_purchase: parseInt(settings?.min_credit_purchase || '10'),
        max_file_upload_size_mb: parseInt(settings?.max_file_upload_size_mb || '20'),
        allowed_file_types: settings?.allowed_file_types || 'jpg,jpeg,png,pdf,zip',
        
        stripe_public_key: settings?.stripe_public_key || '',
        stripe_secret_key: settings?.stripe_secret_key || '',
        stripe_webhook_secret: settings?.stripe_webhook_secret || '',
    });

    const onFinish = () => {
        post(route('admin.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                message.success('Settings updated successfully');
            },
            onError: () => {
                message.error('Failed to update settings');
            }
        });
    };

    const handleValuesChange = (changedValues, allValues) => {
        // Exclude logo and favicon from being updated here, they use custom upload
        const updates = { ...allValues };
        delete updates.logo;
        delete updates.favicon;
        
        Object.keys(updates).forEach(key => {
            setData(key, updates[key]);
        });
    };

    const uploadProps = (name) => ({
        beforeUpload: (file) => {
            setData(name, file);
            return false; // Prevent auto upload
        },
        onRemove: () => {
            setData(name, null);
        },
        maxCount: 1,
    });

    const items = [
        {
            key: '1',
            label: <span><SettingOutlined /> General</span>,
            children: (
                <div className="max-w-2xl">
                    <Form.Item label="Platform Name" name="platform_name" validateStatus={errors.platform_name ? 'error' : ''} help={errors.platform_name}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Support Email" name="support_email" validateStatus={errors.support_email ? 'error' : ''} help={errors.support_email}>
                        <Input type="email" />
                    </Form.Item>
                    <Form.Item label="Currency Symbol" name="currency_symbol" validateStatus={errors.currency_symbol ? 'error' : ''} help={errors.currency_symbol}>
                        <Input className="w-32" />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item label="Logo">
                            <Upload {...uploadProps('logo')} listType="picture">
                                <Button icon={<UploadOutlined />}>Upload Logo</Button>
                            </Upload>
                            {settings?.logo && !data.logo && (
                                <div className="mt-2"><img src={settings.logo} alt="Logo" className="h-10 object-contain" /></div>
                            )}
                        </Form.Item>
                        <Form.Item label="Favicon">
                            <Upload {...uploadProps('favicon')} listType="picture">
                                <Button icon={<UploadOutlined />}>Upload Favicon</Button>
                            </Upload>
                            {settings?.favicon && !data.favicon && (
                                <div className="mt-2"><img src={settings.favicon} alt="Favicon" className="h-8 w-8 object-contain" /></div>
                            )}
                        </Form.Item>
                    </div>
                </div>
            )
        },
        {
            key: '2',
            label: <span><BuildOutlined /> Orders</span>,
            children: (
                <div className="max-w-2xl">
                    <Form.Item label="Auto Assign Worker" name="auto_assign_worker" valuePropName="checked" tooltip="Automatically assign an eligible worker when a new order is placed">
                        <Switch />
                    </Form.Item>
                    <Form.Item label="Max Active Orders per Worker" name="max_active_orders_per_worker">
                        <InputNumber min={1} max={20} />
                    </Form.Item>
                </div>
            )
        },
        {
            key: '3',
            label: <span><NotificationOutlined /> Notifications</span>,
            children: (
                <div className="max-w-2xl">
                    <Form.Item label="Notify Worker on New Order" name="notify_worker_on_new_order" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item label="Notify Client on Order Accepted" name="notify_client_on_order_accepted" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item label="Notify Client on Order Completed" name="notify_client_on_order_completed" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Divider />
                    <Form.Item label="Enable In-App Notifications" name="enable_in_app_notifications" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </div>
            )
        },
        {
            key: '4',
            label: <span><DollarOutlined /> Uploads & Limits</span>,
            children: (
                <div className="max-w-2xl">
                    <Form.Item label="Minimum Credit Purchase" name="min_credit_purchase">
                        <InputNumber min={1} />
                    </Form.Item>
                    <Form.Item label="Max File Upload Size (MB)" name="max_file_upload_size_mb">
                        <InputNumber min={1} max={100} />
                    </Form.Item>
                    <Form.Item label="Allowed File Types" name="allowed_file_types" tooltip="Comma separated, e.g. jpg,png,pdf,zip">
                        <Input />
                    </Form.Item>
                </div>
            )
        },
        {
            key: '5',
            label: <span><CreditCardOutlined /> Stripe</span>,
            children: (
                <div className="max-w-2xl">
                    <Alert message="These keys are used for processing real credit card transactions." type="info" showIcon className="mb-6" />
                    <Form.Item label="Stripe Public Key" name="stripe_public_key">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Stripe Secret Key" name="stripe_secret_key">
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="Stripe Webhook Secret" name="stripe_webhook_secret">
                        <Input.Password />
                    </Form.Item>
                </div>
            )
        }
    ];

    return (
        <>
            <Head title="Platform Settings" />
            
            <PageHeader
                title="Platform Settings"
                subtitle="Manage your platform's global configuration"
                actions={[
                    <Button key="save" type="primary" icon={<SaveOutlined />} loading={processing} onClick={() => form.submit()}>
                        Save Settings
                    </Button>
                ]}
            />

            <Card bordered={false} className="shadow-sm rounded-xl border border-gray-100">
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={data}
                    onValuesChange={handleValuesChange}
                    onFinish={onFinish}
                >
                    <Tabs defaultActiveKey="1" items={items} tabPosition="left" />
                </Form>
            </Card>
        </>
    );
}

// Ensure an import for Alert exists if used
import { Alert } from 'antd';

SettingsIndex.layout = page => <AdminLayout breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Settings' }
            ]}>{page}</AdminLayout>;
