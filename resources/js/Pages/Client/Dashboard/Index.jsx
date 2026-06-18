import { Head, router } from '@inertiajs/react';
import { Card, Table, Button, Space, Empty } from 'antd';
import {
    ShoppingOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    WalletOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';
import StatCard from '@/Components/Common/StatCard';
import ChartCard from '@/Components/Common/ChartCard';
import StatusBadge from '@/Components/Common/StatusBadge';
import { STATUS_COLORS } from '@/Utils/constants';
import dayjs from 'dayjs';

export default function Dashboard({ stats, recentOrders = [], ordersByStatus = {} }) {

    // ── ECharts donut config ─────────────────────────────────────────
    const donutData = Object.entries(ordersByStatus).map(([status, count]) => ({
        name: status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: count,
        itemStyle: { color: STATUS_COLORS[status] ?? '#6B7280' },
    }));

    const donutOptions = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: { fontSize: 12 },
        },
        series: [{
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            label: { show: false },
            emphasis: { label: { show: false } },
            data: donutData.length ? donutData : [{ name: 'No orders', value: 1, itemStyle: { color: '#E5E7EB' } }],
        }],
    };

    // ── Recent orders table columns ──────────────────────────────────
    const columns = [
        {
            title: 'Order #',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <span className="font-semibold text-gray-800">#{id}</span>,
        },
        {
            title: 'Service',
            key: 'service',
            render: (_, record) => (
                <span className="text-gray-700">{record.service?.name ?? '—'}</span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <StatusBadge status={typeof status === 'object' ? status?.value : status} />
            ),
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM D, YYYY'),
        },
        {
            title: '',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => router.visit(route('client.orders.show', record.id))}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <ClientLayout breadcrumbs={[{ title: 'Dashboard' }]}>
            <Head title="Dashboard" />

            <PageHeader title="Dashboard" />

            {/* ── Row 1: StatCards ─────────────────────────────────── */}
            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <StatCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        icon={<ShoppingOutlined />}
                        color="#3B82F6"
                    />
                </div>
                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <StatCard
                        title="Active Orders"
                        value={stats.activeOrders}
                        icon={<SyncOutlined />}
                        color="#F59E0B"
                    />
                </div>
                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <StatCard
                        title="Completed Orders"
                        value={stats.completedOrders}
                        icon={<CheckCircleOutlined />}
                        color="#10B981"
                    />
                </div>
                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                    <StatCard
                        title="Wallet Balance"
                        value={`${stats.walletBalance} credits`}
                        icon={<WalletOutlined />}
                        color="#8B5CF6"
                    />
                </div>
            </div>

            {/* ── Row 2: Chart + Quick Actions ─────────────────────── */}
            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 xl:col-span-8">
                    <ChartCard title="My Orders by Status" height={280}>
                        <ReactECharts
                            option={donutOptions}
                            className="h-full w-full"
                            notMerge
                        />
                    </ChartCard>
                </div>

                <div className="col-span-12 xl:col-span-4">
                    <Card
                        title="Quick Actions"
                        className="shadow-sm border-gray-100 rounded-lg h-full"
                        styles={{ header: { borderBottom: '1px solid #f0f0f0', fontWeight: 600 } }}
                    >
                        <Space direction="vertical" className="w-full" size="middle">
                            <Button
                                block
                                type="primary"
                                size="large"
                                icon={<ShoppingOutlined />}
                                onClick={() => router.visit(route('client.services.index'))}
                            >
                                Browse Services
                            </Button>
                            <Button
                                block
                                size="large"
                                icon={<ShoppingOutlined />}
                                onClick={() => router.visit(route('client.orders.index'))}
                            >
                                My Orders
                            </Button>
                            <Button
                                block
                                size="large"
                                icon={<WalletOutlined />}
                                onClick={() => router.visit(route('client.wallet.index'))}
                            >
                                Top Up Wallet
                            </Button>
                        </Space>
                    </Card>
                </div>
            </div>

            {/* ── Row 3: Recent Orders ─────────────────────────────── */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12">
                    <Card
                        title="Recent Orders"
                        className="shadow-sm border-gray-100 rounded-lg"
                        styles={{ header: { borderBottom: '1px solid #f0f0f0', fontWeight: 600 } }}
                    >
                        <Table
                            dataSource={recentOrders}
                            columns={columns}
                            rowKey="id"
                            pagination={false}
                            size="middle"
                            locale={{
                                emptyText: (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="No orders yet. Browse our services to get started."
                                    >
                                        <Button
                                            type="primary"
                                            onClick={() => router.visit(route('client.services.index'))}
                                        >
                                            Browse Services
                                        </Button>
                                    </Empty>
                                ),
                            }}
                        />
                    </Card>
                </div>
            </div>
        </ClientLayout>
    );
}
