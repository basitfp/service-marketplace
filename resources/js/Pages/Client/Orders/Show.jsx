import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Alert, Avatar, Button, Card, Collapse, Divider,
    List, Modal, Rate, Tag, Typography, Upload, Input, Space,
} from 'antd';
import {
    UserOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    WalletOutlined,
    CalendarOutlined,
    DownloadOutlined,
    FileOutlined,
    FilePdfOutlined,
    FileImageOutlined,
    FileZipOutlined,
    PaperClipOutlined,
    SendOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';
import StatusBadge from '@/Components/Common/StatusBadge';
import EmptyState from '@/Components/Common/EmptyState';
import { BentoGrid, BentoCell } from '@/Components/Common/BentoGrid';

dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

// ── Helpers ──────────────────────────────────────────────────────────────────

const normalizeStatus = (status) =>
    !status ? '' : typeof status === 'string' ? status : (status?.value ?? '');

const formatDate = (value) =>
    value ? dayjs(value).format('MMM D, YYYY') : '—';

const relativeDate = (value) =>
    value ? dayjs(value).fromNow() : '—';

const estimatedDelivery = (order) => {
    if (!order.created_at || !order.service?.delivery_days) return '—';
    return dayjs(order.created_at)
        .add(order.service.delivery_days, 'day')
        .format('MMM D, YYYY');
};

// Mime-type → icon
const fileIcon = (mimeType = '') => {
    if (mimeType.startsWith('image/'))        return <FileImageOutlined className="text-blue-400 text-lg" />;
    if (mimeType === 'application/pdf')        return <FilePdfOutlined   className="text-red-400 text-lg" />;
    if (mimeType.includes('zip') || mimeType.includes('compressed'))
                                               return <FileZipOutlined   className="text-yellow-500 text-lg" />;
    return <FileOutlined className="text-gray-400 text-lg" />;
};

// Role badge colour
const roleBadgeColor = (role) => {
    if (!role) return 'default';
    const r = typeof role === 'string' ? role : (role?.value ?? '');
    return r === 'admin' ? 'red' : r === 'worker' ? 'blue' : 'green';
};

const initials = (name = '') =>
    name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

// Status description shown below the badge
const STATUS_DESCRIPTIONS = {
    pending:            'Your order is in the queue. A worker will be assigned shortly.',
    assigned:           'A worker has been assigned and will begin soon.',
    in_progress:        'Your order is currently being worked on.',
    submitted:          'Your deliverable is ready for review!',
    revision_requested: 'Revision has been requested.',
    completed:          'This order is complete.',
    cancelled:          'This order was cancelled.',
};

const cardClass = 'shadow-sm border-gray-100 rounded-lg';

// ── Section 1 sub-cards ───────────────────────────────────────────────────────

function OrderInfoCard({ order, status }) {
    const description = STATUS_DESCRIPTIONS[status] ?? '';

    return (
        <Card title="Order Info" className={`${cardClass} h-full`}>
            <div className="mb-4">
                <StatusBadge status={status} />
                {description && (
                    <Text className="block text-sm text-gray-500 mt-2 leading-snug">
                        {description}
                    </Text>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <WalletOutlined /><span>Credits Used</span>
                    </span>
                    <Text strong className="text-blue-600 text-sm">{order.credits_used} Credits</Text>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <CalendarOutlined /><span>Date Placed</span>
                    </span>
                    <Text className="text-sm text-gray-700">{formatDate(order.created_at)}</Text>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <ClockCircleOutlined /><span>Est. Delivery</span>
                    </span>
                    <Text className="text-sm text-gray-700">{estimatedDelivery(order)}</Text>
                </div>
            </div>

            {order.notes && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <Text strong className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Notes</Text>
                    <Text className="text-sm text-gray-700 leading-relaxed">{order.notes}</Text>
                </div>
            )}

            {status === 'cancelled' && order.cancellation_reason && (
                <div className="mt-4 bg-red-50 rounded-lg p-3 border border-red-100">
                    <Text strong className="block text-xs text-red-500 mb-1 uppercase tracking-wide">
                        Cancellation Reason
                    </Text>
                    <Text className="text-sm text-red-700 leading-relaxed">
                        {order.cancellation_reason}
                    </Text>
                </div>
            )}
        </Card>
    );
}

function WorkerInfoCard({ worker }) {
    if (!worker) {
        return (
            <Card title="Worker" className={`${cardClass} h-full`}>
                <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                    <Avatar size={64} icon={<UserOutlined />} className="bg-gray-200 text-gray-400" />
                    <Text strong className="text-gray-700">Worker not assigned yet</Text>
                    <Text type="secondary" className="text-xs max-w-xs">
                        You will be notified when a worker is assigned.
                    </Text>
                </div>
            </Card>
        );
    }

    const bio = worker.worker_profile?.bio ?? '';
    const bioPreview = bio.length > 100 ? `${bio.slice(0, 100)}…` : bio;

    return (
        <Card title="Worker" className={`${cardClass} h-full`}>
            <div className="flex items-center gap-3 mb-3">
                <Avatar
                    size={56}
                    src={worker.profile_photo ? `/storage/${worker.profile_photo}` : null}
                    className="bg-blue-500 flex-shrink-0"
                >
                    {initials(worker.name)}
                </Avatar>
                <div className="min-w-0">
                    <Text strong className="block text-gray-800 text-base leading-tight">{worker.name}</Text>
                    {worker.email && (
                        <Text type="secondary" className="text-xs truncate block">{worker.email}</Text>
                    )}
                </div>
            </div>
            {bioPreview && (
                <Text className="block text-sm text-gray-500 leading-relaxed">{bioPreview}</Text>
            )}
        </Card>
    );
}

function ServiceDetailsCard({ order }) {
    const service = order.service ?? {};
    const category = service.category ?? null;

    const selectionsByStep = (order.selections ?? []).reduce((acc, sel) => {
        const key = sel.step_name ?? 'Other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(sel);
        return acc;
    }, {});

    return (
        <Card title="Service" className={`${cardClass} h-full`} styles={{ body: { padding: 0 } }}>
            <div className="w-full overflow-hidden bg-slate-100" style={{ maxHeight: 128 }}>
                {service.image ? (
                    <img
                        src={`/storage/${service.image}`}
                        alt={service.name}
                        className="w-full object-cover"
                        style={{ maxHeight: 128 }}
                    />
                ) : (
                    <div
                        className="w-full flex items-center justify-center bg-slate-100 text-slate-300 text-4xl"
                        style={{ height: 96 }}
                    >
                        🛠
                    </div>
                )}
            </div>

            <div className="p-4">
                <Title level={5} className="!mb-2 text-gray-800">{service.name ?? '—'}</Title>

                {category?.name && <Tag color="cyan" className="mb-3">{category.name}</Tag>}

                <div className="flex gap-4 mb-4">
                    {service.delivery_days != null && (
                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <ClockCircleOutlined />
                            <span>{service.delivery_days} day{service.delivery_days !== 1 ? 's' : ''}</span>
                        </span>
                    )}
                    {service.revisions != null && (
                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <ReloadOutlined />
                            <span>{service.revisions} free revision{service.revisions !== 1 ? 's' : ''}</span>
                        </span>
                    )}
                </div>

                {Object.keys(selectionsByStep).length > 0 && (
                    <div>
                        <Text strong className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                            Selected Options
                        </Text>
                        <div className="space-y-1">
                            {Object.entries(selectionsByStep).map(([stepName, sels]) =>
                                sels.map((sel, i) => (
                                    <div key={`${stepName}-${i}`} className="flex justify-between items-center">
                                        <Text className="text-xs text-gray-600 flex-1 min-w-0 pr-2 truncate">
                                            <span className="font-medium">{stepName}:</span> {sel.option_label}
                                        </Text>
                                        {(sel.credit_cost ?? 0) > 0 && (
                                            <Text className="text-xs text-green-600 whitespace-nowrap flex-shrink-0">
                                                +{sel.credit_cost} cr
                                            </Text>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

// ── Section 2 — Reference Assets ─────────────────────────────────────────────

function ReferenceAssetsCard({ order, status }) {
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList]   = useState([]);

    const referenceAssets = (order.assets ?? []).filter((a) => a.type === 'reference');
    const locked = status === 'completed' || status === 'cancelled';

    const handleUpload = () => {
        if (!fileList.length) return;
        setUploading(true);

        const formData = new FormData();
        fileList.forEach((f) => formData.append('files[]', f.originFileObj));

        router.post(
            `/client/orders/${order.id}/assets`,
            formData,
            {
                preserveScroll: true,
                onSuccess: () => setFileList([]),
                onFinish:  () => setUploading(false),
            },
        );
    };

    const uploadProps = {
        multiple: true,
        maxCount: 10,
        fileList,
        beforeUpload: () => false, // manual submit
        onChange: ({ fileList: fl }) => setFileList(fl),
    };

    return (
        <Card
            title="Reference Files"
            className={cardClass}
            extra={
                !locked && (
                    <Upload {...uploadProps} showUploadList={false}>
                        <Button
                            size="small"
                            icon={<PlusOutlined />}
                            loading={uploading}
                            onClick={fileList.length ? handleUpload : undefined}
                        >
                            {fileList.length ? `Upload ${fileList.length} file${fileList.length > 1 ? 's' : ''}` : 'Add Files'}
                        </Button>
                    </Upload>
                )
            }
        >
            {referenceAssets.length === 0 ? (
                <EmptyState
                    icon={<FileOutlined />}
                    title="No reference files attached"
                />
            ) : (
                <List
                    dataSource={referenceAssets}
                    renderItem={(asset) => (
                        <List.Item
                            actions={[
                                <a
                                    key="dl"
                                    href={route('client.orders.assets.download', { order: order.id, asset: asset.id })}
                                >
                                    <Button size="small" icon={<DownloadOutlined />}>Download</Button>
                                </a>,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={fileIcon(asset.mime_type)}
                                title={
                                    <Text className="text-sm text-gray-800">
                                        {asset.original_name}
                                    </Text>
                                }
                                description={
                                    <Text type="secondary" className="text-xs">
                                        {asset.mime_type ?? 'Unknown type'}
                                    </Text>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </Card>
    );
}

// ── Section 3 — Deliverable Files ────────────────────────────────────────────

function DeliverableFilesCard({ assets, orderId }) {
    const deliverables = (assets ?? []).filter((a) => a.type === 'deliverable');
    if (!deliverables.length) return null;

    return (
        <Card
            title="Deliverable Files"
            className={cardClass}
            style={{ borderTop: '3px solid #10B981' }}
        >
            <Alert
                type="info"
                showIcon
                message="Please review the files below before approving."
                className="mb-4"
            />
            <List
                dataSource={deliverables}
                renderItem={(asset) => (
                    <List.Item
                        actions={[
                            <a
                                key="dl"
                                href={route('client.orders.assets.download', { order: orderId, asset: asset.id })}
                            >
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<DownloadOutlined />}
                                >
                                    Download
                                </Button>
                            </a>,
                        ]}
                    >
                        <List.Item.Meta
                            avatar={fileIcon(asset.mime_type)}
                            title={
                                <Text strong className="text-sm text-gray-800">
                                    {asset.original_name}
                                </Text>
                            }
                            description={
                                <Text type="secondary" className="text-xs">
                                    {asset.mime_type ?? 'Unknown type'}
                                </Text>
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
}

// ── Section 4 — Comments Thread ──────────────────────────────────────────────

function CommentsCard({ order }) {
    const [content, setContent]   = useState('');
    const [fileList, setFileList] = useState([]);
    const [posting, setPosting]   = useState(false);

    // comments may be a paginated object (from controller) or a plain array
    const commentList = Array.isArray(order.comments)
        ? order.comments
        : (order.comments?.data ?? []);

    const handlePost = () => {
        if (!content.trim()) return;
        setPosting(true);

        const formData = new FormData();
        formData.append('content', content.trim());
        fileList.forEach((f) => formData.append('files[]', f.originFileObj));

        router.post(
            route('client.orders.comments.store', order.id),
            formData,
            {
                preserveScroll: true,
                onSuccess: () => { setContent(''); setFileList([]); },
                onFinish:  () => setPosting(false),
            },
        );
    };

    const uploadProps = {
        multiple: true,
        maxCount: 5,
        fileList,
        beforeUpload: () => false,
        onChange: ({ fileList: fl }) => setFileList(fl),
    };

    // Comment-type assets grouped by comment  — not directly linked in the
    // model, so we surface all comment-type assets below the thread as a
    // simple flat list.
    const commentAssets = (order.assets ?? []).filter((a) => a.type === 'comment');

    return (
        <Card title="Comments & Communication" className={cardClass}>

            {/* ── Comment list ── */}
            {commentList.length === 0 ? (
                <Text type="secondary" className="block text-sm mb-4">
                    No comments yet. Start the conversation below.
                </Text>
            ) : (
                <div className="mb-6">
                    {commentList.map((comment, index) => {
                        const roleStr = typeof comment.user?.role === 'string'
                            ? comment.user.role
                            : (comment.user?.role?.value ?? '');

                        return (
                            <div key={comment.id}>
                                <div className="flex gap-3 py-3">
                                    {/* Avatar */}
                                    <Avatar
                                        size={36}
                                        src={
                                            comment.user?.profile_photo
                                                ? `/storage/${comment.user.profile_photo}`
                                                : null
                                        }
                                        className="flex-shrink-0 bg-blue-500"
                                    >
                                        {initials(comment.user?.name ?? '')}
                                    </Avatar>

                                    {/* Body */}
                                    <div className="flex-1 min-w-0">
                                        {/* Header row */}
                                        <Space size="small" className="mb-1 flex-wrap">
                                            <Text strong className="text-sm text-gray-800">
                                                {comment.user?.name ?? 'Unknown'}
                                            </Text>
                                            {roleStr && (
                                                <Tag
                                                    color={roleBadgeColor(roleStr)}
                                                    className="m-0 text-xs capitalize"
                                                >
                                                    {roleStr}
                                                </Tag>
                                            )}
                                            <Text type="secondary" className="text-xs">
                                                {relativeDate(comment.created_at)}
                                            </Text>
                                        </Space>

                                        {/* Comment text */}
                                        <Paragraph className="mb-0 text-sm text-gray-700 whitespace-pre-line">
                                            {comment.content}
                                        </Paragraph>
                                    </div>
                                </div>

                                {index < commentList.length - 1 && (
                                    <Divider className="my-0" />
                                )}
                            </div>
                        );
                    })}

                    {/* Comment-type file attachments */}
                    {commentAssets.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <Text strong className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                                Attachments
                            </Text>
                            {commentAssets.map((asset) => (
                                <div key={asset.id} className="flex items-center gap-2 py-1">
                                    {fileIcon(asset.mime_type)}
                                    <Text className="text-xs text-gray-700 flex-1 truncate">
                                        {asset.original_name}
                                    </Text>
                                    <a
                                        href={`/storage/${asset.file_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        download
                                    >
                                        <Button type="text" size="small" icon={<DownloadOutlined />} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── New comment form ── */}
            <div className="border-t border-gray-100 pt-4">
                <TextArea
                    rows={3}
                    placeholder="Write a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={5000}
                    showCount
                    className="mb-3"
                />

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Upload {...uploadProps}>
                        <Button size="small" icon={<PaperClipOutlined />}>
                            Attach Files {fileList.length > 0 && `(${fileList.length})`}
                        </Button>
                    </Upload>

                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        loading={posting}
                        disabled={!content.trim()}
                        onClick={handlePost}
                    >
                        Post Comment
                    </Button>
                </div>
            </div>
        </Card>
    );
}

// ── Section 5 — Revision History ─────────────────────────────────────────────

function RevisionHistoryCard({ revisions = [] }) {
    if (!revisions.length) return null;

    const items = revisions.map((rev, index) => ({
        key: String(rev.id),
        label: (
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                    Revision #{index + 1} — {formatDate(rev.created_at)}
                </span>
                <StatusBadge status={normalizeStatus(rev.status)} />
            </div>
        ),
        children: (
            <Paragraph className="mb-0 text-sm text-gray-700 whitespace-pre-line">
                {rev.message}
            </Paragraph>
        ),
    }));

    return (
        <Card title="Revision History" className={cardClass}>
            <Collapse items={items} />
        </Card>
    );
}

// ── Section 6 — Escalation ───────────────────────────────────────────────────

function EscalationCard({ escalations = [] }) {
    // Take only the most recent escalation (there should only ever be one per order)
    const escalation = escalations.length > 0 ? escalations[0] : null;
    const escStatus  = escalation
        ? (typeof escalation.status === 'string' ? escalation.status : (escalation.status?.value ?? ''))
        : null;

    return (
        <Card title="Escalation" className={cardClass}>
            {!escalation ? (
                <EmptyState
                    icon={<ExclamationCircleOutlined />}
                    title="No escalation filed for this order."
                    description="If you have a serious issue, use the 'Escalate Order' button in the action bar below."
                />
            ) : escStatus === 'open' ? (
                <div className="space-y-3">
                    <Alert
                        type="warning"
                        showIcon
                        icon={<WarningOutlined />}
                        message={<Text strong>Escalation Under Review</Text>}
                        description={
                            <Text className="text-sm text-gray-700 whitespace-pre-line">
                                {escalation.message}
                            </Text>
                        }
                    />
                    <div className="flex justify-between items-center px-1">
                        <Text type="secondary" className="text-xs">
                            Date filed:
                        </Text>
                        <Text className="text-xs text-gray-600">
                            {formatDate(escalation.created_at)}
                        </Text>
                    </div>
                    <Text type="secondary" className="block text-sm">
                        Our team is reviewing your escalation.
                    </Text>
                </div>
            ) : escStatus === 'resolved' ? (
                <div className="space-y-3">
                    <Alert
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                        message={<Text strong>Escalation Resolved</Text>}
                        description={
                            <Text className="text-sm text-gray-700 whitespace-pre-line">
                                {escalation.message}
                            </Text>
                        }
                    />
                    {escalation.resolution_notes && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <Text strong className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                                Resolution Notes
                            </Text>
                            <Text className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {escalation.resolution_notes}
                            </Text>
                        </div>
                    )}
                    <div className="flex justify-between items-center px-1">
                        <Text type="secondary" className="text-xs">Resolved at:</Text>
                        <Text className="text-xs text-gray-600">
                            {formatDate(escalation.resolved_at)}
                        </Text>
                    </div>
                </div>
            ) : (
                // Fallback for any other status
                <Text type="secondary" className="text-sm">
                    Escalation status: {escStatus ?? 'unknown'}
                </Text>
            )}
        </Card>
    );
}

function ApproveModal({ open, onClose, orderId }) {
    const [rating,     setRating]     = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleConfirm = () => {
        if (!rating) return;
        setSubmitting(true);
        router.post(
            route('client.orders.complete', orderId),
            { rating, review_text: reviewText || null },
            {
                onError:  () => setSubmitting(false),
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const handleClose = () => {
        setRating(0);
        setReviewText('');
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            title="Approve & Complete Order"
            centered
            footer={[
                <Button key="cancel" onClick={handleClose}>Cancel</Button>,
                <Button
                    key="confirm"
                    type="primary"
                    style={{ background: '#10B981', borderColor: '#10B981' }}
                    icon={<CheckCircleOutlined />}
                    loading={submitting}
                    disabled={!rating}
                    onClick={handleConfirm}
                >
                    Complete Order
                </Button>,
            ]}
        >
            <div className="py-2 space-y-4">
                <div>
                    <Text strong className="block mb-2">Your Rating <span className="text-red-500">*</span></Text>
                    <Rate value={rating} onChange={setRating} style={{ fontSize: 28 }} />
                    {!rating && (
                        <Text type="secondary" className="block text-xs mt-1">
                            Please select a rating to continue.
                        </Text>
                    )}
                </div>
                <div>
                    <Text strong className="block mb-2">Review (optional)</Text>
                    <TextArea
                        rows={4}
                        placeholder="Share your experience..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        maxLength={1000}
                        showCount
                    />
                </div>
            </div>
        </Modal>
    );
}

// ── Modal: Request Revision ───────────────────────────────────────────────────

function RevisionModal({ open, onClose, order, walletBalance }) {
    const [message,    setMessage]    = useState('');
    const [fileList,   setFileList]   = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const service          = order.service ?? {};
    const usedRevisions    = (order.revisions ?? []).length;
    const freeRevisions    = service.revisions ?? 0;
    const extraCost        = service.extra_revision_cost ?? 0;
    const isPaidRevision   = usedRevisions >= freeRevisions && extraCost > 0;
    const cannotAfford     = isPaidRevision && walletBalance < extraCost;

    const handleConfirm = () => {
        if (message.trim().length < 20 || cannotAfford) return;
        setSubmitting(true);

        const formData = new FormData();
        formData.append('message', message.trim());
        fileList.forEach((f) => formData.append('files[]', f.originFileObj));

        router.post(
            route('client.orders.request-revision', order.id),
            formData,
            {
                onError:  () => setSubmitting(false),
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const handleClose = () => {
        setMessage('');
        setFileList([]);
        onClose();
    };

    const uploadProps = {
        multiple:    true,
        maxCount:    5,
        fileList,
        beforeUpload: () => false,
        onChange:    ({ fileList: fl }) => setFileList(fl),
    };

    const msgTooShort = message.trim().length > 0 && message.trim().length < 20;

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            title="Request Revision"
            centered
            footer={[
                <Button key="cancel" onClick={handleClose}>Cancel</Button>,
                <Button
                    key="confirm"
                    type="primary"
                    loading={submitting}
                    disabled={message.trim().length < 20 || cannotAfford}
                    onClick={handleConfirm}
                >
                    Request Revision
                </Button>,
            ]}
        >
            <div className="py-2 space-y-4">
                {/* Paid revision warning */}
                {isPaidRevision && (
                    <div>
                        <Alert
                            type="warning"
                            showIcon
                            message={
                                <span>
                                    This revision will cost{' '}
                                    <strong>{extraCost} Credits</strong>.
                                </span>
                            }
                        />
                        <div className="mt-2 flex justify-between items-center px-1">
                            <Text type="secondary" className="text-sm">
                                Your wallet balance:
                            </Text>
                            <Text
                                strong
                                className={`text-sm ${cannotAfford ? 'text-red-500' : 'text-emerald-600'}`}
                            >
                                {walletBalance} Credits
                            </Text>
                        </div>
                        {cannotAfford && (
                            <Alert
                                type="error"
                                showIcon
                                className="mt-2"
                                message="Insufficient balance to request a paid revision."
                            />
                        )}
                    </div>
                )}

                {/* Message */}
                <div>
                    <Text strong className="block mb-2">
                        Revision Details <span className="text-red-500">*</span>
                    </Text>
                    <TextArea
                        rows={4}
                        placeholder="Please explain what needs to be revised... (min 20 characters)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={2000}
                        showCount
                        status={msgTooShort ? 'error' : ''}
                    />
                    {msgTooShort && (
                        <Text type="danger" className="text-xs">
                            Minimum 20 characters required.
                        </Text>
                    )}
                </div>

                {/* File attach */}
                <div>
                    <Text strong className="block mb-2">Attach Files (optional)</Text>
                    <Upload {...uploadProps}>
                        <Button icon={<PaperClipOutlined />} size="small">
                            Attach Files {fileList.length > 0 && `(${fileList.length})`}
                        </Button>
                    </Upload>
                </div>
            </div>
        </Modal>
    );
}

// ── Modal: Escalate Order ─────────────────────────────────────────────────────

function EscalateModal({ open, onClose, orderId }) {
    const [message,    setMessage]    = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleConfirm = () => {
        if (!message.trim()) return;
        setSubmitting(true);
        router.post(
            route('client.orders.escalate', orderId),
            { message: message.trim() },
            {
                onError:  () => setSubmitting(false),
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const handleClose = () => {
        setMessage('');
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            title="Escalate Order"
            centered
            footer={[
                <Button key="cancel" onClick={handleClose}>Cancel</Button>,
                <Button
                    key="confirm"
                    danger
                    loading={submitting}
                    disabled={!message.trim()}
                    onClick={handleConfirm}
                >
                    Submit Escalation
                </Button>,
            ]}
        >
            <div className="py-2 space-y-4">
                <Alert
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    message="Escalation is for serious issues. For general feedback, use comments."
                />
                <div>
                    <Text strong className="block mb-2">
                        Describe the issue <span className="text-red-500">*</span>
                    </Text>
                    <TextArea
                        rows={4}
                        placeholder="Describe the issue in detail..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={2000}
                        showCount
                    />
                </div>
            </div>
        </Modal>
    );
}

// ── Sticky Action Bar ─────────────────────────────────────────────────────────

function StickyActionBar({ order, status, walletBalance }) {
    const [approveOpen,  setApproveOpen]  = useState(false);
    const [revisionOpen, setRevisionOpen] = useState(false);
    const [escalateOpen, setEscalateOpen] = useState(false);

    // Hide bar entirely for terminal statuses
    if (status === 'completed' || status === 'cancelled') return null;

    const hasOpenEscalation = (order.escalations ?? []).some(
        (e) => (typeof e.status === 'string' ? e.status : e.status?.value) === 'open',
    );

    return (
        <>
            {/* ── Fixed bar ── */}
            <div
                className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-6 py-3 flex items-center justify-end gap-3"
            >
                {/* Submitted → approve / revision */}
                {status === 'submitted' && (
                    <>
                        <Button
                            size="large"
                            icon={<ReloadOutlined />}
                            onClick={() => setRevisionOpen(true)}
                        >
                            Request Revision
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            style={{ background: '#10B981', borderColor: '#10B981' }}
                            icon={<CheckCircleOutlined />}
                            onClick={() => setApproveOpen(true)}
                        >
                            Approve & Complete
                        </Button>
                    </>
                )}

                {/* Non-terminal, non-submitted → escalate (if no open escalation) */}
                {status !== 'submitted' && !hasOpenEscalation && (
                    <Button
                        danger
                        size="large"
                        icon={<ExclamationCircleOutlined />}
                        onClick={() => setEscalateOpen(true)}
                    >
                        Escalate Order
                    </Button>
                )}
            </div>

            {/* ── Modals ── */}
            <ApproveModal
                open={approveOpen}
                onClose={() => setApproveOpen(false)}
                orderId={order.id}
            />
            <RevisionModal
                open={revisionOpen}
                onClose={() => setRevisionOpen(false)}
                order={order}
                walletBalance={walletBalance}
            />
            <EscalateModal
                open={escalateOpen}
                onClose={() => setEscalateOpen(false)}
                orderId={order.id}
            />
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Show({ order, walletBalance = 0 }) {
    const status = normalizeStatus(order.status);

    return (
        <ClientLayout
            breadcrumbs={[
                { title: 'Home' },
                { title: 'My Orders' },
                { title: `Order #${order.id}` },
            ]}
        >
            <Head title={`Order #${order.id}`} />

            <PageHeader
                title={`Order #${order.id}`}
                breadcrumbs={[
                    { label: 'Home',      href: route('client.dashboard') },
                    { label: 'My Orders', href: route('client.orders.index') },
                    { label: `Order #${order.id}` },
                ]}
            />

            {/* Extra bottom padding so content isn't hidden behind the sticky bar */}
            <div className="pb-24">
                <BentoGrid cols={12} gap={6}>

                    {/* ══════════════════════════════════════════════════
                        SECTION 1 — Order Info / Worker / Service
                    ══════════════════════════════════════════════════ */}
                    <BentoCell span={4}>
                        <OrderInfoCard order={order} status={status} />
                    </BentoCell>

                    <BentoCell span={4}>
                        <WorkerInfoCard worker={order.worker ?? null} />
                    </BentoCell>

                    <BentoCell span={4}>
                        <ServiceDetailsCard order={order} />
                    </BentoCell>

                    {/* ══════════════════════════════════════════════════
                        SECTION 2 — Reference Assets
                    ══════════════════════════════════════════════════ */}
                    <BentoCell span={12}>
                        <ReferenceAssetsCard order={order} status={status} />
                    </BentoCell>

                    {/* ══════════════════════════════════════════════════
                        SECTION 3 — Deliverable Files (conditional)
                    ══════════════════════════════════════════════════ */}
                    <BentoCell span={12}>
                        <DeliverableFilesCard assets={order.assets ?? []} orderId={order.id} />
                    </BentoCell>

                    {/* ══════════════════════════════════════════════════
                        SECTION 4 — Comments Thread
                    ══════════════════════════════════════════════════ */}
                    <BentoCell span={12}>
                        <CommentsCard order={order} />
                    </BentoCell>

                    {/* ══════════════════════════════════════════════════
                        SECTION 5 — Revision History (conditional)
                    ══════════════════════════════════════════════════ */}
                    <BentoCell span={12}>
                        <RevisionHistoryCard revisions={order.revisions ?? []} />
                    </BentoCell>

                    {/* ══════════════════════════════════════════════════
                        SECTION 6 — Escalation
                    ══════════════════════════════════════════════════ */}
                    <BentoCell span={12}>
                        <EscalationCard escalations={order.escalations ?? []} />
                    </BentoCell>

                </BentoGrid>
            </div>

            {/* ══════════════════════════════════════════════════
                SECTION 6 — Sticky Action Bar
            ══════════════════════════════════════════════════ */}
            <StickyActionBar
                order={order}
                status={status}
                walletBalance={walletBalance}
            />

        </ClientLayout>
    );
}
