import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Table, Tag, Input, Select } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import dayjs from 'dayjs';

export default function CustomersIndex({ customers, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || undefined);

    const handleSearch = () => {
        router.get(route('admin.customers.index'), { search, status }, { preserveState: true, replace: true });
    };

    const handleTableChange = (pagination) => {
        router.get(route('admin.customers.index'), {
            search,
            status,
            page: pagination.current,
        }, { preserveState: true });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            className: 'font-medium',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => <a href={`mailto:${text}`}>{text}</a>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'} className="uppercase">
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Wallet Balance',
            key: 'wallet',
            render: (_, record) => (
                <span className="font-semibold text-blue-600">
                    {record.wallet?.balance || 0} credits
                </span>
            ),
        },
        {
            title: 'Total Orders',
            dataIndex: 'client_orders_count',
            key: 'orders',
            render: (count) => <Tag>{count || 0}</Tag>,
        },
        {
            title: 'Joined Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Link href={route('admin.customers.show', record.id)}>
                    <Button type="text" icon={<EyeOutlined />} />
                </Link>
            ),
        },
    ];

    return (
        <>
            <Head title="Customers" />
            
            <PageHeader
                title="Customers"
                subtitle="View and manage client accounts"
            />

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex gap-4">
                <Input
                    placeholder="Search by name or email..."
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
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' },
                    ]}
                />
                <Button onClick={handleSearch}>Filter</Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={customers.data}
                    rowKey="id"
                    pagination={{
                        current: customers.current_page,
                        pageSize: customers.per_page,
                        total: customers.total,
                        showSizeChanger: false,
                    }}
                    onChange={handleTableChange}
                />
            </div>
        </>
    );
}

CustomersIndex.layout = page => <AdminLayout breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Customers' }
            ]}>{page}</AdminLayout>;
