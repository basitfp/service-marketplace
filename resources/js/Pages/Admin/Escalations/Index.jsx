import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Table, Tag, Input, Select, Space } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import dayjs from 'dayjs';

export default function EscalationsIndex({ escalations, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || undefined);

    const handleSearch = () => {
        router.get(route('admin.escalations.index'), { search, status }, { preserveState: true, replace: true });
    };

    const handleTableChange = (pagination) => {
        router.get(route('admin.escalations.index'), {
            search,
            status,
            page: pagination.current,
        }, { preserveState: true });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            className: 'font-mono text-gray-500 text-xs',
        },
        {
            title: 'Order',
            key: 'order',
            render: (_, record) => (
                <Link href={route('admin.orders.show', record.order_id)} className="font-medium text-blue-600">
                    #{record.order_id} - {record.order?.service?.name}
                </Link>
            ),
        },
        {
            title: 'Client',
            key: 'client',
            render: (_, record) => (
                <div>
                    <div className="font-medium text-gray-900">{record.client?.name}</div>
                    <div className="text-xs text-gray-500">{record.client?.email}</div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (val) => (
                <Tag color={val === 'resolved' ? 'green' : 'orange'} className="uppercase">
                    {val}
                </Tag>
            ),
        },
        {
            title: 'Opened At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY h:mm A'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Link href={route('admin.escalations.show', record.id)}>
                        <Button type="primary" size="small" icon={<EyeOutlined />}>View</Button>
                    </Link>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Head title="Escalations" />
            
            <PageHeader
                title="Escalations"
                subtitle="Manage and resolve client escalations regarding their orders"
            />

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex gap-4">
                <Input
                    placeholder="Search by order# or client..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={handleSearch}
                    className="w-64"
                    allowClear
                />
                <Select
                    className="w-40"
                    placeholder="Filter by Status"
                    allowClear
                    value={status}
                    onChange={(val) => setStatus(val)}
                    options={[
                        { label: 'Open', value: 'open' },
                        { label: 'Resolved', value: 'resolved' },
                    ]}
                />
                <Button onClick={handleSearch}>Filter</Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={escalations.data}
                    rowKey="id"
                    pagination={{
                        current: escalations.current_page,
                        pageSize: escalations.per_page,
                        total: escalations.total,
                        showSizeChanger: false,
                    }}
                    onChange={handleTableChange}
                />
            </div>
        </>
    );
}

EscalationsIndex.layout = page => <AdminLayout breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Escalations' }
            ]}>{page}</AdminLayout>;
