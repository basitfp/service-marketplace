import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Button, Space, Tag, Avatar, Switch, Popconfirm, Input, Select, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import DataTable from '@/Components/Common/DataTable';

export default function Index({ workers, filters }) {
    const handleFilterChange = (key, value) => {
        router.get(route('admin.workers.index'), {
            ...filters,
            [key]: value
        }, { preserveState: true, replace: true });
    };

    const toggleStatus = (id) => {
        router.patch(route('admin.workers.toggle-status', id), {}, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        router.delete(route('admin.workers.destroy', id), { preserveScroll: true });
    };

    const columns = [
        {
            title: 'Worker',
            key: 'worker',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar src={record.profile_photo ? `/storage/${record.profile_photo}` : null}>
                        {!record.profile_photo && record.name.charAt(0)}
                    </Avatar>
                    <div>
                        <div className="font-medium text-gray-900">{record.name}</div>
                        <div className="text-xs text-gray-500">{record.email}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => <span className="text-gray-600">{text || '—'}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (val, record) => (
                <Switch 
                    checked={val === 'active'} 
                    onChange={() => toggleStatus(record.id)} 
                    checkedChildren="Active" 
                    unCheckedChildren="Inactive" 
                />
            )
        },
        {
            title: 'Active Orders',
            key: 'active_orders',
            align: 'center',
            render: () => <Tag color="blue">0</Tag> // Mocked until orders module
        },
        {
            title: 'Completed',
            key: 'completed',
            align: 'center',
            render: () => <Tag color="green">0</Tag> // Mocked until orders module
        },
        {
            title: 'Joined Date',
            key: 'joined_date',
            render: (_, record) => {
                const date = record.worker_profile?.joined_date;
                return <span className="text-gray-600">{date || '—'}</span>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Profile">
                        <Link href={route('admin.workers.show', record.id)}>
                            <Button type="text" icon={<EyeOutlined />} className="text-gray-600 hover:bg-gray-100" />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Edit Worker">
                        <Link href={route('admin.workers.edit', record.id)}>
                            <Button type="text" icon={<EditOutlined />} className="text-blue-600 hover:bg-blue-50" />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Delete Worker">
                        <Popconfirm 
                            title="Delete this worker?" 
                            description="This cannot be undone. Active orders will block deletion."
                            onConfirm={() => handleDelete(record.id)} 
                            okText="Yes, delete" 
                            cancelText="No"
                            placement="topRight"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-red-50" />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    const pagination = {
        current: workers.current_page,
        pageSize: workers.per_page,
        total: workers.total,
        onChange: (page) => {
            router.get(route('admin.workers.index'), { ...filters, page }, { preserveState: true });
        }
    };

    return (
        <>
            <Head title="Manage Workers" />

            <PageHeader 
                title="Manage Workers" 
                subtitle="View and manage all registered professional workers in the marketplace."
                actions={[
                    <Link key="new" href={route('admin.workers.create')}>
                        <Button type="primary" icon={<PlusOutlined />} size="large">
                            Add Worker
                        </Button>
                    </Link>
                ]}
            />

            <div className="mb-4 flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100 items-center">
                <span className="font-medium text-gray-500">Filters:</span>
                <Input
                    placeholder="Search name or email"
                    prefix={<SearchOutlined className="text-gray-400" />}
                    allowClear
                    style={{ width: 250 }}
                    value={filters?.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    onPressEnter={(e) => handleFilterChange('search', e.target.value)}
                />
                <Select
                    placeholder="Status"
                    allowClear
                    style={{ width: 150 }}
                    value={filters?.status}
                    onChange={(val) => handleFilterChange('status', val)}
                    options={[
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' }
                    ]}
                />
                {(filters?.search || filters?.status) && (
                    <Button type="link" onClick={() => router.get(route('admin.workers.index'))} className="text-gray-500">
                        Clear Filters
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                dataSource={workers.data}
                pagination={pagination}
            />
        </>
    );
}

Index.layout = page => <AdminLayout breadcrumbs={[
            { title: 'Admin', href: route('admin.dashboard') },
            { title: 'Workers' }
        ]}>{page}</AdminLayout>;
