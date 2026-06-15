import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button, Table, Space, Tag, Input, Switch, Modal, Form, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import dayjs from 'dayjs';

export default function CreditPackagesIndex({ packages, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [form] = Form.useForm();

    const handleSearch = (value) => {
        router.get(route('admin.credit-packages.index'), { search: value }, { preserveState: true, replace: true });
    };

    const handleTableChange = (pagination) => {
        router.get(route('admin.credit-packages.index'), {
            search,
            page: pagination.current,
        }, { preserveState: true });
    };

    const toggleStatus = (id) => {
        router.patch(route('admin.credit-packages.toggle', id), {}, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        router.delete(route('admin.credit-packages.destroy', id), { preserveScroll: true });
    };

    const openModal = (record = null) => {
        setEditingPackage(record);
        if (record) {
            form.setFieldsValue({
                ...record,
                is_active: record.is_active !== undefined ? record.is_active : true,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ is_active: true, bonus_credits: 0 });
        }
        setIsModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            
            if (editingPackage) {
                router.put(route('admin.credit-packages.update', editingPackage.id), values, {
                    onSuccess: () => {
                        setIsModalVisible(false);
                    }
                });
            } else {
                router.post(route('admin.credit-packages.store'), values, {
                    onSuccess: () => {
                        setIsModalVisible(false);
                    }
                });
            }
        } catch (error) {
            console.error('Validation Failed:', error);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            className: 'font-medium',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (val) => `$${Number(val).toFixed(2)}`,
        },
        {
            title: 'Credits',
            dataIndex: 'credits',
            key: 'credits',
        },
        {
            title: 'Bonus',
            dataIndex: 'bonus_credits',
            key: 'bonus_credits',
            render: (val) => val ? <Tag color="green">+{val}</Tag> : '-',
        },
        {
            title: 'Total Credits',
            key: 'total',
            render: (_, record) => Number(record.credits) + Number(record.bonus_credits || 0),
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={() => toggleStatus(record.id)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => openModal(record)} />
                    <Popconfirm
                        title="Delete this package?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Head title="Credit Packages" />
            
            <PageHeader
                title="Credit Packages"
                subtitle="Manage available credit packages for clients to purchase"
                actions={[
                    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                        New Package
                    </Button>
                ]}
            />

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                <div className="flex gap-4">
                    <Input
                        placeholder="Search packages..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={(e) => handleSearch(e.target.value)}
                        className="w-64"
                        allowClear
                    />
                    <Button onClick={() => handleSearch(search)}>Search</Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={packages.data}
                    rowKey="id"
                    pagination={{
                        current: packages.current_page,
                        pageSize: packages.per_page,
                        total: packages.total,
                        showSizeChanger: false,
                    }}
                    onChange={handleTableChange}
                />
            </div>

            <Modal
                title={editingPackage ? "Edit Credit Package" : "Create Credit Package"}
                open={isModalVisible}
                onOk={handleSave}
                onCancel={() => setIsModalVisible(false)}
                okText="Save"
                cancelText="Cancel"
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                >
                    <Form.Item
                        name="name"
                        label="Package Name"
                        rules={[{ required: true, message: 'Please enter a name' }]}
                    >
                        <Input placeholder="e.g. Starter Pack" />
                    </Form.Item>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="price"
                            label="Price ($)"
                            rules={[{ required: true, message: 'Please enter price' }]}
                        >
                            <InputNumber min={0} step={0.01} className="w-full" prefix="$" />
                        </Form.Item>
                        
                        <Form.Item
                            name="credits"
                            label="Base Credits"
                            rules={[{ required: true, message: 'Please enter credits amount' }]}
                        >
                            <InputNumber min={1} className="w-full" />
                        </Form.Item>
                    </div>
                    
                    <Form.Item
                        name="bonus_credits"
                        label="Bonus Credits (Optional)"
                    >
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>
                    
                    <Form.Item
                        name="is_active"
                        label="Status"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

CreditPackagesIndex.layout = page => <AdminLayout breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Credit Packages' }
            ]}>{page}</AdminLayout>;
