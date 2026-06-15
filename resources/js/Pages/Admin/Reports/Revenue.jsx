import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, Select, Button, Table, Typography, Tag, Rate, Space } from 'antd';
import { DownloadOutlined, DollarOutlined, ShoppingCartOutlined, UsergroupAddOutlined, TeamOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';

const { Title, Text } = Typography;

export default function RevenueReport({ 
    revenueByMonth, 
    ordersByStatus, 
    ordersPerDay, 
    topServices, 
    workerPerformance, 
    stats,
    filters 
}) {
    const [months, setMonths] = useState(filters.months || 12);

    const handleFilterChange = (val) => {
        setMonths(val);
        router.get(route('admin.reports.revenue'), { months: val }, { preserveState: true });
    };

    const exportCSV = () => {
        window.location.href = route('admin.reports.revenue') + '?export=csv&months=' + months;
    };

    // ECharts configurations
    const revenueChartOptions = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: revenueByMonth.map(r => r.month),
        },
        yAxis: {
            type: 'value',
            axisLabel: { formatter: '${value}' }
        },
        series: [
            {
                name: 'Revenue',
                type: 'line',
                data: revenueByMonth.map(r => r.amount),
                smooth: true,
                areaStyle: {
                    opacity: 0.2,
                },
                itemStyle: { color: '#3B82F6' },
            }
        ]
    };

    const statusChartOptions = {
        tooltip: { trigger: 'item' },
        legend: { top: 'bottom' },
        series: [
            {
                name: 'Orders',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: { show: false },
                data: ordersByStatus.map(s => ({ value: s.count, name: s.status.replace('_', ' ').toUpperCase() }))
            }
        ]
    };

    const ordersPerDayOptions = {
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: ordersPerDay.map(o => o.date),
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: 'Orders',
                type: 'bar',
                data: ordersPerDay.map(o => o.count),
                itemStyle: { color: '#8B5CF6', borderRadius: [4, 4, 0, 0] }
            }
        ]
    };

    // Table Columns
    const topServicesColumns = [
        { title: 'Service Name', dataIndex: 'name', key: 'name' },
        { title: 'Total Orders', dataIndex: 'order_count', key: 'order_count', render: val => <Tag color="blue">{val}</Tag> }
    ];

    const workerPerfColumns = [
        { title: 'Worker Name', dataIndex: 'name', key: 'name', className: 'font-medium' },
        { title: 'Completed Orders', dataIndex: 'completed', key: 'completed' },
        { 
            title: 'Average Rating', 
            dataIndex: 'avg_rating', 
            key: 'avg_rating',
            render: (val) => <Space><Rate disabled defaultValue={Number(val)} allowHalf className="text-sm" /> <Text className="text-xs">{val}</Text></Space>
        }
    ];

    return (
        <>
            <Head title="Revenue Reports" />
            
            <PageHeader
                title="Platform Reports & Analytics"
                subtitle="Track revenue, order volume, and worker performance"
                actions={[
                    <Select 
                        key="filter"
                        value={months} 
                        onChange={handleFilterChange} 
                        style={{ width: 150 }}
                        options={[
                            { value: 3, label: 'Last 3 Months' },
                            { value: 6, label: 'Last 6 Months' },
                            { value: 12, label: 'Last 12 Months' },
                            { value: 24, label: 'Last 2 Years' },
                        ]}
                    />,
                    <Button key="export" icon={<DownloadOutlined />} onClick={exportCSV}>
                        Export CSV
                    </Button>
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card bordered={false} className="shadow-sm rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                            <DollarOutlined />
                        </div>
                        <div>
                            <Text type="secondary" className="text-sm">Total Revenue</Text>
                            <Title level={3} className="m-0">${Number(stats.totalRevenue).toLocaleString()}</Title>
                        </div>
                    </div>
                </Card>
                <Card bordered={false} className="shadow-sm rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                            <ShoppingCartOutlined />
                        </div>
                        <div>
                            <Text type="secondary" className="text-sm">Total Orders</Text>
                            <Title level={3} className="m-0">{stats.totalOrders}</Title>
                        </div>
                    </div>
                </Card>
                <Card bordered={false} className="shadow-sm rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl">
                            <UsergroupAddOutlined />
                        </div>
                        <div>
                            <Text type="secondary" className="text-sm">New Clients</Text>
                            <Title level={3} className="m-0">{stats.newClients}</Title>
                        </div>
                    </div>
                </Card>
                <Card bordered={false} className="shadow-sm rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xl">
                            <TeamOutlined />
                        </div>
                        <div>
                            <Text type="secondary" className="text-sm">New Workers</Text>
                            <Title level={3} className="m-0">{stats.newWorkers}</Title>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 lg:col-span-8">
                    <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Monthly Revenue">
                        <ReactECharts option={revenueChartOptions} style={{ height: '350px' }} />
                    </Card>
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Orders by Status">
                        {ordersByStatus.length > 0 ? (
                            <ReactECharts option={statusChartOptions} style={{ height: '350px' }} />
                        ) : (
                            <div className="flex items-center justify-center h-[350px] text-gray-400">No data</div>
                        )}
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 lg:col-span-8">
                    <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Orders Per Day (Last 30 Days)">
                        <ReactECharts option={ordersPerDayOptions} style={{ height: '350px' }} />
                    </Card>
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Top Services">
                        <Table 
                            columns={topServicesColumns} 
                            dataSource={topServices} 
                            rowKey="name" 
                            pagination={false} 
                            size="small"
                        />
                    </Card>
                </div>
            </div>

            <Card bordered={false} className="shadow-sm rounded-xl mb-6" title="Worker Performance">
                <Table 
                    columns={workerPerfColumns} 
                    dataSource={workerPerformance} 
                    rowKey="name"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

        </>
    );
}

RevenueReport.layout = page => <AdminLayout breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Reports' }
            ]}>{page}</AdminLayout>;
