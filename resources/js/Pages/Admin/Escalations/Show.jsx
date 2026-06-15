import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, Tag, Typography, Card, Form, Input, Alert } from 'antd';
import { ArrowLeftOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EscalationsShow({ escalation }) {
    const isResolved = escalation.status === 'resolved';

    const { data, setData, post, processing, errors } = useForm({
        resolution_notes: '',
    });

    const handleResolve = () => {
        post(route('admin.escalations.resolve', escalation.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Escalation #${escalation.id}`} />
            
            <PageHeader
                title={`Escalation Details`}
                actions={[
                    <Link key="back" href={route('admin.escalations.index')}>
                        <Button icon={<ArrowLeftOutlined />}>Back to List</Button>
                    </Link>
                ]}
            />

            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                    <Card bordered={false} className="shadow-sm rounded-xl border border-gray-100" title="Order Information">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between">
                                <Text type="secondary">Order #</Text>
                                <Link href={route('admin.orders.show', escalation.order_id)} className="font-semibold text-blue-600">
                                    {escalation.order_id}
                                </Link>
                            </div>
                            <div className="flex justify-between">
                                <Text type="secondary">Service</Text>
                                <Text className="font-medium">{escalation.order?.service?.name}</Text>
                            </div>
                            <div className="flex justify-between">
                                <Text type="secondary">Category</Text>
                                <Tag>{escalation.order?.service?.category?.name}</Tag>
                            </div>
                        </div>
                    </Card>

                    <Card bordered={false} className="shadow-sm rounded-xl border border-gray-100" title="Users">
                        <div className="mb-4">
                            <Text type="secondary" className="block text-xs uppercase mb-1">Client</Text>
                            <div className="font-medium text-gray-900">{escalation.client?.name}</div>
                            <div className="text-sm text-gray-500">{escalation.client?.email}</div>
                            <div className="text-sm text-gray-500">{escalation.client?.phone}</div>
                        </div>
                        <div>
                            <Text type="secondary" className="block text-xs uppercase mb-1">Worker</Text>
                            {escalation.order?.worker ? (
                                <>
                                    <div className="font-medium text-gray-900">{escalation.order.worker.name}</div>
                                    <div className="text-sm text-gray-500">{escalation.order.worker.email}</div>
                                </>
                            ) : (
                                <Text type="secondary">Unassigned</Text>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
                    <Card bordered={false} className="shadow-sm rounded-xl border border-gray-100 h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <Title level={4} className="flex items-center gap-2 m-0">
                                    <WarningOutlined className={isResolved ? "text-gray-400" : "text-orange-500"} />
                                    Client Message
                                </Title>
                                <Text type="secondary" className="text-xs">
                                    Opened on {dayjs(escalation.created_at).format('MMMM D, YYYY [at] h:mm A')}
                                </Text>
                            </div>
                            <Tag color={isResolved ? 'green' : 'orange'} className="uppercase m-0 text-sm px-3 py-1">
                                {escalation.status}
                            </Tag>
                        </div>
                        
                        <div className="bg-orange-50 text-orange-900 p-4 rounded-lg border border-orange-100 mb-8 whitespace-pre-wrap">
                            {escalation.message}
                        </div>

                        <Title level={5} className="mb-4 border-b pb-2">Resolution</Title>
                        
                        {isResolved ? (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                                    <CheckCircleOutlined /> Resolved on {dayjs(escalation.resolved_at).format('MMM D, YYYY [at] h:mm A')}
                                </div>
                                <div className="whitespace-pre-wrap text-gray-700">
                                    {escalation.resolution_notes}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <Alert 
                                    message="Resolve this escalation" 
                                    description="Enter the resolution details below. This will mark the escalation as resolved and notify the client."
                                    type="info" 
                                    showIcon 
                                    className="mb-4"
                                />
                                
                                <Form layout="vertical">
                                    <Form.Item 
                                        label="Resolution Notes" 
                                        validateStatus={errors.resolution_notes ? 'error' : ''}
                                        help={errors.resolution_notes}
                                        required
                                    >
                                        <TextArea 
                                            rows={5} 
                                            placeholder="Explain how this issue was resolved..."
                                            value={data.resolution_notes}
                                            onChange={e => setData('resolution_notes', e.target.value)}
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item className="mb-0">
                                        <Button 
                                            type="primary" 
                                            onClick={handleResolve}
                                            loading={processing}
                                            disabled={!data.resolution_notes.trim()}
                                            icon={<CheckCircleOutlined />}
                                        >
                                            Mark as Resolved
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}

EscalationsShow.layout = page => <AdminLayout breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Escalations', href: route('admin.escalations.index') },
                { title: `Escalation #${escalation.id}` }
            ]}>{page}</AdminLayout>;
