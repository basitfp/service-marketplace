import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Select } from 'antd';
import WorkerLayout from '@/Layouts/WorkerLayout';
import PageHeader from '@/Components/Common/PageHeader';
import DataTable from '@/Components/Common/DataTable';
import StatusBadge from '@/Components/Common/StatusBadge';
import EmptyState from '@/Components/Common/EmptyState';
import { FileTextOutlined } from '@ant-design/icons';
import { ORDER_STATUSES } from '@/Utils/constants';

export default function Index({ orders, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleFilterChange = (value) => {
        setStatusFilter(value);
        router.get(route('worker.orders.index'), 
            { status: value || undefined },
            { preserveState: true, replace: true }
        );
    };

    const columns = [
        {
            title: 'Order#',
            dataIndex: 'id',
            key: 'id',
            render: (id) => `#${id}`,
            width: 100,
        },
        {
            title: 'Client',
            dataIndex: 'client_name',
            key: 'client_name',
            width: 120,
        },
        {
            title: 'Service',
            dataIndex: 'service_name',
            key: 'service_name',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category) => (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {category}
                </span>
            ),
            width: 150,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <StatusBadge status={status} />,
            width: 150,
        },
        {
            title: 'Date Assigned',
            dataIndex: 'date_assigned',
            key: 'date_assigned',
            width: 130,
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            render: (deadline, record) => (
                <span className={record.is_overdue ? 'text-red-600 font-semibold' : ''}>
                    {deadline}
                </span>
            ),
            width: 130,
        },
    ];

    const filterBar = (
        <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Select
                    value={statusFilter}
                    onChange={handleFilterChange}
                    className="w-45"
                    placeholder="All Statuses"
                    allowClear
                >
                    <Select.Option value="">All Statuses</Select.Option>
                    {ORDER_STATUSES.map(status => (
                        <Select.Option key={status} value={status}>
                            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Select.Option>
                    ))}
                </Select>
            </div>
        </div>
    );

    return (
        <WorkerLayout breadcrumbs={[{ label: 'My Orders' }]}>
            <Head title="My Orders" />

            <PageHeader title="My Orders" />

            {orders.data.length === 0 && !statusFilter ? (
                <EmptyState
                    icon={<FileTextOutlined className="text-5xl text-gray-400" />}
                    title="No orders assigned yet"
                    description="Check back later for new assignments"
                />
            ) : (
                <DataTable
                    columns={columns}
                    dataSource={orders.data}
                    loading={false}
                    pagination={{
                        current: orders.current_page,
                        pageSize: orders.per_page,
                        total: orders.total,
                        onChange: (page) => {
                            router.get(route('worker.orders.index'), 
                                { page, status: statusFilter || undefined },
                                { preserveState: true, replace: true }
                            );
                        },
                    }}
                    extra={filterBar}
                    onRow={(record) => ({
                        onClick: () => router.visit(route('worker.orders.show', record.id)),
                        className: 'cursor-pointer hover:bg-gray-50',
                    })}
                />
            )}
        </WorkerLayout>
    );
}
