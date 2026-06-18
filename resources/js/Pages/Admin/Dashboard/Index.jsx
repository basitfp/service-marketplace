import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, Table, Typography, Tag, Space, Button, Rate } from 'antd';
import { 
    ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, 
    ShoppingCartOutlined, UserOutlined, TeamOutlined, 
    ClockCircleOutlined, WarningOutlined 
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import StatCard from '@/Components/Common/StatCard';
import { STATUS_COLORS } from '@/Utils/constants';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function Dashboard({ stats, charts, tables }) {
    // ECharts Configurations
    const monthlyRevenueOptions = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { 
            type: 'category', 
            boundaryGap: false, 
            data: charts.monthly_revenue.map(r => r.month), 
            axisLine: { lineStyle: { color: '#e5e7eb' } }, 
            axisLabel: { color: '#6b7280' } 
        },
        yAxis: { 
            type: 'value', 
            axisLabel: { formatter: '${value}', color: '#6b7280' }, 
            splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } 
        },
        series: [{
            name: 'Revenue', 
            type: 'line', 
            smooth: true,
            data: charts.monthly_revenue.map(r => r.amount),
            itemStyle: { color: '#3b82f6' },
            areaStyle: {
                color: {
                    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: 'rgba(59, 130, 246, 0.4)' }, 
                        { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
                    ]
                }
            }
        }]
    };

    const ordersByStatusOptions = {
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%', icon: 'circle', itemGap: 20, textStyle: { color: '#4b5563' } },
        series: [{
            name: 'Orders', 
            type: 'pie', 
            radius: ['50%', '80%'], 
            center: ['50%', '45%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
            label: { show: false },
            data: charts.orders_by_status.map(s => ({
                value: s.count, 
                name: s.status.replace('_', ' ').toUpperCase(),
                itemStyle: { color: STATUS_COLORS[s.status] || '#9ca3af' }
            }))
        }]
    };

    const ordersPerDayOptions = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { 
            type: 'category', 
            data: charts.orders_per_day.map(o => dayjs(o.date).format('MMM D')), 
            axisLine: { lineStyle: { color: '#e5e7eb' } }, 
            axisLabel: { color: '#6b7280' } 
        },
        yAxis: { 
            type: 'value', 
            splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, 
            axisLabel: { color: '#6b7280' } 
        },
        series: [{
            name: 'Orders', 
            type: 'bar', 
            barWidth: '60%',
            data: charts.orders_per_day.map(o => o.count),
            itemStyle: { color: '#8b5cf6', borderRadius: [4, 4, 0, 0] }
        }]
    };

    const topServicesOptions = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { 
            type: 'value', 
            splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, 
            axisLabel: { color: '#6b7280' } 
        },
        yAxis: { 
            type: 'category', 
            data: [...charts.top_services].reverse().map(s => s.name), 
            axisLine: { show: false }, 
            axisTick: { show: false }, 
            axisLabel: { color: '#4b5563', width: 120, overflow: 'truncate' } 
        },
        series: [{
            name: 'Orders', 
            type: 'bar',
            data: [...charts.top_services].reverse().map(s => s.count),
            itemStyle: { color: '#10b981', borderRadius: [0, 4, 4, 0] }
        }]
    };

    return (
        <AdminLayout breadcrumbs={[{ title: 'Dashboard' }]}>
            <Head title="Dashboard Overview" />
            <PageHeader title="Overview" subtitle="Platform analytics and current activity" />

            {/* Row 1: StatCards */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-12 gap-6 mb-6">
                <div className="col-span-2">
                    <StatCard 
                        title="Total Revenue" 
                        value={stats.total_revenue.value} 
                        trend={stats.total_revenue.trend} 
                        icon={<DollarOutlined />} 
                        colorClass="bg-blue-50 text-blue-600" 
                        isCurrency 
                    />
                </div>
                <div className="col-span-2">
                    <StatCard 
                        title="Total Orders" 
                        value={stats.total_orders.value} 
                        trend={stats.total_orders.trend} 
                        icon={<ShoppingCartOutlined />} 
                        colorClass="bg-emerald-50 text-emerald-600" 
                    />
                </div>
                <div className="col-span-2">
                    <StatCard 
                        title="Active Clients" 
                        value={stats.active_clients.value} 
                        trend={stats.active_clients.trend} 
                        icon={<UserOutlined />} 
                        colorClass="bg-purple-50 text-purple-600" 
                    />
                </div>
                <div className="col-span-2">
                    <StatCard 
                        title="Active Workers" 
                        value={stats.active_workers.value} 
                        trend={stats.active_workers.trend} 
                        icon={<TeamOutlined />} 
                        colorClass="bg-indigo-50 text-indigo-600" 
                    />
                </div>
                <div className="col-span-2">
                    <StatCard 
                        title="Pending Orders" 
                        value={stats.pending_orders.value} 
                        trend={stats.pending_orders.trend} 
                        icon={<ClockCircleOutlined />} 
                        colorClass={stats.pending_orders.value > 0 ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"} 
                        inverseTrend 
                    />
                </div>
                <div className="col-span-2">
                    <StatCard 
                        title="Open Escalations" 
                        value={stats.open_escalations.value} 
                        trend={stats.open_escalations.trend} 
                        icon={<WarningOutlined />} 
                        colorClass={stats.open_escalations.value > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"} 
                        inverseTrend 
                    />
                </div>
            </div>

            {/* Row 2: Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
                <div className="col-span-1 xl:col-span-8">
                    <Card bordered={false} className="shadow-sm rounded-xl h-[450px]" title={<Text className="font-semibold text-lg">Monthly Revenue</Text>}>
                        <ReactECharts option={monthlyRevenueOptions} style={{ height: '350px' }} />
                    </Card>
                </div>
                <div className="col-span-1 xl:col-span-4">
                    <Card bordered={false} className="shadow-sm rounded-xl h-[450px]" title={<Text className="font-semibold text-lg">Orders by Status</Text>}>
                        <ReactECharts option={ordersByStatusOptions} style={{ height: '350px' }} />
                    </Card>
                </div>
            </div>

            {/* Row 3: Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
                <div className="col-span-1 xl:col-span-6">
                    <Card bordered={false} className="shadow-sm rounded-xl h-[400px]" title={<Text className="font-semibold text-lg">Orders Per Day (30 Days)</Text>}>
                        <ReactECharts option={ordersPerDayOptions} style={{ height: '300px' }} />
                    </Card>
                </div>
                <div className="col-span-1 xl:col-span-6">
                    <Card bordered={false} className="shadow-sm rounded-xl h-[400px]" title={<Text className="font-semibold text-lg">Top 5 Services</Text>}>
                        <ReactECharts option={topServicesOptions} style={{ height: '300px' }} />
                    </Card>
                </div>
            </div>

            {/* Row 4: Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
                <div className="col-span-1 xl:col-span-8">
                    <Card bordered={false} className="shadow-sm rounded-xl h-full" title={<Text className="font-semibold text-lg">Recent Orders</Text>} extra={<Link href="/admin/orders" className="text-blue-600 font-medium">View All</Link>}>
                        <Table 
                            dataSource={tables.recent_orders} 
                            rowKey="id" 
                            pagination={false} 
                            size="middle"
                            rowClassName="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <Table.Column title="Order #" dataIndex="id" render={(id) => <span className="font-medium text-gray-900">#{id}</span>} />
                            <Table.Column title="Client" dataIndex={['client', 'name']} />
                            <Table.Column title="Service" dataIndex={['service', 'name']} />
                            <Table.Column title="Status" dataIndex="status" render={(status) => <Tag color={STATUS_COLORS[status] || 'default'} className="uppercase rounded-full px-3 py-1 font-semibold border-0 text-xs">{status.replace('_', ' ')}</Tag>} />
                            <Table.Column title="Action" render={(_, record) => <Link href={`/admin/orders/${record.id}`}><Button size="small" type="primary" ghost>View</Button></Link>} align="right" />
                        </Table>
                    </Card>
                </div>
                <div className="col-span-1 xl:col-span-4">
                    <Card bordered={false} className="shadow-sm rounded-xl h-full" title={<Text className="font-semibold text-lg">Top Workers</Text>}>
                        <Table 
                            dataSource={tables.top_workers} 
                            rowKey="id" 
                            pagination={false} 
                            size="middle"
                            rowClassName="hover:bg-gray-50 transition-colors"
                        >
                            <Table.Column title="Name" dataIndex="name" render={(name) => <span className="font-medium">{name}</span>} />
                            <Table.Column title="Completed" dataIndex="completed" align="center" render={(val) => <Tag color="blue" className="rounded-full px-2">{val}</Tag>} />
                            <Table.Column title="Rating" dataIndex="avg_rating" align="right" render={(val) => <Space><Rate disabled defaultValue={Number(val)} allowHalf className="text-sm text-yellow-400" /> <span className="font-semibold text-xs">{val}</span></Space>} />
                        </Table>
                    </Card>
                </div>
            </div>

            {/* Row 5: Transactions */}
            <div className="grid grid-cols-1 gap-6 mb-6">
                <Card bordered={false} className="shadow-sm rounded-xl" title={<Text className="font-semibold text-lg">Recent Transactions</Text>} extra={<Link href="/admin/transactions" className="text-blue-600 font-medium">View All</Link>}>
                    <Table 
                        dataSource={tables.recent_transactions} 
                        rowKey="id" 
                        pagination={false} 
                        size="middle"
                        rowClassName="hover:bg-gray-50 transition-colors"
                    >
                        <Table.Column title="User" dataIndex={['user', 'name']} render={(name, record) => <div><div className="font-medium text-gray-900">{name}</div><div className="text-xs text-gray-500">{record.user?.email}</div></div>} />
                        <Table.Column title="Type" dataIndex="type" render={(type) => <Tag color={type === 'credit_purchase' ? 'green' : 'blue'} className="uppercase rounded-full px-3 py-1 font-semibold border-0 text-xs">{type.replace('_', ' ')}</Tag>} />
                        <Table.Column title="Credits" dataIndex="credits" align="right" render={(val) => <span className="font-medium text-gray-900">{val} cr</span>} />
                        <Table.Column title="Amount" dataIndex="amount" align="right" render={(val) => <span className="font-medium text-emerald-600">${val}</span>} />
                        <Table.Column title="Date" dataIndex="created_at" align="right" render={(date) => <span className="text-gray-500">{dayjs(date).format('MMM D, YYYY h:mm A')}</span>} />
                    </Table>
                </Card>
            </div>
        </AdminLayout>
    );
}