import { Typography } from 'antd';

const { Title, Text } = Typography;

export default function EmptyState({ icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-dashed border-gray-200">
            {icon && (
                <div className="text-5xl text-gray-300 mb-4">
                    {icon}
                </div>
            )}
            
            <Title level={4} style={{ margin: 0, color: '#374151' }}>
                {title}
            </Title>
            
            {description && (
                <Text className="text-gray-500 mt-2 max-w-md text-base">
                    {description}
                </Text>
            )}
            
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}
