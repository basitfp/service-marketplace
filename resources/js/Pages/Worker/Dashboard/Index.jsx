import { Head, Link } from '@inertiajs/react';
import { Card, Table } from 'antd';
import {
    InboxOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import WorkerLayout from '@/Layouts/WorkerLayout';
import PageHeader from '@/Components/Common/PageHeader';
import StatCard from '@/Components/Common/StatCard';
import ChartCard from '@/Components/Common/ChartCard';
import { BentoGrid, BentoCell } from '@/Components/Common/BentoGrid';
import StatusBadge from '@/Components/Common/StatusBadge';
import EChartsReact from 'echarts-for-react';
import { STATUS_COLORS } from '@/Utils/constants';
import EmptyState from '@/Components/Common/EmptyState';

export default function Index({ stats, performance, charts, recent_orders }) {
    // Orders by Status Chart
    const statusChartOption = {
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', right: 10, top: 'center' },
        series: [
            {
                name: 'Orders',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: false },
                emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
                data: charts.orders_by_status.map(item => ({
                    name: item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    value: item.count,
                    itemStyle: { color: STATUS_COLORS[item.status] || '#6B7280' }
                }))
            }
        ]
    };

    // Monthly Completed Chart
    const monthlyChartOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: {
            type: 'category',
            data: charts.monthly_completed.map(item => {
                const [year, month] = item.month.split('-');
                const date = new Date(year, month - 1);
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            })
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: 'Completed',
                data: charts.monthly_completed.map(item => item.count),
                type: 'bar',
                itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }
            }
        ]
    };

    const columns = [
        { title: 'Order#', dataIndex: 'id', key: 'id', render: (id) => `#${id}` },
        { title: 'Service', dataIndex: 'service_name', key: 'service_name' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <StatusBadge status={status} /> },
        { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: (date) => new Date(date).toLocaleDateString() },
    ];

    return (
        <WorkerLayout breadcrumbs={[{ label: 'Dashboard' }]}>
            <Head title="Worker Dashboard" />

            <PageHeader title="Worker Dashboard" />

            <BentoGrid cols={12}>
                {/* Row 1 - StatCards */}
                <BentoCell span={2}>
                    <StatCard
                        title="Assigned"
                        value={stats.assigned}
                        icon={<InboxOutlined />}
                        color="#3B82F6"
                    />
                </BentoCell>
                <BentoCell span={2}>
                    <StatCard
                        title="In Progress"
                        value={stats.in_progress}
                        icon={<SyncOutlined />}
                        color="#8B5CF6"
                    />
                </BentoCell>
                <BentoCell span={2}>
                    <StatCard
                        title="Submitted"
                        value={stats.submitted}
                        icon={<ClockCircleOutlined />}
                        color="#06B6D4"
                    />
                </BentoCell>
                <BentoCell span={2}>
                    <StatCard
                        title="Revision Requested"
                        value={stats.revision_requested}
                        icon={<ExclamationCircleOutlined />}
                        color={stats.revision_requested > 0 ? "#EF4444" : "#6B7280"}
                    />
                </BentoCell>
                <BentoCell span={2}>
                    <StatCard
                        title="Completed"
                        value={stats.completed}
                        icon={<CheckCircleOutlined />}
                        color="#10B981"
                    />
                </BentoCell>
                <BentoCell span={2}>
                    <StatCard
                        title="Completion Rate"
                        value={`${performance.completion_rate}%`}
                        icon={<TrophyOutlined />}
                        color="#F59E0B"
                    />
                </BentoCell>

                {/* Row 2 - Charts */}
                <BentoCell span={6}>
                    <ChartCard title="Orders by Status" height={300}>
                        {charts.orders_by_status.length > 0 ? (
                            <EChartsReact option={statusChartOption} className="h-[300px]" />
                        ) : (
                            <EmptyState title="No orders yet" description="Start accepting orders to see your statistics" />
                        )}
                    </ChartCard>
                </BentoCell>
                <BentoCell span={6}>
                    <ChartCard title="Monthly Completed Orders" height={300}>
                        {charts.monthly_completed.length > 0 ? (
                            <EChartsReact option={monthlyChartOption} className="h-[300px]" />
                        ) : (
                            <EmptyState title="No completed orders yet" description="Complete orders to see your monthly performance" />
                        )}
                    </ChartCard>
                </BentoCell>

                {/* Row 3 - Recent Orders & Performance */}
                <BentoCell span={8}>
                    <Card title="Recent Orders" className="h-full">
                        {recent_orders.length > 0 ? (
                            <>
                                <Table
                                    dataSource={recent_orders}
                                    columns={columns}
                                    pagination={false}
                                    size="small"
                                    rowKey="id"
                                    onRow={(record) => ({
                                        onClick: () => window.location.href = `/worker/orders/${record.id}`,
                                        className: 'cursor-pointer hover:bg-gray-50'
                                    })}
                                />
                                <Link href="/worker/orders" className="block mt-4 text-center text-blue-600 hover:text-blue-700">
                                    View All Orders →
                                </Link>
                            </>
                        ) : (
                            <EmptyState title="No orders assigned yet" description="Check back later for new assignments" />
                        )}
                    </Card>
                </BentoCell>
                <BentoCell span={4}>
                    <Card title="Performance Summary" className="h-full">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Avg Rating:</span>
                                <span className="font-semibold">
                                    {performance.avg_rating ? `${performance.avg_rating} ⭐` : 'No ratings yet'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Completed:</span>
                                <span className="font-semibold">{stats.completed}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Credits Earned:</span>
                                <div className="text-right">
                                    <div className="font-semibold">{performance.total_credits_earned} Credits</div>
                                    <div className="text-xs text-gray-400">informational</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </BentoCell>
            </BentoGrid>
        </WorkerLayout>
    );
}
