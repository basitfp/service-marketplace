import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Table, Tag, Typography, Descriptions, Card, Avatar } from 'antd';
import { ArrowLeftOutlined, UserOutlined, WalletOutlined, ShoppingCartOutlined, SwapOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function CustomersShow({ customer, orders, transactions }) {
    const handleTableChange = (type, pagination) => {
        router.get(route('admin.customers.show', customer.id), {
            [`${type}_page`]: pagination.current,
        }, { preserveState: true, preserveScroll: true });
    };

    const orderColumns = [
        {
            title: 'Order#',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Link href={route('admin.orders.show', id)} className="font-medium text-blue-600">#{id}</Link>,
        },
        {
            title: 'Service',
            dataIndex: ['service', 'name'],
            key: 'service',
        },
        {
            title: 'Worker',
            key: 'worker',
            render: (_, record) => record.worker?.name || <Text type="secondary">Unassigned</Text>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag className="uppercase">{status}</Tag>,
        },
        {
            title: 'Credits',
            dataIndex: 'credits_used',
            key: 'credits',
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY'),
        },
    ];

    const transactionColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'credit_purchase' || type === 'refund' ? 'green' : 'red'} className="uppercase">
                    {type.replace('_', ' ')}
                </Tag>
            ),
        },
        {
            title: 'Credits',
            dataIndex: 'credits',
            key: 'credits',
            render: (val, record) => {
                const isPositive = record.type === 'credit_purchase' || record.type === 'refund';
                return (
                    <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : '-'}{val}
                    </span>
                );
            }
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (val) => val ? `$${Number(val).toFixed(2)}` : '-',
        },
        {
            title: 'Reference',
            dataIndex: 'reference',
            key: 'reference',
            render: (text) => text || '-',
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY h:mm A'),
        },
    ];

    return (
        <>
            <Head title={`Customer: ${customer.name}`} />
            
            <PageHeader
                title={`Customer Profile`}
                actions={[
                    <Link key="back" href={route('admin.customers.index')}>
                        <Button icon={<ArrowLeftOutlined />}>Back to Customers</Button>
                    </Link>
                ]}
            />

            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 md:col-span-4">
                    <Card bordered={false} className="shadow-sm h-full rounded-xl border border-gray-100">
                        <div className="flex flex-col items-center text-center p-4">
                            <Avatar size={100} icon={<UserOutlined />} src={customer.profile_photo_url} className="mb-4" />
                            <Title level={4} className="mb-1">{customer.name}</Title>
                            <Text type="secondary" className="mb-2">{customer.email}</Text>
                            <Tag color={customer.status === 'active' ? 'green' : 'red'} className="uppercase mb-4">
                                {customer.status}
                            </Tag>
                            <Descriptions column={1} size="small" className="w-full text-left bg-gray-50 p-4 rounded-lg">
                                <Descriptions.Item label="Phone">{customer.phone || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Joined">{dayjs(customer.created_at).format('MMMM D, YYYY')}</Descriptions.Item>
                            </Descriptions>
                        </div>
                    </Card>
                </div>

                <div className="col-span-12 md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card bordered={false} className="shadow-sm rounded-xl border border-gray-100">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl">
                                <WalletOutlined />
                            </div>
                            <div>
                                <Text type="secondary" className="text-sm">Wallet Balance</Text>
                                <Title level={3} className="m-0 text-blue-600">{customer.wallet?.balance || 0}</Title>
                            </div>
                        </div>
                    </Card>
                    
                    <Card bordered={false} className="shadow-sm rounded-xl border border-gray-100">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl">
                                <ShoppingCartOutlined />
                            </div>
                            <div>
                                <Text type="secondary" className="text-sm">Total Orders</Text>
                                <Title level={3} className="m-0 text-purple-600">{orders.total || 0}</Title>
                            </div>
                        </div>
                    </Card>
                    
                    {/* Placeholder for more stats if needed */}
                </div>
            </div>

            <Card bordered={false} className="shadow-sm rounded-xl border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <Title level={5} className="m-0 flex items-center gap-2">
                        <ShoppingCartOutlined /> Order History
                    </Title>
                </div>
                <Table
                    columns={orderColumns}
                    dataSource={orders.data}
                    rowKey="id"
                    pagination={{
                        current: orders.current_page,
                        pageSize: orders.per_page,
                        total: orders.total,
                        showSizeChanger: false,
                    }}
                    onChange={(pagination) => handleTableChange('orders', pagination)}
                />
            </Card>

            <Card bordered={false} className="shadow-sm rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <Title level={5} className="m-0 flex items-center gap-2">
                        <SwapOutlined /> Transaction History
                    </Title>
                </div>
                <Table
                    columns={transactionColumns}
                    dataSource={transactions.data}
                    rowKey="id"
                    pagination={{
                        current: transactions.current_page,
                        pageSize: transactions.per_page,
                        total: transactions.total,
                        showSizeChanger: false,
                    }}
                    onChange={(pagination) => handleTableChange('transactions', pagination)}
                />
            </Card>
        </>
    );
}

CustomersShow.layout = page => <AdminLayout breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Customers', href: route('admin.customers.index') },
                { title: 'Details' }
            ]}>{page}</AdminLayout>;
