import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Card, Button, Divider, Typography, Tooltip,
    Popconfirm, message, Space,
} from 'antd';
import {
    ShoppingCartOutlined,
    EditOutlined,
    DeleteOutlined,
    WalletOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';
import EmptyState from '@/Components/Common/EmptyState';
import ConfirmModal from '@/Components/Common/ConfirmModal';

const { Text, Title } = Typography;

// ── CartItemCard ─────────────────────────────────────────────────────────────

function CartItemCard({ item, onRemove }) {
    return (
        <Card
            className="shadow-sm border-gray-100 rounded-lg"
            styles={{ body: { padding: '16px' } }}
            style={{ marginBottom: 16 }}
        >
            <div className="flex gap-4">

                {/* Thumbnail */}
                <div className="flex-shrink-0">
                    {item.service_image ? (
                        <img
                            src={`/storage/${item.service_image}`}
                            alt={item.service_name}
                            className="rounded-lg object-cover"
                            style={{ width: 80, height: 80 }}
                        />
                    ) : (
                        <div
                            className="rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 text-2xl"
                            style={{ width: 80, height: 80 }}
                        >
                            🛠
                        </div>
                    )}
                </div>

                {/* Center — details */}
                <div className="flex-1 min-w-0">
                    <Text strong className="block text-base text-gray-800 mb-1 truncate">
                        {item.service_name}
                    </Text>

                    {/* Selections */}
                    {item.selections?.length > 0 && (
                        <div className="space-y-0.5 mb-1">
                            {item.selections.map((sel, i) => (
                                <Text
                                    key={i}
                                    className="block text-xs text-gray-500"
                                >
                                    {sel.step_name}: {sel.option_label}
                                    {sel.credit_cost > 0 && (
                                        <span className="ml-1 text-green-600">
                                            (+{sel.credit_cost} cr)
                                        </span>
                                    )}
                                </Text>
                            ))}
                        </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                        <Text
                            className="block text-xs text-gray-400 mt-1"
                            style={{ fontStyle: 'italic' }}
                        >
                            Note: {item.notes}
                        </Text>
                    )}
                </div>

                {/* Right — price + actions */}
                <div className="flex-shrink-0 flex flex-col items-end justify-between gap-2">
                    {/* Total */}
                    <Text strong className="text-base text-blue-600 whitespace-nowrap">
                        {item.total_credits} Credits
                    </Text>

                    {/* Action buttons */}
                    <Space size="small">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() =>
                                router.visit(`/client/services/${item.service_slug}`)
                            }
                        >
                            Edit
                        </Button>
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => onRemove(item)}
                        >
                            Remove
                        </Button>
                    </Space>
                </div>

            </div>
        </Card>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function Index({ cartItems = [], walletBalance = 0 }) {

    // ── Remove modal state ───────────────────────────────────────────
    const [removeTarget, setRemoveTarget] = useState(null); // cart item object
    const [removing, setRemoving]         = useState(false);
    const [clearing, setClearing]         = useState(false);

    // ── Derived totals ───────────────────────────────────────────────
    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.total_credits ?? 0), 0),
        [cartItems],
    );

    const balanceAfter  = walletBalance - subtotal;
    const insufficient  = balanceAfter < 0;
    const hasItems      = cartItems.length > 0;

    // ── Handlers ────────────────────────────────────────────────────

    const handleRemoveConfirm = () => {
        if (!removeTarget) return;
        setRemoving(true);

        router.delete(route('client.cart.remove', removeTarget.cart_item_id), {
            preserveScroll: true,
            onSuccess: () => {
                message.success('Item removed from cart');
                setRemoveTarget(null);
            },
            onError: () => message.error('Failed to remove item. Please try again.'),
            onFinish: () => setRemoving(false),
        });
    };

    const handleClearAll = () => {
        setClearing(true);

        router.delete(route('client.cart.clear'), {
            onSuccess: () => message.success('Cart cleared'),
            onError:   () => message.error('Failed to clear cart. Please try again.'),
            onFinish:  () => setClearing(false),
        });
    };

    const handleCheckout = () => {
        router.visit(route('client.checkout.index'));
    };

    // ── Render ───────────────────────────────────────────────────────

    return (
        <ClientLayout
            breadcrumbs={[
                { title: 'Home' },
                { title: 'Cart' },
            ]}
        >
            <Head title="My Cart" />

            <PageHeader
                title="My Cart"
                breadcrumbs={[
                    { label: 'Home', href: route('client.dashboard') },
                    { label: 'Cart' },
                ]}
            />

            <div className="grid grid-cols-12 gap-6">

                {/* ════════════════════════════════════════════════════
                    LEFT COLUMN — cart items
                ════════════════════════════════════════════════════ */}
                <div className="col-span-12 xl:col-span-8">

                    {!hasItems ? (
                        <EmptyState
                            icon={<ShoppingCartOutlined />}
                            title="Your cart is empty"
                            description="Browse our services and add something you need."
                            action={
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => router.visit('/client/services')}
                                >
                                    Browse Services
                                </Button>
                            }
                        />
                    ) : (
                        <>
                            {/* Item cards */}
                            {cartItems.map((item) => (
                                <CartItemCard
                                    key={item.cart_item_id}
                                    item={item}
                                    onRemove={setRemoveTarget}
                                />
                            ))}

                            {/* Clear All */}
                            <div className="flex justify-end mt-2">
                                <Popconfirm
                                    title="Clear cart"
                                    description="Remove all items from your cart?"
                                    onConfirm={handleClearAll}
                                    okText="Yes, clear all"
                                    cancelText="Cancel"
                                    okButtonProps={{ danger: true, loading: clearing }}
                                    placement="topRight"
                                >
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        loading={clearing}
                                    >
                                        Clear All
                                    </Button>
                                </Popconfirm>
                            </div>
                        </>
                    )}
                </div>

                {/* ════════════════════════════════════════════════════
                    RIGHT COLUMN — order summary (sticky)
                ════════════════════════════════════════════════════ */}
                <div className="col-span-12 xl:col-span-4">
                    <div className="sticky top-6">
                        <Card
                            title="Order Summary"
                            className="shadow-md border-gray-100 rounded-lg"
                            styles={{ header: { fontWeight: 700, fontSize: 16 } }}
                        >
                            {/* Per-item breakdown */}
                            {hasItems ? (
                                <div className="space-y-2 mb-1">
                                    {cartItems.map((item) => (
                                        <div
                                            key={item.cart_item_id}
                                            className="flex justify-between items-center gap-2"
                                        >
                                            <Text
                                                className="text-sm text-gray-700 flex-1 truncate"
                                                title={item.service_name}
                                            >
                                                {item.service_name}
                                            </Text>
                                            <Text strong className="text-sm whitespace-nowrap">
                                                {item.total_credits} cr
                                            </Text>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Text type="secondary" className="block text-sm mb-1">
                                    No items in cart
                                </Text>
                            )}

                            <Divider className="my-3" />

                            {/* Subtotal + Total */}
                            <div className="space-y-2 mb-1">
                                <div className="flex justify-between">
                                    <Text className="text-gray-600">Subtotal</Text>
                                    <Text strong>{subtotal} Credits</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text className="text-gray-600">Total</Text>
                                    <Text strong className="text-blue-600 text-base">
                                        {subtotal} Credits
                                    </Text>
                                </div>
                            </div>

                            <Divider className="my-3" />

                            {/* Wallet info */}
                            <div className="space-y-2 mb-1">
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-1 text-gray-500 text-sm">
                                        <WalletOutlined />
                                        <span>Wallet Balance</span>
                                    </span>
                                    <Text type="secondary" className="text-sm">
                                        {walletBalance} Credits
                                    </Text>
                                </div>
                                <div className="flex justify-between items-center">
                                    <Text className="text-gray-500 text-sm">Balance After Checkout</Text>
                                    <Text
                                        strong
                                        className={`text-sm ${insufficient ? 'text-red-500' : 'text-emerald-600'}`}
                                    >
                                        {balanceAfter} Credits
                                    </Text>
                                </div>
                            </div>

                            <Divider className="my-3" />

                            {/* Proceed to Checkout */}
                            <Tooltip
                                title={insufficient ? 'Insufficient wallet balance' : ''}
                                placement="top"
                            >
                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    disabled={insufficient || !hasItems}
                                    icon={<ArrowRightOutlined />}
                                    onClick={handleCheckout}
                                    className="mb-3"
                                >
                                    Proceed to Checkout
                                </Button>
                            </Tooltip>

                            {/* Top Up link — shown only when balance is insufficient */}
                            {insufficient && (
                                <div className="text-center mb-3">
                                    <Button
                                        type="link"
                                        icon={<WalletOutlined />}
                                        onClick={() => router.visit(route('client.wallet.index'))}
                                        className="text-amber-600 hover:text-amber-500"
                                    >
                                        Top Up Wallet
                                    </Button>
                                </div>
                            )}

                            {/* Continue Shopping */}
                            <div className="text-center">
                                <Button
                                    type="link"
                                    onClick={() => router.visit(route('client.services.index'))}
                                    className="text-gray-500 hover:text-blue-600"
                                >
                                    ← Continue Shopping
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

            </div>

            {/* ── Remove item confirmation modal ───────────────────── */}
            <ConfirmModal
                open={!!removeTarget}
                onCancel={() => setRemoveTarget(null)}
                onConfirm={handleRemoveConfirm}
                title="Remove from Cart"
                description={
                    removeTarget
                        ? `Remove "${removeTarget.service_name}" from your cart?`
                        : 'Remove this service from cart?'
                }
                danger
                loading={removing}
            />

        </ClientLayout>
    );
}
