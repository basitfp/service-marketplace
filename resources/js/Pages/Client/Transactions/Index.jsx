import { Link, router } from '@inertiajs/react';
import { Card, Select, DatePicker, Row, Col, Tag } from 'antd';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';
import DataTable from '@/Components/Common/DataTable';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function Index({ transactions, filters }) {
    const breadcrumbs = [
        { title: <Link href="/client/dashboard">Home</Link> },
        { title: <Link href="/client/wallet">Wallet</Link> },
        { title: 'Transactions' },
    ];

    const getTypeColor = (type) => {
        const colors = {
            credit_purchase: 'green',
            order_payment: 'blue',
            order_refund: 'orange',
            revision_charge: 'red',
        };
        return colors[type] || 'default';
    };

    const getTypeLabel = (type) => {
        const labels = {
            credit_purchase: 'Top Up',
            order_payment: 'Order Payment',
            order_refund: 'Refund',
            revision_charge: 'Revision Fee',
        };
        return labels[type] || type;
    };

    const handleFilterChange = (newFilters) => {
        router.get(route('client.transactions.index'), {
            ...filters,
            ...newFilters,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const typeOptions = [
        { label: 'All', value: '' },
        { label: 'Top Up', value: 'credit_purchase' },
        { label: 'Order Payment', value: 'order_payment' },
        { label: 'Refund', value: 'order_refund' },
        { label: 'Revision Fee', value: 'revision_charge' },
    ];

    const columns = [
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 200,
            render: (date) => dayjs(date).format('MMM D, YYYY h:mm A'),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            render: (type) => <Tag color={getTypeColor(type)}>{getTypeLabel(type)}</Tag>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text, record) => {
                if (record.order && record.order.reference) {
                    return (
                        <span>
                            {text} -{' '}
                            <Link href={`/client/orders/${record.order_id}`} className="text-blue-600 hover:text-blue-700">
                                Order #{record.order.reference}
                            </Link>
                        </span>
                    );
                }
                return text;
            },
        },
        {
            title: 'Credits',
            dataIndex: 'credits',
            key: 'credits',
            width: 140,
            align: 'right',
            render: (credits, record) => {
                const isAddition = record.type === 'credit_purchase' || record.type === 'order_refund';
                const isDeduction = record.type === 'order_payment' || record.type === 'revision_charge';
                
                return (
                    <span className={isAddition ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {isAddition ? '+' : '-'}{Math.abs(credits).toLocaleString()} Credits
                    </span>
                );
            },
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            align: 'right',
            render: (amount, record) => {
                // Only show amount for credit purchases
                if (record.type === 'credit_purchase' && amount) {
                    return <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>;
                }
                return null;
            },
        },
    ];

    return (
        <ClientLayout breadcrumbs={breadcrumbs}>
            <PageHeader title="Transaction History" />

            <Card>
                {/* Filters */}
                <Row gutter={16} className="mb-4">
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            className="w-full"
                            placeholder="Filter by type"
                            value={filters.type || ''}
                            onChange={(value) => handleFilterChange({ type: value || undefined })}
                            options={typeOptions}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <RangePicker
                            className="w-full"
                            value={[
                                filters.date_from ? dayjs(filters.date_from) : null,
                                filters.date_to ? dayjs(filters.date_to) : null,
                            ]}
                            onChange={(dates) => {
                                handleFilterChange({
                                    date_from: dates?.[0] ? dates[0].format('YYYY-MM-DD') : undefined,
                                    date_to: dates?.[1] ? dates[1].format('YYYY-MM-DD') : undefined,
                                });
                            }}
                        />
                    </Col>
                </Row>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    dataSource={transactions.data}
                    pagination={{
                        current: transactions.current_page,
                        pageSize: transactions.per_page,
                        total: transactions.total,
                        onChange: (page) => handleFilterChange({ page }),
                    }}
                    rowKey="id"
                    exportable={true}
                />
            </Card>
        </ClientLayout>
    );
}
