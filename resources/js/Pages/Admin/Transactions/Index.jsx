import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button, Table, Tag, Input, Select, DatePicker } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function TransactionsIndex({ transactions, filters, types }) {
    const [search, setSearch] = useState(filters?.user_search || '');
    const [type, setType] = useState(filters?.type || undefined);
    const [dateRange, setDateRange] = useState([
        filters?.date_from ? dayjs(filters.date_from) : null,
        filters?.date_to ? dayjs(filters.date_to) : null,
    ]);

    const handleSearch = () => {
        router.get(route('admin.transactions.index'), {
            user_search: search,
            type,
            date_from: dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : null,
            date_to: dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : null,
        }, { preserveState: true, replace: true });
    };

    const handleTableChange = (pagination) => {
        router.get(route('admin.transactions.index'), {
            user_search: search,
            type,
            date_from: dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : null,
            date_to: dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : null,
            page: pagination.current,
        }, { preserveState: true });
    };

    const exportCSV = () => {
        const query = new URLSearchParams({
            user_search: search || '',
            type: type || '',
            date_from: dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : '',
            date_to: dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : '',
            export: 'csv'
        });
        window.location.href = route('admin.transactions.index') + '?' + query.toString();
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            className: 'font-mono text-gray-500 text-xs',
        },
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <div>
                    <div className="font-medium text-gray-900">{record.user?.name}</div>
                    <div className="text-xs text-gray-500">{record.user?.email}</div>
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (val) => (
                <Tag color={val === 'credit_purchase' || val === 'refund' ? 'green' : 'red'} className="uppercase">
                    {val.replace('_', ' ')}
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
            title: 'Amount ($)',
            dataIndex: 'amount',
            key: 'amount',
            render: (val) => val ? `$${Number(val).toFixed(2)}` : '-',
        },
        {
            title: 'Reference',
            dataIndex: 'reference',
            key: 'reference',
            render: (text) => text ? <span className="font-mono text-xs text-gray-500">{text}</span> : '-',
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
            <Head title="Transactions" />
            
            <PageHeader
                title="Transactions"
                subtitle="View system-wide wallet transactions and credit flows"
                actions={[
                    <Button key="export" icon={<DownloadOutlined />} onClick={exportCSV}>
                        Export CSV
                    </Button>
                ]}
            />

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4">
                <Input
                    placeholder="Search by user..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={handleSearch}
                    className="w-64"
                    allowClear
                />
                <Select
                    className="w-48"
                    placeholder="Filter by Type"
                    allowClear
                    value={type}
                    onChange={(val) => setType(val)}
                    options={types.map(t => ({ label: t.replace('_', ' ').toUpperCase(), value: t }))}
                />
                <RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates)}
                />
                <Button onClick={handleSearch} type="primary">Apply Filters</Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={transactions.data}
                    rowKey="id"
                    pagination={{
                        current: transactions.current_page,
                        pageSize: transactions.per_page,
                        total: transactions.total,
                        showSizeChanger: false,
                    }}
                    onChange={handleTableChange}
                />
            </div>
        </>
    );
}

TransactionsIndex.layout = page => <AdminLayout breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Transactions' }
            ]}>{page}</AdminLayout>;
