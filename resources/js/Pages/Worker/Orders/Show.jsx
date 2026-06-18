import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, Descriptions, Divider, Upload, Button, Alert, Input, message, Tag } from 'antd';
import { InboxOutlined, DownloadOutlined, SendOutlined } from '@ant-design/icons';
import WorkerLayout from '@/Layouts/WorkerLayout';
import PageHeader from '@/Components/Common/PageHeader';
import { BentoGrid, BentoCell } from '@/Components/Common/BentoGrid';
import StatusBadge from '@/Components/Common/StatusBadge';
import EmptyState from '@/Components/Common/EmptyState';

const { Dragger } = Upload;
const { TextArea } = Input;

export default function Show({ order }) {
    const [deliveryFiles, setDeliveryFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [commentAttachments, setCommentAttachments] = useState([]);

    const canSubmitDelivery = ['assigned', 'in_progress', 'revision_requested'].includes(order.status);
    const deliverySubmitted = ['submitted', 'completed'].includes(order.status);

    const handleSubmitDelivery = async () => {
        if (deliveryFiles.length === 0) {
            message.error('Please select at least one file');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        deliveryFiles.forEach((file) => {
            formData.append('files[]', file.originFileObj);
        });

        try {
            await router.post(route('worker.orders.submit-delivery', order.id), formData, {
                onSuccess: () => {
                    message.success('Delivery submitted successfully!');
                    setDeliveryFiles([]);
                },
                onError: () => {
                    message.error('Failed to submit delivery');
                },
                onFinish: () => setUploading(false),
            });
        } catch (error) {
            message.error('An error occurred');
            setUploading(false);
        }
    };

    const handleCommentSubmit = () => {
        if (!commentContent.trim()) {
            message.error('Please enter a comment');
            return;
        }

        const formData = new FormData();
        formData.append('content', commentContent);
        commentAttachments.forEach((file) => {
            formData.append('attachments[]', file.originFileObj);
        });

        router.post(route('worker.orders.comments.store', order.id), formData, {
            onSuccess: () => {
                message.success('Comment posted');
                setCommentContent('');
                setCommentAttachments([]);
            },
        });
    };

    const uploadProps = {
        multiple: true,
        maxCount: 10,
        fileList: deliveryFiles,
        beforeUpload: () => false,
        onChange: ({ fileList }) => setDeliveryFiles(fileList),
        accept: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,video/*',
    };

    const commentUploadProps = {
        multiple: true,
        maxCount: 5,
        fileList: commentAttachments,
        beforeUpload: () => false,
        onChange: ({ fileList }) => setCommentAttachments(fileList),
    };

    return (
        <WorkerLayout breadcrumbs={[
            { label: 'My Orders', href: route('worker.orders.index') },
            { label: `Order #${order.id}` }
        ]}>
            <Head title={`Order #${order.id} — ${order.service.name}`} />

            <PageHeader title={`Order #${order.id} — ${order.service.name}`} />

            <BentoGrid cols={12}>
                {/* SECTION 1 - Order Info */}
                <BentoCell span={4}>
                    <Card title="Order Information" className="h-full">
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-600">Status:</span>
                                <div className="mt-1">
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600">Date Assigned:</span>
                                <div className="font-medium">{order.date_assigned}</div>
                            </div>
                            <div>
                                <span className="text-gray-600">Deadline:</span>
                                <div className={`font-medium ${order.is_overdue ? 'text-red-600' : ''}`}>
                                    {order.deadline}
                                    {order.is_overdue && <Tag color="red" className="ml-2">Overdue</Tag>}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600">Job Value:</span>
                                <div className="font-semibold text-blue-600">{order.credits_used} Credits</div>
                            </div>
                            {order.notes && (
                                <>
                                    <Divider className="my-3" />
                                    <div>
                                        <span className="text-gray-600 font-medium">Client Notes:</span>
                                        <div className="mt-1 text-gray-700 italic bg-gray-50 p-2 rounded">
                                            {order.notes}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </BentoCell>

                {/* Service Configuration */}
                <BentoCell span={8}>
                    <Card title="Service Configuration" className="h-full">
                        <div className="mb-4">
                            <span className="text-lg font-semibold">{order.service.name}</span>
                            <Tag color="blue" className="ml-2">{order.service.category}</Tag>
                        </div>

                        <div className="mb-4">
                            <div className="font-medium text-gray-700 mb-2">What the client ordered:</div>
                            <div className="space-y-1">
                                {order.selections.map((sel, idx) => (
                                    <div key={idx} className="text-gray-600">
                                        <span className="font-medium">{sel.step_name}:</span> {sel.option_label}
                                        {sel.credit_cost > 0 && (
                                            <span className="text-blue-600 ml-1">(+{sel.credit_cost} Credits)</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {order.service.field_values.length > 0 && (
                            <>
                                <Divider>Service Details</Divider>
                                <Descriptions column={1} size="small">
                                    {order.service.field_values.map((fv, idx) => (
                                        <Descriptions.Item key={idx} label={fv.label}>
                                            {fv.value}
                                        </Descriptions.Item>
                                    ))}
                                </Descriptions>
                            </>
                        )}
                    </Card>
                </BentoCell>

                {/* SECTION 2 - Reference Files */}
                <BentoCell span={12}>
                    <Card title="Reference Files from Client">
                        {order.reference_files.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {order.reference_files.map((file) => (
                                    <div key={file.id} className="border rounded p-3 hover:shadow-md transition">
                                        <div className="text-sm font-medium truncate mb-2" title={file.original_name}>
                                            {file.original_name}
                                        </div>
                                        <div className="text-xs text-gray-500 mb-3">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </div>
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<DownloadOutlined />}
                                            onClick={() => window.open(`/storage/${file.file_path}`, '_blank')}
                                            block
                                        >
                                            Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="No reference files"
                                description="The client did not upload any reference files"
                            />
                        )}
                    </Card>
                </BentoCell>

                {/* SECTION 3 - Submit Deliverable */}
                <BentoCell span={12}>
                    <Card
                        title="Submit Deliverable"
                        className="border-l-4 border-l-blue-500"
                    >
                        {deliverySubmitted ? (
                            <Alert
                                message="Deliverable Already Submitted"
                                description="You have already submitted the deliverable for this order. The client will review it."
                                type="info"
                                showIcon
                            />
                        ) : (
                            <>
                                <Dragger {...uploadProps} className="mb-4">
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">Drag files here or click to browse</p>
                                    <p className="ant-upload-hint">
                                        Upload up to 10 files. Max 50MB per file.
                                        Supported: images, PDFs, documents, zip, videos
                                    </p>
                                </Dragger>

                                <Button
                                    type="primary"
                                    size="large"
                                    loading={uploading}
                                    disabled={!canSubmitDelivery || deliveryFiles.length === 0}
                                    onClick={handleSubmitDelivery}
                                    block
                                >
                                    Submit Delivery
                                </Button>

                                {!canSubmitDelivery && !deliverySubmitted && (
                                    <Alert
                                        message="Cannot submit delivery at this time"
                                        description="Delivery can only be submitted when order status is Assigned, In Progress, or Revision Requested"
                                        type="warning"
                                        showIcon
                                        className="mt-4"
                                    />
                                )}
                            </>
                        )}

                        {/* Show delivered files if any */}
                        {order.deliverable_files.length > 0 && (
                            <div className="mt-6">
                                <Divider>Submitted Deliverables</Divider>
                                <div className="space-y-2">
                                    {order.deliverable_files.map((file) => (
                                        <div key={file.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <div>
                                                <div className="font-medium">{file.original_name}</div>
                                                <div className="text-xs text-gray-500">Uploaded: {file.uploaded_at}</div>
                                            </div>
                                            <Button
                                                size="small"
                                                icon={<DownloadOutlined />}
                                                onClick={() => window.open(`/storage/${file.file_path}`, '_blank')}
                                            >
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </BentoCell>

                {/* SECTION 4 - Comments */}
                <BentoCell span={12}>
                    <Card title="Comments">
                        <div className="mb-4">
                            <TextArea
                                rows={4}
                                placeholder="Add a comment..."
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                className="mb-2"
                            />
                            <Upload {...commentUploadProps} className="mb-2">
                                <Button>Attach Files (Optional)</Button>
                            </Upload>
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleCommentSubmit}
                                disabled={!commentContent.trim()}
                            >
                                Post Comment
                            </Button>
                        </div>

                        <Divider />

                        {order.comments.data && order.comments.data.length > 0 ? (
                            <div className="space-y-4">
                                {order.comments.data.map((comment) => (
                                    <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold">{comment.user.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-gray-700">{comment.content}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="No comments yet"
                                description="Be the first to add a comment"
                            />
                        )}
                    </Card>
                </BentoCell>

                {/* SECTION 5 - Revision History */}
                <BentoCell span={12}>
                    <Card title="Revision History">
                        {order.revisions.length > 0 ? (
                            <div className="space-y-3">
                                {order.revisions.map((revision) => (
                                    <div
                                        key={revision.id}
                                        className={`p-3 rounded border-l-4 ${
                                            revision.is_resolved
                                                ? 'bg-green-50 border-green-500'
                                                : 'bg-orange-50 border-orange-500'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Tag color={revision.is_resolved ? 'green' : 'orange'}>
                                                {revision.is_resolved ? 'Resolved' : 'Open'}
                                            </Tag>
                                            <span className="text-xs text-gray-500">
                                                Requested: {revision.created_at}
                                            </span>
                                        </div>
                                        <div className="text-gray-700">{revision.reason}</div>
                                        {revision.is_resolved && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Resolved: {revision.resolved_at}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="No revisions"
                                description="No revision requests have been made for this order"
                            />
                        )}
                    </Card>
                </BentoCell>
            </BentoGrid>
        </WorkerLayout>
    );
}
