import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Avatar,
    Button,
    Card,
    Collapse,
    Descriptions,
    Empty,
    Form,
    Input,
    List,
    Modal,
    Select,
    Space,
    Tabs,
    Tag,
    Timeline,
    Typography,
} from 'antd';
import {
    CheckCircleOutlined,
    DownloadOutlined,
    FileTextOutlined,
    MessageOutlined,
    StopOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import StatusBadge from '@/Components/Common/StatusBadge';
import { BentoGrid, BentoCell } from '@/Components/Common/BentoGrid';

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

const normalizeStatus = (status) => {
    if (!status) return '';
    return typeof status === 'string' ? status : status.value;
};

const formatDate = (value, fallback = '-') => value ? dayjs(value).format('MMM D, YYYY h:mm A') : fallback;

const deliveryDeadline = (order) => {
    if (!order.created_at || !order.service?.delivery_days) return '-';
    return dayjs(order.created_at).add(order.service.delivery_days, 'day').format('MMM D, YYYY');
};

const cardClass = 'shadow-sm border-gray-100 rounded-lg h-full';

export default function Show({
    order,
    eligibleWorkers = [],
    clientTotalOrdersCount = 0,
    workerActiveOrdersCount = 0,
    timeline = [],
}) {
    const [assignForm] = Form.useForm();
    const [cancelForm] = Form.useForm();
    const [assignOpen, setAssignOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const status = normalizeStatus(order.status);
    const canAssign = !['completed', 'cancelled'].includes(status);
    const referenceAssets = (order.assets || []).filter((asset) => asset.type === 'reference');
    const deliverableAssets = (order.assets || []).filter((asset) => asset.type === 'deliverable');
    const commentAssets = (order.assets || []).filter((asset) => asset.type === 'comment');
    const escalations = order.escalations || [];

    const assignWorkerOptions = eligibleWorkers.map((worker) => ({
        label: `${worker.name} (${worker.active_orders_count || 0} active orders)`,
        value: worker.id,
    }));

    const openAssignModal = () => {
        assignForm.setFieldsValue({ worker_id: order.worker_id || undefined });
        setAssignOpen(true);
    };

    const submitAssign = () => {
        assignForm.validateFields().then((values) => {
            setAssigning(true);
            router.post(route('admin.orders.assign', order.id), values, {
                preserveScroll: true,
                onFinish: () => setAssigning(false),
                onSuccess: () => setAssignOpen(false),
            });
        });
    };

    const submitCancel = () => {
        cancelForm.validateFields().then((values) => {
            setCancelling(true);
            router.post(route('admin.orders.cancel', order.id), values, {
                preserveScroll: true,
                onFinish: () => setCancelling(false),
                onSuccess: () => setCancelOpen(false),
            });
        });
    };

    const assetList = (assets) => (
        <List
            dataSource={assets}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No files yet" /> }}
            renderItem={(asset) => (
                <List.Item
                    actions={[
                        <a key="download" href={`/storage/${asset.file_path}`} target="_blank" rel="noreferrer">
                            <Button type="text" icon={<DownloadOutlined />}>Download</Button>
                        </a>,
                    ]}
                >
                    <List.Item.Meta
                        avatar={<FileTextOutlined className="text-xl text-blue-500 mt-1" />}
                        title={asset.original_name}
                        description={
                            <Space size="small" wrap>
                                <Text type="secondary">{asset.mime_type || 'Unknown type'}</Text>
                                <Text type="secondary">Size unavailable</Text>
                                <Text type="secondary">{formatDate(asset.created_at)}</Text>
                            </Space>
                        }
                    />
                </List.Item>
            )}
        />
    );

    const revisionItems = useMemo(() => (order.revisions || []).map((revision) => ({
        key: String(revision.id),
        label: (
            <div className="flex items-center justify-between gap-3">
                <span>Revision #{revision.id}</span>
                <Space>
                    <StatusBadge status={revision.status} />
                    <Text type="secondary" className="text-xs">{formatDate(revision.created_at)}</Text>
                </Space>
            </div>
        ),
        children: <Paragraph className="m-0 text-gray-700">{revision.message}</Paragraph>,
    })), [order.revisions]);

    const timelineItems = timeline.map((item) => ({
        color: item.status === 'cancelled' ? 'red' : item.status === 'completed' ? 'green' : 'blue',
        children: (
            <div>
                <div className="font-medium text-gray-800">{item.label}</div>
                <div className="text-xs text-gray-500">{formatDate(item.timestamp)}</div>
            </div>
        ),
    }));

    return (
        <>
            <Head title={`Order #${order.id}`} />

            <PageHeader
                title={`Order #${order.id}`}
                breadcrumbs={[
                    { label: 'Admin', href: route('admin.dashboard') },
                    { label: 'Orders', href: route('admin.orders.index') },
                    { label: `#${order.id}` },
                ]}
                actions={[
                    status !== 'cancelled' && status !== 'completed' ? (
                        <Button key="cancel" danger icon={<StopOutlined />} onClick={() => setCancelOpen(true)}>
                            Cancel Order
                        </Button>
                    ) : null,
                ].filter(Boolean)}
            />

            <BentoGrid cols={12} gap={6}>
                <BentoCell span={4}>
                    <Card title="Order Info" className={cardClass}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Status"><StatusBadge status={status} /></Descriptions.Item>
                            <Descriptions.Item label="Credits"><span className="font-semibold text-emerald-600">{order.credits_used} C</span></Descriptions.Item>
                            <Descriptions.Item label="Date placed">{formatDate(order.created_at)}</Descriptions.Item>
                            <Descriptions.Item label="Delivery deadline">{deliveryDeadline(order)}</Descriptions.Item>
                        </Descriptions>
                        <div className="mt-4">
                            <Text strong>Notes from client</Text>
                            <Paragraph className="mt-2 mb-0 text-gray-600">{order.notes || <Text type="secondary">No notes provided.</Text>}</Paragraph>
                        </div>
                        {order.cancellation_reason && (
                            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3">
                                <Text strong type="danger">Cancellation reason</Text>
                                <Paragraph className="mt-2 mb-0 text-red-700">{order.cancellation_reason}</Paragraph>
                            </div>
                        )}
                    </Card>
                </BentoCell>

                <BentoCell span={4}>
                    <Card title="Client Info" className={cardClass}>
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar size={48} src={order.client?.profile_photo ? `/storage/${order.client.profile_photo}` : null}>
                                {order.client?.name?.charAt(0) || 'C'}
                            </Avatar>
                            <div>
                                <div className="font-semibold text-gray-900">{order.client?.name || 'Unknown client'}</div>
                                <div className="text-sm text-gray-500">{order.client?.email || '-'}</div>
                            </div>
                        </div>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Phone">{order.client?.phone || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Total orders">{clientTotalOrdersCount}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </BentoCell>

                <BentoCell span={4}>
                    <Card
                        title="Worker Info"
                        className={cardClass}
                        extra={canAssign && (
                            <Button size="small" icon={<TeamOutlined />} onClick={openAssignModal}>
                                {order.worker ? 'Reassign' : 'Assign Worker'}
                            </Button>
                        )}
                    >
                        {order.worker ? (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar size={48} src={order.worker.profile_photo ? `/storage/${order.worker.profile_photo}` : null}>
                                        {order.worker.name?.charAt(0)}
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-gray-900">{order.worker.name}</div>
                                        <div className="text-sm text-gray-500">{order.worker.email}</div>
                                    </div>
                                </div>
                                <Paragraph className="text-gray-600">
                                    {order.worker.worker_profile?.bio || <Text type="secondary">No bio provided.</Text>}
                                </Paragraph>
                                <Tag color="blue" className="m-0">{workerActiveOrdersCount} active orders</Tag>
                            </>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Not Assigned"
                            >
                                {canAssign && <Button type="primary" icon={<TeamOutlined />} onClick={openAssignModal}>Assign Worker</Button>}
                            </Empty>
                        )}
                    </Card>
                </BentoCell>

                <BentoCell span={8}>
                    <Card title="Service + Dynamic Fields" className={cardClass}>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Title level={5} className="m-0">{order.service?.name || 'Unknown service'}</Title>
                            {order.service?.category?.name && <Tag color="cyan">{order.service.category.name}</Tag>}
                            <Tag color="green">{order.service?.credit_cost || 0} C</Tag>
                        </div>

                        <div className="mb-5">
                            <Text strong>Step selections</Text>
                            <List
                                className="mt-2"
                                dataSource={order.selections || []}
                                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No step selections" /> }}
                                renderItem={(selection) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={selection.step_name}
                                            description={`${selection.option_label} (${selection.credit_cost || 0} C)`}
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>

                        <div>
                            <Text strong>Dynamic field values</Text>
                            <Descriptions className="mt-2" column={1} bordered size="small">
                                {(order.service?.field_values || []).length ? order.service.field_values.map((fieldValue) => (
                                    <Descriptions.Item
                                        key={fieldValue.id}
                                        label={fieldValue.category_field?.label || fieldValue.category_field?.field_key || 'Field'}
                                    >
                                        {fieldValue.value || <Text type="secondary">Empty</Text>}
                                    </Descriptions.Item>
                                )) : (
                                    <Descriptions.Item label="Fields">
                                        <Text type="secondary">No dynamic field values configured.</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </div>
                    </Card>
                </BentoCell>

                <BentoCell span={4}>
                    <Card title="Order Timeline" className={cardClass}>
                        {timelineItems.length ? (
                            <Timeline items={timelineItems} />
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No timeline entries" />
                        )}
                    </Card>
                </BentoCell>

                <BentoCell span={12}>
                    <Card title="Comments Thread" className={cardClass}>
                        <List
                            dataSource={order.comments || []}
                            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No comments yet" /> }}
                            renderItem={(comment) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={(
                                            <Avatar src={comment.user?.profile_photo ? `/storage/${comment.user.profile_photo}` : null}>
                                                {comment.user?.name?.charAt(0) || 'U'}
                                            </Avatar>
                                        )}
                                        title={(
                                            <Space>
                                                <span>{comment.user?.name || 'Unknown user'}</span>
                                                <Text type="secondary" className="text-xs">{formatDate(comment.created_at)}</Text>
                                            </Space>
                                        )}
                                        description={<Paragraph className="m-0 text-gray-700">{comment.content || <Text type="secondary">Attachment only</Text>}</Paragraph>}
                                    />
                                </List.Item>
                            )}
                        />

                        {commentAssets.length > 0 && (
                            <div className="mt-4 rounded-lg border border-gray-100 p-3">
                                <Text strong>Comment attachments</Text>
                                <div className="mt-2">{assetList(commentAssets)}</div>
                            </div>
                        )}

                        <div className="mt-6 border-t border-gray-100 pt-4">
                            <Form layout="vertical">
                                <Form.Item label="Add Comment">
                                    <TextArea rows={3} placeholder="Comment posting endpoint will be wired in a later phase." disabled />
                                </Form.Item>
                                <Button icon={<MessageOutlined />} disabled>
                                    Post Comment
                                </Button>
                            </Form>
                        </div>
                    </Card>
                </BentoCell>

                <BentoCell span={6}>
                    <Card title="Assets" className={cardClass}>
                        <Tabs
                            items={[
                                {
                                    key: 'reference',
                                    label: `Reference (${referenceAssets.length})`,
                                    children: assetList(referenceAssets),
                                },
                                {
                                    key: 'deliverable',
                                    label: `Deliverable (${deliverableAssets.length})`,
                                    children: assetList(deliverableAssets),
                                },
                            ]}
                        />
                    </Card>
                </BentoCell>

                <BentoCell span={6}>
                    <Card title="Revision History" className={cardClass}>
                        {revisionItems.length ? (
                            <Collapse items={revisionItems} />
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No revisions requested" />
                        )}
                    </Card>
                </BentoCell>

                <BentoCell span={12}>
                    <Card title="Escalations" className={cardClass}>
                        {escalations.length ? (
                            <List
                                dataSource={escalations}
                                renderItem={(escalation) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={(
                                                <Space wrap>
                                                    <span>Escalation #{escalation.id}</span>
                                                    <StatusBadge status={escalation.status} />
                                                    <Text type="secondary" className="text-xs">{formatDate(escalation.created_at)}</Text>
                                                </Space>
                                            )}
                                            description={(
                                                <div>
                                                    <Paragraph className="mb-3 text-gray-700">{escalation.message}</Paragraph>
                                                    {escalation.resolution_notes ? (
                                                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                                                            <Space>
                                                                <CheckCircleOutlined className="text-emerald-600" />
                                                                <Text strong className="text-emerald-700">Resolution</Text>
                                                            </Space>
                                                            <Paragraph className="mt-2 mb-0 text-emerald-700">{escalation.resolution_notes}</Paragraph>
                                                        </div>
                                                    ) : (
                                                        <Form layout="vertical" className="max-w-2xl">
                                                            <Form.Item label="Resolution notes">
                                                                <TextArea rows={3} placeholder="Escalation resolution endpoint will be wired in a later phase." disabled />
                                                            </Form.Item>
                                                            <Button disabled>Resolve Escalation</Button>
                                                        </Form>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No escalations" />
                        )}
                    </Card>
                </BentoCell>
            </BentoGrid>

            <Modal
                title={order.worker ? `Reassign Order #${order.id}` : `Assign Order #${order.id}`}
                open={assignOpen}
                onCancel={() => setAssignOpen(false)}
                onOk={submitAssign}
                confirmLoading={assigning}
                okText={order.worker ? 'Reassign Worker' : 'Assign Worker'}
                destroyOnHidden
            >
                <Form form={assignForm} layout="vertical">
                    <Form.Item
                        label="Eligible worker"
                        name="worker_id"
                        rules={[{ required: true, message: 'Select an eligible worker.' }]}
                    >
                        <Select
                            placeholder={assignWorkerOptions.length ? 'Select worker' : 'No eligible workers available'}
                            options={assignWorkerOptions}
                            disabled={!assignWorkerOptions.length}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={`Cancel Order #${order.id}`}
                open={cancelOpen}
                onCancel={() => setCancelOpen(false)}
                onOk={submitCancel}
                confirmLoading={cancelling}
                okText="Cancel Order"
                okButtonProps={{ danger: true }}
                destroyOnHidden
            >
                <Form form={cancelForm} layout="vertical">
                    <Form.Item
                        label="Cancellation reason"
                        name="reason"
                        rules={[{ required: true, message: 'Enter a cancellation reason.' }]}
                    >
                        <TextArea rows={4} maxLength={2000} showCount />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

Show.layout = page => <AdminLayout breadcrumbs={[
            { label: 'Admin', href: route('admin.dashboard') },
            { label: 'Orders', href: route('admin.orders.index') },
            { label: `#${order.id}` },
        ]}>{page}</AdminLayout>;
