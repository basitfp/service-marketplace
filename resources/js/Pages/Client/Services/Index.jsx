import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Card, Checkbox, Slider, Input, Tag, Pagination,
    Typography, Button, Divider,
} from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';
import EmptyState from '@/Components/Common/EmptyState';

const { Text } = Typography;

// Stable colour palette for category tags
const TAG_COLORS = ['blue', 'cyan', 'geekblue', 'purple', 'magenta', 'volcano', 'orange', 'gold', 'lime', 'green'];
const categoryColor = (id) => TAG_COLORS[id % TAG_COLORS.length];

export default function Index({ services, categories, filters = {} }) {
    const [search, setSearch]               = useState(filters.search ?? '');
    const [categoryIds, setCategoryIds]     = useState(filters.category_ids ?? []);
    const [creditRange, setCreditRange]     = useState([
        filters.min_credits ?? 0,
        filters.max_credits ?? 10000,
    ]);

    // ── Apply filters via Inertia ────────────────────────────────────
    const applyFilters = (overrides = {}) => {
        const next = {
            search:       overrides.search       ?? search,
            category_ids: overrides.category_ids ?? categoryIds,
            min_credits:  overrides.min_credits  ?? creditRange[0],
            max_credits:  overrides.max_credits  ?? creditRange[1],
            page:         1,
        };
        // Drop empty / default values to keep URL clean
        if (!next.search)                     delete next.search;
        if (!next.category_ids?.length)       delete next.category_ids;
        if (next.min_credits === 0)           delete next.min_credits;
        if (next.max_credits === 10000)       delete next.max_credits;

        router.get(route('client.services.index'), next, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryIds([]);
        setCreditRange([0, 10000]);
        router.get(route('client.services.index'), {}, { preserveState: true, replace: true });
    };

    const onCategoryChange = (checked) => {
        setCategoryIds(checked);
        applyFilters({ category_ids: checked });
    };

    const onCreditSliderChange = (range) => setCreditRange(range);
    const onCreditSliderAfterChange = (range) => applyFilters({ min_credits: range[0], max_credits: range[1] });

    const onSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const onPageChange = (page) => {
        router.get(route('client.services.index'), {
            ...filters,
            page,
        }, { preserveState: true });
    };

    // ── Category checkbox options ────────────────────────────────────
    const categoryOptions = categories.map((cat) => ({
        label: (
            <span className="flex justify-between w-full">
                <span>{cat.name}</span>
                <Text type="secondary" className="text-xs ml-2">{cat.services_count}</Text>
            </span>
        ),
        value: cat.id,
    }));

    const hasFilters = search || categoryIds.length || creditRange[0] > 0 || creditRange[1] < 10000;

    return (
        <ClientLayout breadcrumbs={[{ title: 'Browse Services' }]}>
            <Head title="Browse Services" />

            <PageHeader title="Browse Services" />

            <div className="flex gap-6">

                {/* ── Sidebar ───────────────────────────────────────── */}
                <aside className="w-72 flex-shrink-0">
                    <Card
                        title="Filters"
                        className="shadow-sm border-gray-100 rounded-lg sticky top-6"
                        size="small"
                        extra={
                            hasFilters && (
                                <Button
                                    type="link"
                                    size="small"
                                    icon={<ClearOutlined />}
                                    onClick={clearFilters}
                                    className="text-gray-400 hover:text-red-500 p-0"
                                >
                                    Clear All
                                </Button>
                            )
                        }
                    >
                        {/* Category filter */}
                        <div className="mb-6">
                            <Text strong className="block mb-3 text-gray-700">Category</Text>
                            <Checkbox.Group
                                options={categoryOptions}
                                value={categoryIds}
                                onChange={onCategoryChange}
                                className="flex flex-col gap-2"
                            />
                        </div>

                        <Divider className="my-4" />

                        {/* Credit range filter */}
                        <div>
                            <Text strong className="block mb-3 text-gray-700">Credit Range</Text>
                            <Slider
                                range
                                min={0}
                                max={10000}
                                step={100}
                                value={creditRange}
                                onChange={onCreditSliderChange}
                                onChangeComplete={onCreditSliderAfterChange}
                            />
                            <div className="flex justify-between mt-1">
                                <Text type="secondary" className="text-xs">{creditRange[0]} Credits</Text>
                                <Text type="secondary" className="text-xs">{creditRange[1]} Credits</Text>
                            </div>
                        </div>
                    </Card>
                </aside>

                {/* ── Main content ──────────────────────────────────── */}
                <div className="flex-1 min-w-0">
                    {/* Search bar */}
                    <div className="flex items-center gap-4 mb-6">
                        <Input.Search
                            placeholder="Search services..."
                            defaultValue={search}
                            onSearch={onSearch}
                            allowClear
                            size="large"
                            className="flex-1"
                            prefix={<SearchOutlined className="text-gray-400" />}
                        />
                        <Text type="secondary" className="whitespace-nowrap text-sm flex-shrink-0">
                            {services.total} service{services.total !== 1 ? 's' : ''} found
                        </Text>
                    </div>

                    {/* Service card grid */}
                    {services.data.length === 0 ? (
                        <EmptyState
                            icon={<SearchOutlined />}
                            title="No services found"
                            description="Try adjusting your filters or search term."
                            action={
                                hasFilters && (
                                    <Button onClick={clearFilters}>Clear Filters</Button>
                                )
                            }
                        />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                                {services.data.map((service) => (
                                    <Card
                                        key={service.id}
                                        hoverable
                                        className="shadow-sm border-gray-100 rounded-lg overflow-hidden cursor-pointer"
                                        styles={{ body: { padding: 0 } }}
                                        onClick={() => router.visit(route('client.services.show', service.id))}
                                    >
                                        {/* Thumbnail */}
                                        <div
                                            className="w-full bg-slate-100 overflow-hidden"
                                            style={{ aspectRatio: '16/9' }}
                                        >
                                            {service.image ? (
                                                <img
                                                    src={`/storage/${service.image}`}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                    <span className="text-3xl text-slate-300">🛠</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card body */}
                                        <div className="p-4">
                                            {service.category && (
                                                <Tag
                                                    color={categoryColor(service.category.id)}
                                                    className="mb-2 text-xs"
                                                >
                                                    {service.category.name}
                                                </Tag>
                                            )}

                                            <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-2 leading-snug">
                                                {service.name}
                                            </h3>

                                            {service.short_description && (
                                                <p className="text-gray-500 text-sm mb-3 line-clamp-1">
                                                    {service.short_description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-100">
                                                <span className="font-bold text-blue-600 text-base">
                                                    {service.credit_cost} Credits
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {service.delivery_days}d delivery
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {services.last_page > 1 && (
                                <div className="flex justify-center">
                                    <Pagination
                                        current={services.current_page}
                                        pageSize={services.per_page}
                                        total={services.total}
                                        onChange={onPageChange}
                                        showSizeChanger={false}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}
