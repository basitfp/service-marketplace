import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Button, Space, Tag, Avatar, Switch, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import DataTable from '@/Components/Common/DataTable';

export default function Index({ services, categories, filters }) {
    const handleFilterChange = (key, value) => {
        router.get(route('admin.services.index'), {
            ...filters,
            [key]: value
        }, {
            preserveState: true,
            replace: true
        });
    };

    const toggleStatus = (id) => {
        router.patch(route('admin.services.toggle-status', id), {}, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        router.delete(route('admin.services.destroy', id), { preserveScroll: true });
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            width: 60,
            render: (text) => (
                <Avatar 
                    src={text ? `/storage/${text}` : null} 
                    shape="square" 
                    size={40} 
                    className="bg-gray-100 border border-gray-200"
                >
                    {!text && 'Img'}
                </Avatar>
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div className="font-medium text-gray-900">{text}</div>
                    <div className="text-xs text-gray-400 truncate w-48" title={record.slug}>{record.slug}</div>
                </div>
            )
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category) => category ? <Tag color="blue">{category.name}</Tag> : <Tag>None</Tag>
        },
        {
            title: 'Cost',
            dataIndex: 'credit_cost',
            key: 'credit_cost',
            render: (val) => <span className="font-semibold text-emerald-600">{val} C</span>
        },
        {
            title: 'Delivery',
            dataIndex: 'delivery_days',
            key: 'delivery_days',
            render: (val) => <span className="text-gray-600">{val} {val === 1 ? 'day' : 'days'}</span>
        },
        {
            title: 'Featured',
            dataIndex: 'is_featured',
            key: 'is_featured',
            align: 'center',
            render: (val) => val ? <StarFilled className="text-yellow-400 text-lg" /> : <StarOutlined className="text-gray-300" />
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (val, record) => (
                <Switch 
                    checked={val} 
                    onChange={() => toggleStatus(record.id)} 
                    checkedChildren="Active" 
                    unCheckedChildren="Inactive" 
                />
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Link href={route('admin.services.edit', record.id)}>
                        <Button type="text" icon={<EditOutlined />} className="text-blue-600 hover:bg-blue-50" />
                    </Link>
                    <Popconfirm 
                        title="Delete this service?" 
                        description="This cannot be undone."
                        onConfirm={() => handleDelete(record.id)} 
                        okText="Yes, delete" 
                        cancelText="No"
                        placement="left"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-red-50" />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const pagination = {
        current: services.current_page,
        pageSize: services.per_page,
        total: services.total,
        onChange: (page) => {
            router.get(route('admin.services.index'), { ...filters, page }, { preserveState: true });
        }
    };

    return (
        <>
            <Head title="Manage Services" />

            <PageHeader 
                title="Manage Services" 
                subtitle="Create and configure services for your marketplace."
                actions={[
                    <Link key="new" href={route('admin.services.create')}>
                        <Button type="primary" icon={<PlusOutlined />} size="large">
                            New Service
                        </Button>
                    </Link>
                ]}
            />

            <div className="mb-4 flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100 items-center">
                <span className="font-medium text-gray-500">Filters:</span>
                <Select
                    placeholder="All Categories"
                    allowClear
                    style={{ width: 220 }}
                    value={filters?.category_id ? Number(filters.category_id) : undefined}
                    onChange={(val) => handleFilterChange('category_id', val)}
                    options={categories.map(c => ({ label: c.name, value: c.id }))}
                />
                <Select
                    placeholder="Status"
                    allowClear
                    style={{ width: 150 }}
                    value={filters?.is_active}
                    onChange={(val) => handleFilterChange('is_active', val)}
                    options={[
                        { label: 'Active', value: '1' },
                        { label: 'Inactive', value: '0' }
                    ]}
                />
                {(filters?.category_id || filters?.is_active) && (
                    <Button type="link" onClick={() => router.get(route('admin.services.index'))} className="text-gray-500">
                        Clear Filters
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                dataSource={services.data}
                pagination={pagination}
            />
        </>
    );
}

Index.layout = page => <AdminLayout breadcrumbs={[
            { title: 'Admin', href: route('admin.dashboard') },
            { title: 'Services' }
        ]}>{page}</AdminLayout>;
