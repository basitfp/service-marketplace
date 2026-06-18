import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button, DatePicker, Select, Tag, Typography } from 'antd';
import {
    ShoppingOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';
import DataTable from '@/Components/Common/DataTable';
import StatusBadge from '@/Components/Common/StatusBadge';
import EmptyState from '@/Components/Common/EmptyState';
import { ORDER_STATUSES } from '@/Utils/constants';

dayjs.extend(relativeTime);

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ── Helpers ──────────────────────────────────────────────────────────────────

const normalizeStatus = (status) =>
    !status ? '' : typeof status === 'string' ? status : (status?.value ?? '');

const formatDate = (value) =>
    value ? dayjs(value).format('MMM D, YYYY') : '—';

// ── Status options for the filter dropdown ────────────────────────────────────

const STATUS_OPTIONS = [
    { label: 'All Statuses', value: '' },
    ...ORDER_STATUSES.map((s) => ({
        label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: s,
    })),
];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Index({ orders, filters = {} }) {

    const [search, setSearch] = useState(filters.search ?? '');

    // ── Filter helper — sends updated filters to the server ──────────
    const applyFilter = (next) => {
        router.get(
            route('client.orders.index'),
            { ...filters, ...next, page: undefined },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        router.get(route('client.orders.index'), {}, { preserveState: true, replace: true });
    };

    const hasFilters = Boolean(
        filters.status || filters.search || filters.date_from || filters.date_to,
    );

    // ── Table columns ────────────────────────────────────────────────
    const columns = [
        {
            title: 'Order #',
            dataIndex: 'id',
            key: 'id',
            width: 90,
            render: (id) => (
                <span
                    className="font-semibold text-blue-600 cursor-pointer hover:underline"
                    onClick={() => router.visit(route('client.orders.show', id))}
                >
                    #{id}
                </span>
            ),
        },
        {
            title: 'Service',
            key: 'service',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    {/* Thumbnail */}
                    {record.service?.image ? (
                        <img
                            src={`/storage/${record.service.image}`}
                            alt={record.service.name}
                            className="rounded object-cover flex-shrink-0 w-9 h-9"
                        />
                    ) : (
                        <div
                            className="rounded bg-slate-100 flex items-center justify-center text-slate-300 text-sm flex-shrink-0 w-9 h-9"
                        >
                            🛠
                        </div>
                    )}
                    <Text className="text-gray-800 text-sm line-clamp-1">
                        {record.service?.name ?? '—'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <StatusBadge status={normalizeStatus(status)} />,
        },
        {
            title: 'Credits',
            dataIndex: 'credits_used',
            key: 'credits_used',
            align: 'right',
            render: (credits) => (
                <Text strong className="text-blue-600 whitespace-nowrap">
                    {credits} cr
                </Text>
            ),
        },
        {
            title: 'Worker',
            key: 'worker',
            render: (_, record) =>
                record.worker ? (
                    <Text className="text-gray-700 text-sm">{record.worker.name}</Text>
                ) : (
                    <Tag color="orange" className="m-0 text-xs">Assigned Soon</Tag>
                ),
        },
        {
            title: 'Date Placed',
            dataIndex: 'created_at',
            key: 'created_at',
            render: formatDate,
        },
    ];

    // ── Row click handler ────────────────────────────────────────────
    const onRow = (record) => ({
        onClick: () => router.visit(route('client.orders.show', record.id)),
        className: 'cursor-pointer hover:bg-blue-50 transition-colors',
    });

    // ── Pagination ───────────────────────────────────────────────────
    const pagination = {
        current:  orders.current_page,
        pageSize: orders.per_page,
        total:    orders.total,
        onChange: (page) =>
            router.get(
                route('client.orders.index'),
                { ...filters, page },
                { preserveState: true },
            ),
    };

    // ── Empty state ──────────────────────────────────────────────────
    if (!orders.data.length && !hasFilters) {
        return (
            <ClientLayout breadcrumbs={[{ title: 'My Orders' }]}>
                <Head title="My Orders" />
                <PageHeader
                    title="My Orders"
                    breadcrumbs={[
                        { label: 'Home',      href: route('client.dashboard') },
                        { label: 'My Orders' },
                    ]}
                />
                <EmptyState
                    icon={<ShoppingOutlined />}
                    title="No orders yet"
                    description="Place an order by browsing our services catalogue."
                    action={
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => router.visit(route('client.services.index'))}
                        >
                            Browse Services
                        </Button>
                    }
                />
            </ClientLayout>
        );
    }

    // ── Render ───────────────────────────────────────────────────────
    return (
        <ClientLayout breadcrumbs={[{ title: 'My Orders' }]}>
            <Head title="My Orders" />

            <PageHeader
                title="My Orders"
                breadcrumbs={[
                    { label: 'Home',      href: route('client.dashboard') },
                    { label: 'My Orders' },
                ]}
            />

            {/* ── Filter bar ──────────────────────────────────────── */}
            <div className="mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-3">

                    {/* Search by order # */}
                    <input
                        type="text"
                        placeholder="Search by order #"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilter({ search })}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />

                    {/* Status filter */}
                    <Select
                        placeholder="All Statuses"
                        allowClear
                        value={filters.status || undefined}
                        onChange={(v) => applyFilter({ status: v ?? '' })}
                        options={STATUS_OPTIONS}
                        className="w-44"
                    />

                    {/* Date range */}
                    <RangePicker
                        value={
                            filters.date_from && filters.date_to
                                ? [dayjs(filters.date_from), dayjs(filters.date_to)]
                                : null
                        }
                        onChange={(dates) =>
                            applyFilter({
                                date_from: dates?.[0]?.format('YYYY-MM-DD') ?? '',
                                date_to:   dates?.[1]?.format('YYYY-MM-DD') ?? '',
                            })
                        }
                        className="w-60"
                    />

                    {/* Search button */}
                    <Button
                        icon={<SearchOutlined />}
                        onClick={() => applyFilter({ search })}
                    >
                        Search
                    </Button>

                    {/* Clear */}
                    {hasFilters && (
                        <Button type="link" onClick={clearFilters} className="text-gray-500">
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Table ───────────────────────────────────────────── */}
            <DataTable
                columns={columns}
                dataSource={orders.data}
                pagination={pagination}
                onRow={onRow}
                locale={{
                    emptyText: (
                        <EmptyState
                            icon={<ShoppingOutlined />}
                            title="No orders match your filters"
                            action={
                                <Button type="link" onClick={clearFilters}>
                                    Clear filters
                                </Button>
                            }
                        />
                    ),
                }}
            />
        </ClientLayout>
    );
}
