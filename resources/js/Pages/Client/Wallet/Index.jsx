import { Link } from '@inertiajs/react';
import { Card, Statistic, Table, Button, Empty, Tag } from 'antd';
import { WalletOutlined, PlusOutlined } from '@ant-design/icons';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';
import dayjs from 'dayjs';

export default function Index({ wallet, recentTransactions }) {
    const breadcrumbs = [
        { title: <Link href="/client/dashboard">Dashboard</Link> },
        { title: 'My Wallet' },
    ];

    const getTypeColor = (type) => {
        const colors = {
            credit_purchase: 'blue',
            order_payment: 'orange',
            order_refund: 'green',
            revision_charge: 'red',
        };
        return colors[type] || 'default';
    };

    const getTypeLabel = (type) => {
        const labels = {
            credit_purchase: 'Credit Purchase',
            order_payment: 'Order Payment',
            order_refund: 'Order Refund',
            revision_charge: 'Revision Charge',
        };
        return labels[type] || type;
    };

    const columns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color={getTypeColor(type)}>{getTypeLabel(type)}</Tag>,
        },
        {
            title: 'Credits',
            dataIndex: 'credits',
            key: 'credits',
            render: (credits) => (
                <span className={credits >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {credits >= 0 ? '+' : ''}{credits.toLocaleString()}
                </span>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY h:mm A'),
        },
    ];

    return (
        <ClientLayout breadcrumbs={breadcrumbs}>
            <PageHeader
                title="My Wallet"
                actions={[
                    <Link key="topup" href="/client/wallet/topup">
                        <Button type="primary" icon={<PlusOutlined />}>
                            Top Up Credits
                        </Button>
                    </Link>
                ]}
            />

            <div className="max-w-4xl mx-auto">
                {/* Balance Card */}
                <Card className="mb-6 text-center">
                    <Statistic
                        title="Available Credits"
                        value={wallet.balance}
                        valueStyle={{ color: '#3B82F6', fontSize: '48px', fontWeight: 'bold' }}
                        prefix={<WalletOutlined />}
                    />
                </Card>

                {/* Recent Transactions */}
                <Card
                    title="Recent Transactions"
                    extra={
                        <Link href="/client/wallet/transactions" className="text-blue-600 hover:text-blue-700">
                            View All Transactions →
                        </Link>
                    }
                >
                    {recentTransactions.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={recentTransactions}
                            rowKey="id"
                            pagination={false}
                        />
                    ) : (
                        <Empty
                            icon={<WalletOutlined className="text-6xl text-gray-300" />}
                            description="No transactions yet"
                        />
                    )}
                </Card>
            </div>
        </ClientLayout>
    );
}
