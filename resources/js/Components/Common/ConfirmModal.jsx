import { Modal, Typography } from 'antd';

const { Text } = Typography;

export default function ConfirmModal({ 
    open, 
    onConfirm, 
    onCancel, 
    title, 
    description, 
    danger = false, 
    loading = false 
}) {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={onConfirm}
            title={title}
            confirmLoading={loading}
            okButtonProps={{ danger }}
            okText="Confirm"
            cancelText="Cancel"
            centered
        >
            <div className="py-2">
                <Text className="text-gray-500">{description}</Text>
            </div>
        </Modal>
    );
}
