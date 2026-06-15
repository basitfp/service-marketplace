import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Button,
    DatePicker,
    Form,
    Input,
    Modal,
    Select,
    Space,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import {
    EyeOutlined,
    SearchOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import DataTable from '@/Components/Common/DataTable';
import StatusBadge from '@/Components/Common/StatusBadge';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const normalizeStatus = (status) => {
    if (!status) return '';
    return typeof status === 'string' ? status : status.value;
};

const formatDate = (value) => value ? dayjs(value).format('MMM D, YYYY') : '-';

export default function Index({ orders, filters = {}, statuses = [], services = [], categories = [], workers = [] }) {
    const [assignForm] = Form.useForm();
    const [search, setSearch] = useState(filters.search || '');
    const [assigningOrder, setAssigningOrder] = useState(null);
    const [assigning, setAssigning] = useState(false);

    const filterRoute = (nextFilters) => {
        router.get(route('admin.orders.index'), {
            ...filters,
            ...nextFilters,
            page: undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        router.get(route('admin.orders.index'), {}, { preserveState: true, replace: true });
    };

    const openAssignModal = (order) => {
        setAssigningOrder(order);
        assignForm.setFieldsValue({ worker_id: order.worker_id || undefined });
    };

    const closeAssignModal = () => {
        setAssigningOrder(null);
        assignForm.resetFields();
    };

    const submitAssign = () => {
        assignForm.validateFields().then((values) => {
            setAssigning(true);
            router.post(route('admin.orders.assign', assigningOrder.id), values, {
                preserveScroll: true,
                onFinish: () => setAssigning(false),
                onSuccess: closeAssignModal,
            });
        });
    };

    const serviceOptions = useMemo(() => services.map((service) => ({
        label: service.name,
        value: String(service.id),
    })), [services]);

    const categoryOptions = useMemo(() => categories.map((category) => ({
        label: category.name,
        value: String(category.id),
    })), [categories]);

    const workerOptions = useMemo(() => workers.map((worker) => ({
        label: `${worker.name} (${worker.active_orders_count || 0} active)`,
        value: String(worker.id),
    })), [workers]);

    const assignWorkerOptions = (assigningOrder?.eligible_workers || []).map((worker) => ({
        label: `${worker.name} (${worker.active_orders_count || 0} active orders)`,
        value: worker.id,
    }));

    const columns = [
        {
            title: 'Order#',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Link href={route('admin.orders.show', id)} className="font-semibold">#{id}</Link>,
        },
        {
            title: 'Client',
            key: 'client',
            render: (_, record) => (
                <div>
                    <div className="font-medium text-gray-900">{record.client?.name || 'Unknown client'}</div>
                    <div className="text-xs text-gray-500">{record.client?.email || '-'}</div>
                </div>
            ),
        },
        {
            title: 'Service',
            key: 'service',
            render: (_, record) => <span className="text-gray-700">{record.service?.name || '-'}</span>,
        },
        {
            title: 'Category',
            key: 'category',
            render: (_, record) => record.service?.category?.name
                ? <Tag color="cyan" className="m-0">{record.service.category.name}</Tag>
                : <span className="text-gray-400">-</span>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <StatusBadge status={normalizeStatus(status)} />,
        },
        {
            title: 'Credits',
            dataIndex: 'credits_used',
            key: 'credits_used',
            render: (credits) => <span className="font-semibold text-emerald-600">{credits} C</span>,
        },
        {
            title: 'Worker',
            key: 'worker',
            render: (_, record) => record.worker
                ? <span className="text-gray-700">{record.worker.name}</span>
                : <Tag color="orange" className="m-0">Unassigned</Tag>,
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: formatDate,
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => {
                const status = normalizeStatus(record.status);
                const canAssign = ['pending', 'assigned'].includes(status);

                return (
                    <Space size="small">
                        {canAssign && (
                            <Tooltip title={record.worker ? 'Reassign Worker' : 'Assign Worker'}>
                                <Button
                                    type="text"
                                    icon={<TeamOutlined />}
                                    onClick={() => openAssignModal(record)}
                                    className="text-blue-600 hover:bg-blue-50"
                                />
                            </Tooltip>
                        )}
                        <Tooltip title="View Details">
                            <Link href={route('admin.orders.show', record.id)}>
                                <Button type="text" icon={<EyeOutlined />} className="text-gray-600 hover:bg-gray-100" />
                            </Link>
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    const pagination = {
        current: orders.current_page,
        pageSize: orders.per_page,
        total: orders.total,
        onChange: (page) => {
            router.get(route('admin.orders.index'), { ...filters, page }, { preserveState: true });
        },
    };

    const hasFilters = Boolean(
        filters.status ||
        filters.service_id ||
        filters.category_id ||
        filters.worker_id ||
        filters.date_from ||
        filters.date_to ||
        filters.search
    );

    return (
        <>
            <Head title="Manage Orders" />

            <PageHeader
                title="Manage Orders"
               
            />

            <div className="mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3 items-center">
                    <Input
                        placeholder="Search order# or client"
                        prefix={<SearchOutlined className="text-gray-400" />}
                        allowClear
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onPressEnter={() => filterRoute({ search })}
                        className="xl:col-span-2"
                    />
                    <Select
                        placeholder="Status"
                        allowClear
                        value={filters.status || undefined}
                        onChange={(value) => filterRoute({ status: value })}
                        options={statuses}
                    />
                    <Select
                        placeholder="Service"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        value={filters.service_id ? String(filters.service_id) : undefined}
                        onChange={(value) => filterRoute({ service_id: value })}
                        options={serviceOptions}
                    />
                    <Select
                        placeholder="Category"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        value={filters.category_id ? String(filters.category_id) : undefined}
                        onChange={(value) => filterRoute({ category_id: value })}
                        options={categoryOptions}
                    />
                    <Select
                        placeholder="Worker"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        value={filters.worker_id ? String(filters.worker_id) : undefined}
                        onChange={(value) => filterRoute({ worker_id: value })}
                        options={workerOptions}
                    />
                    <RangePicker
                        value={filters.date_from && filters.date_to ? [dayjs(filters.date_from), dayjs(filters.date_to)] : null}
                        onChange={(dates) => filterRoute({
                            date_from: dates?.[0]?.format('YYYY-MM-DD'),
                            date_to: dates?.[1]?.format('YYYY-MM-DD'),
                        })}
                    />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                    <Button icon={<SearchOutlined />} onClick={() => filterRoute({ search })}>
                        Search
                    </Button>
                    {hasFilters && (
                        <Button type="link" onClick={clearFilters} className="text-gray-500">
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            <DataTable
                columns={columns}
                dataSource={orders.data}
                pagination={pagination}
                searchPlaceholder="Search orders"
            />

            <Modal
                title={assigningOrder ? `Assign Worker to Order #${assigningOrder.id}` : 'Assign Worker'}
                open={Boolean(assigningOrder)}
                onCancel={closeAssignModal}
                onOk={submitAssign}
                confirmLoading={assigning}
                okText="Assign Worker"
                destroyOnHidden
            >
                <div className="mb-4">
                    <Text type="secondary">
                        Eligible workers are limited to the order service and include current active order counts.
                    </Text>
                </div>
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
        </>
    );
}

Index.layout = page => <AdminLayout breadcrumbs={[
           { title: 'Dashboard', href: route('admin.dashboard') },
           { title: 'Orders' }
        ]}>{page}</AdminLayout>;
