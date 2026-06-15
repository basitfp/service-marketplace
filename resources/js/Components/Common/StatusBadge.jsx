import { Tag } from 'antd';
import { STATUS_COLORS } from '@/Utils/constants';

export default function StatusBadge({ status }) {
    if (!status) return null;

    const normalizedStatus = status.toLowerCase();
    const color = STATUS_COLORS[normalizedStatus] || '#6B7280';
    
    const label = normalizedStatus
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <Tag color={color} className="m-0 font-medium border-transparent text-white">
            {label}
        </Tag>
    );
}
