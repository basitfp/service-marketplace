import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Card, Tag, Button, Divider, Typography, Descriptions,
    Radio, Checkbox, Input, Upload, message, Space,
} from 'antd';
import {
    ClockCircleOutlined, ReloadOutlined,
    InboxOutlined, ShoppingCartOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';
import StatusBadge from '@/Components/Common/StatusBadge';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

// Stable colour palette for category tags
const TAG_COLORS = ['blue', 'cyan', 'geekblue', 'purple', 'magenta', 'volcano', 'orange', 'gold'];
const categoryColor = (id) => TAG_COLORS[(id ?? 0) % TAG_COLORS.length];

export default function Show({ service, eligibleWorkersCount, inCart, cartItemId }) {
    // ── Local state ──────────────────────────────────────────────────
    // selectedOptions: { [step_id]: option_id (single) | option_id[] (multi) }
    const [selectedOptions, setSelectedOptions] = useState(() => {
        const defaults = {};
        service.steps?.forEach((step) => {
            const defaultOption = step.options?.find((o) => o.is_default);
            if (defaultOption) {
                defaults[step.id] = step.input_type === 'multi_select'
                    ? [defaultOption.id]
                    : defaultOption.id;
            }
        });
        return defaults;
    });

    const [notes, setNotes]           = useState('');
    const [fileList, setFileList]     = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // ── Running total ────────────────────────────────────────────────
    const total = useMemo(() => {
        let sum = service.credit_cost ?? 0;
        service.steps?.forEach((step) => {
            const sel = selectedOptions[step.id];
            if (!sel) return;
            const ids = Array.isArray(sel) ? sel : [sel];
            ids.forEach((optId) => {
                const opt = step.options?.find((o) => o.id === optId);
                if (opt) sum += opt.credit_cost ?? 0;
            });
        });
        return sum;
    }, [selectedOptions, service]);

    // ── Selected add-on rows for summary panel ───────────────────────
    const addOns = useMemo(() => {
        const rows = [];
        service.steps?.forEach((step) => {
            const sel = selectedOptions[step.id];
            if (!sel) return;
            const ids = Array.isArray(sel) ? sel : [sel];
            ids.forEach((optId) => {
                const opt = step.options?.find((o) => o.id === optId);
                if (opt && (opt.credit_cost ?? 0) > 0) {
                    rows.push({ label: `${step.name}: ${opt.label}`, credits: opt.credit_cost });
                }
            });
        });
        return rows;
    }, [selectedOptions, service]);

    // ── Validation: required steps selected ─────────────────────────
    const validateSelections = () => {
        for (const step of service.steps ?? []) {
            if (!step.is_required) continue;
            const sel = selectedOptions[step.id];
            if (!sel || (Array.isArray(sel) && sel.length === 0)) {
                message.error(`Please select an option for: ${step.name}`);
                return false;
            }
        }
        return true;
    };

    // ── Build selections payload ─────────────────────────────────────
    const buildSelections = () => {
        const selections = [];
        service.steps?.forEach((step) => {
            const sel = selectedOptions[step.id];
            if (!sel) return;
            const ids = Array.isArray(sel) ? sel : [sel];
            ids.forEach((optId) => {
                const opt = step.options?.find((o) => o.id === optId);
                if (opt) {
                    selections.push({
                        step_id:      step.id,
                        step_name:    step.name,
                        option_id:    opt.id,
                        option_label: opt.label,
                        credit_cost:  opt.credit_cost ?? 0,
                    });
                }
            });
        });
        return selections;
    };

    // ── Add to cart ──────────────────────────────────────────────────
    const addToCart = () => {
        if (!validateSelections()) return;
        setSubmitting(true);

        router.post(route('client.cart.add'), {
            service_id:  service.id,
            selections:  buildSelections(),
            notes:       notes || null,
            total_credits: total,
        }, {
            preserveScroll: true,
            onSuccess: () => message.success(inCart ? 'Cart updated!' : 'Added to cart!'),
            onError:   () => message.error('Something went wrong. Please try again.'),
            onFinish:  () => setSubmitting(false),
        });
    };

    // ── Upload config ────────────────────────────────────────────────
    const uploadProps = {
        multiple: true,
        maxCount: 10,
        fileList,
        accept: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar',
        beforeUpload: (file) => {
            setFileList((prev) => [...prev, file]);
            return false; // prevent auto-upload
        },
        onRemove: (file) => {
            setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        },
    };

    return (
        <ClientLayout
            breadcrumbs={[
                { title: <a onClick={() => router.visit(route('client.services.index'))}>Browse Services</a> },
                { title: service.name },
            ]}
        >
            <Head title={service.name} />

            <PageHeader
                title={service.name}
                breadcrumbs={[
                    { label: 'Browse Services', href: route('client.services.index') },
                    { label: service.name },
                ]}
            />

            <div className="grid grid-cols-12 gap-6">

                {/* ════════════════════════════════════════════════════
                    LEFT COLUMN — service info + configuration
                ════════════════════════════════════════════════════ */}
                <div className="col-span-12 xl:col-span-7 space-y-6">

                    {/* Service header */}
                    <Card className="shadow-sm border-gray-100 rounded-lg overflow-hidden" styles={{ body: { padding: 0 } }}>
                        {/* Hero image */}
                        <div className="w-full bg-slate-100 overflow-hidden max-h-[260px]">
                            {service.image ? (
                                <img
                                    src={`/storage/${service.image}`}
                                    alt={service.name}
                                    className="w-full object-cover max-h-[260px]"
                                />
                            ) : (
                                <div className="w-full flex items-center justify-center bg-slate-100 h-[180px]">
                                    <span className="text-5xl text-slate-300">🛠</span>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            {service.category && (
                                <Tag color={categoryColor(service.category.id)} className="mb-3">
                                    {service.category.name}
                                </Tag>
                            )}

                            <Title level={3} className="!mb-2">{service.name}</Title>

                            {service.short_description && (
                                <Text type="secondary" className="block mb-4 text-base">
                                    {service.short_description}
                                </Text>
                            )}

                            <Space size="large" className="mt-2">
                                <span className="flex items-center gap-1 text-gray-500 text-sm">
                                    <ClockCircleOutlined />
                                    <span>{service.delivery_days} business day{service.delivery_days !== 1 ? 's' : ''}</span>
                                </span>
                                <span className="flex items-center gap-1 text-gray-500 text-sm">
                                    <ReloadOutlined />
                                    <span>{service.revisions} free revision{service.revisions !== 1 ? 's' : ''}</span>
                                </span>
                            </Space>
                        </div>
                    </Card>

                    {/* Full description */}
                    {service.description && (
                        <Card title="Description" className="shadow-sm border-gray-100 rounded-lg">
                            <Paragraph className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {service.description}
                            </Paragraph>
                        </Card>
                    )}

                    {/* Dynamic field values — read-only */}
                    {service.field_values?.length > 0 && (
                        <Card className="shadow-sm border-gray-100 rounded-lg">
                            <Divider orientation="left" className="!mt-0">
                                <Text strong>Service Details</Text>
                            </Divider>
                            <Descriptions column={2} bordered size="small">
                                {service.field_values
                                    .filter((fv) => fv.category_field && fv.value)
                                    .map((fv) => (
                                        <Descriptions.Item
                                            key={fv.id}
                                            label={fv.category_field.label}
                                        >
                                            {fv.value}
                                        </Descriptions.Item>
                                    ))}
                            </Descriptions>
                        </Card>
                    )}

                    {/* Step configuration */}
                    {service.steps?.length > 0 && (
                        <Card className="shadow-sm border-gray-100 rounded-lg">
                            <Divider orientation="left" className="!mt-0">
                                <Text strong>Configure Your Order</Text>
                            </Divider>

                            <div className="space-y-4">
                                {service.steps.map((step) => (
                                    <Card
                                        key={step.id}
                                        size="small"
                                        className="border-gray-200 rounded-lg bg-gray-50"
                                        title={
                                            <span>
                                                {step.name}
                                                {step.is_required && (
                                                    <span className="text-red-500 ml-1">*</span>
                                                )}
                                            </span>
                                        }
                                    >
                                        {step.description && (
                                            <Text type="secondary" className="block mb-3 text-sm">
                                                {step.description}
                                            </Text>
                                        )}

                                        {step.input_type === 'single_select' ? (
                                            <Radio.Group
                                                value={selectedOptions[step.id] ?? null}
                                                onChange={(e) =>
                                                    setSelectedOptions((prev) => ({
                                                        ...prev,
                                                        [step.id]: e.target.value,
                                                    }))
                                                }
                                                className="flex flex-col gap-2"
                                            >
                                                {step.options?.map((opt) => (
                                                    <Radio key={opt.id} value={opt.id} className="flex items-center">
                                                        <span className="flex items-center gap-2">
                                                            <span>{opt.label}</span>
                                                            {opt.credit_cost > 0 && (
                                                                <Tag color="green" className="m-0 text-xs">
                                                                    +{opt.credit_cost} Credits
                                                                </Tag>
                                                            )}
                                                        </span>
                                                    </Radio>
                                                ))}
                                            </Radio.Group>
                                        ) : (
                                            <Checkbox.Group
                                                value={selectedOptions[step.id] ?? []}
                                                onChange={(checked) =>
                                                    setSelectedOptions((prev) => ({
                                                        ...prev,
                                                        [step.id]: checked,
                                                    }))
                                                }
                                                className="flex flex-col gap-2"
                                            >
                                                {step.options?.map((opt) => (
                                                    <Checkbox key={opt.id} value={opt.id} className="flex items-center">
                                                        <span className="flex items-center gap-2">
                                                            <span>{opt.label}</span>
                                                            {opt.credit_cost > 0 && (
                                                                <Tag color="green" className="m-0 text-xs">
                                                                    +{opt.credit_cost} Credits
                                                                </Tag>
                                                            )}
                                                        </span>
                                                    </Checkbox>
                                                ))}
                                            </Checkbox.Group>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Notes */}
                    <Card className="shadow-sm border-gray-100 rounded-lg">
                        <Divider orientation="left" className="!mt-0">
                            <Text strong>Additional Notes</Text>
                        </Divider>
                        <Input.TextArea
                            rows={4}
                            placeholder="Any special instructions or requirements..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={2000}
                            showCount
                        />
                    </Card>

                    {/* Reference file upload */}
                    <Card className="shadow-sm border-gray-100 rounded-lg">
                        <Divider orientation="left" className="!mt-0">
                            <Text strong>Attach Reference Files (Optional)</Text>
                        </Divider>
                        <Dragger {...uploadProps} className="bg-gray-50">
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag files here to attach</p>
                            <p className="ant-upload-hint text-gray-400 text-xs">
                                Images, PDF, Word, Excel, ZIP — max 10 files
                            </p>
                        </Dragger>
                    </Card>
                </div>

                {/* ════════════════════════════════════════════════════
                    RIGHT COLUMN — order summary (sticky)
                ════════════════════════════════════════════════════ */}
                <div className="col-span-12 xl:col-span-5">
                    <div className="sticky top-6">
                        <Card
                            title="Order Summary"
                            className="shadow-md border-gray-100 rounded-lg"
                            styles={{ header: { fontWeight: 700, fontSize: 16 } }}
                        >
                            {/* Base price */}
                            <div className="flex justify-between items-center mb-2">
                                <Text className="text-gray-700 text-sm line-clamp-1 flex-1 pr-2">
                                    {service.name}
                                </Text>
                                <Text strong>{service.credit_cost} Credits</Text>
                            </div>

                            {/* Add-on rows */}
                            {addOns.map((addOn, i) => (
                                <div key={i} className="flex justify-between items-center mb-2">
                                    <Text type="secondary" className="text-xs flex-1 pr-2 line-clamp-1">
                                        {addOn.label}
                                    </Text>
                                    <Text type="success" className="text-xs whitespace-nowrap">
                                        +{addOn.credits} Credits
                                    </Text>
                                </div>
                            ))}

                            <Divider className="my-3" />

                            {/* Total */}
                            <div className="flex justify-between items-center mb-4">
                                <Text strong className="text-base">Total</Text>
                                <Text strong className="text-xl text-blue-600">{total} Credits</Text>
                            </div>

                            {/* Delivery + revisions */}
                            <div className="space-y-1 mb-4">
                                <div className="flex justify-between text-sm">
                                    <Text type="secondary">Delivery</Text>
                                    <Text>{service.delivery_days} business day{service.delivery_days !== 1 ? 's' : ''}</Text>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <Text type="secondary">Free Revisions</Text>
                                    <Text>{service.revisions}</Text>
                                </div>
                                {eligibleWorkersCount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <Text type="secondary">Available Workers</Text>
                                        <Text>{eligibleWorkersCount}</Text>
                                    </div>
                                )}
                            </div>

                            <Divider className="my-3" />

                            {/* Add to Cart / Update Cart */}
                            <Button
                                type="primary"
                                block
                                size="large"
                                icon={<ShoppingCartOutlined />}
                                loading={submitting}
                                onClick={addToCart}
                                className="mb-3"
                            >
                                {inCart ? 'Update Cart' : 'Add to Cart'}
                            </Button>

                            {/* Go to cart link (shown when already in cart) */}
                            {inCart && (
                                <div className="text-center">
                                    <Button
                                        type="link"
                                        icon={<ArrowRightOutlined />}
                                        onClick={() => router.visit(route('client.cart.index'))}
                                        className="text-blue-600"
                                    >
                                        Go to Cart
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

            </div>
        </ClientLayout>
    );
}
