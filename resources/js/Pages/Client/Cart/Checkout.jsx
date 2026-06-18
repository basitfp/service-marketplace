import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Card, Button, Divider, Typography, Alert,
} from 'antd';
import {
    WalletOutlined,
    CheckCircleOutlined,
    ArrowLeftOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';

const { Text, Title } = Typography;

// ── OrderItem — a single cart item row inside the summary card ───────────────

function OrderItem({ item, isLast }) {
    return (
        <>
            <div className="flex gap-3 py-2">

                {/* Service thumbnail (40×40) */}
                <div className="flex-shrink-0">
                    {item.service_image ? (
                        <img
                            src={`/storage/${item.service_image}`}
                            alt={item.service_name}
                            className="rounded object-cover w-10 h-10"
                        />
                    ) : (
                        <div
                            className="rounded bg-slate-100 flex items-center justify-center text-slate-300 text-base w-10 h-10"
                        >
                            🛠
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    {/* Service name + credits on the same row */}
                    <div className="flex justify-between items-start gap-2">
                        <Text strong className="text-gray-800 text-sm leading-snug truncate flex-1">
                            {item.service_name}
                        </Text>
                        <Text strong className="text-blue-600 text-sm whitespace-nowrap">
                            {item.total_credits} Credits
                        </Text>
                    </div>

                    {/* Selected options — indented */}
                    {item.selections?.length > 0 && (
                        <div className="mt-1 pl-1 space-y-0.5">
                            {item.selections.map((sel, i) => (
                                <Text key={i} className="block text-xs text-gray-500">
                                    {sel.step_name}: {sel.option_label}
                                    {(sel.credit_cost ?? 0) > 0 && (
                                        <span className="ml-1 text-green-600">
                                            (+{sel.credit_cost} Credits)
                                        </span>
                                    )}
                                </Text>
                            ))}
                        </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                        <Text
                            className="block text-xs text-gray-400 mt-1 pl-1"
                            style={{ fontStyle: 'italic' }}
                        >
                            Note: {item.notes}
                        </Text>
                    )}
                </div>

            </div>

            {/* Divider between items, but not after the last one */}
            {!isLast && <Divider className="my-1" />}
        </>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function Checkout({ cartItems = [], walletBalance = 0, total = 0 }) {

    const [placing, setPlacing] = useState(false);

    const balanceAfter = walletBalance - total;
    const insufficient = balanceAfter < 0;
    const shortfall    = total - walletBalance;

    // ── Place order ──────────────────────────────────────────────────
    const handlePlaceOrder = () => {
        setPlacing(true);

        router.post(route('client.checkout.store'), {}, {
            onError:  () => setPlacing(false),
            onFinish: () => setPlacing(false),
        });
    };

    // ── Render ───────────────────────────────────────────────────────

    return (
        <ClientLayout
            breadcrumbs={[
                { title: 'Home' },
                { title: 'Cart' },
                { title: 'Checkout' },
            ]}
        >
            <Head title="Review Your Order" />

            <PageHeader
                title="Review Your Order"
                breadcrumbs={[
                    { label: 'Home',     href: route('client.dashboard') },
                    { label: 'Cart',     href: route('client.cart.index') },
                    { label: 'Checkout' },
                ]}
            />

            {/* Centered single-column layout, max-w-3xl */}
            <div className="max-w-3xl mx-auto space-y-6">

                {/* ══════════════════════════════════════════════════
                    Section 1 — Order Summary
                ══════════════════════════════════════════════════ */}
                <Card
                    title="Order Summary"
                    className="shadow-sm border-gray-100 rounded-lg"
                    styles={{ header: { fontWeight: 700, fontSize: 16 } }}
                >
                    {cartItems.map((item, index) => (
                        <OrderItem
                            key={item.cart_item_id}
                            item={item}
                            isLast={index === cartItems.length - 1}
                        />
                    ))}
                </Card>

                {/* ══════════════════════════════════════════════════
                    Section 2 — Payment Details
                ══════════════════════════════════════════════════ */}
                <Card
                    title="Payment Details"
                    className="shadow-sm border-gray-100 rounded-lg"
                    styles={{ header: { fontWeight: 700, fontSize: 16 } }}
                >
                    {/* Total Credits — prominent */}
                    <div className="flex justify-between items-center mb-4">
                        <Text strong className="text-base text-gray-700">Total Credits</Text>
                        <Title level={4} className="!m-0 text-blue-600">
                            {total} Credits
                        </Title>
                    </div>

                    <Divider className="my-3" />

                    {/* Wallet details */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="flex items-center gap-2 text-gray-600 text-sm">
                                <WalletOutlined />
                                <span>Current Wallet Balance</span>
                            </span>
                            <Text strong className="text-sm">
                                {walletBalance} Credits
                            </Text>
                        </div>

                        <div className="flex justify-between items-center">
                            <Text className="text-gray-600 text-sm">Balance After Order</Text>
                            <Text
                                strong
                                className={`text-sm ${balanceAfter >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
                            >
                                {balanceAfter} Credits
                            </Text>
                        </div>
                    </div>
                </Card>

                {/* ══════════════════════════════════════════════════
                    Section 3 — Action
                ══════════════════════════════════════════════════ */}
                <Card className="shadow-sm border-gray-100 rounded-lg">

                    {/* Deduction warning — always visible */}
                    <Alert
                        type="warning"
                        showIcon
                        icon={<ExclamationCircleOutlined />}
                        message="By placing this order, the credits will be deducted from your wallet immediately."
                        className="mb-4"
                    />

                    {insufficient ? (
                        /* ── Insufficient balance branch ── */
                        <div className="space-y-3">
                            <Alert
                                type="error"
                                showIcon
                                message={
                                    <span>
                                        Insufficient balance. You need{' '}
                                        <strong>{shortfall} more credits</strong> to place this order.
                                    </span>
                                }
                                className="mb-2"
                            />

                            <Button
                                type="primary"
                                block
                                size="large"
                                icon={<WalletOutlined />}
                                onClick={() => router.visit('/client/wallet/topup')}
                            >
                                Top Up Wallet
                            </Button>

                            <div className="text-center">
                                <Button
                                    type="link"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => router.visit(route('client.cart.index'))}
                                    className="text-gray-500 hover:text-blue-600"
                                >
                                    Back to Cart
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* ── Sufficient balance branch ── */
                        <div className="space-y-3">
                            <Button
                                type="primary"
                                block
                                size="large"
                                icon={<CheckCircleOutlined />}
                                loading={placing}
                                onClick={handlePlaceOrder}
                            >
                                Place Order
                            </Button>

                            <div className="text-center">
                                <Button
                                    type="link"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => router.visit(route('client.cart.index'))}
                                    className="text-gray-500 hover:text-blue-600"
                                >
                                    Back to Cart
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

            </div>
        </ClientLayout>
    );
}
