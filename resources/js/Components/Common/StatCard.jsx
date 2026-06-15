import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

export default function StatCard({ title, value, icon, color = '#3B82F6', trend }) {
    return (
        <Card className="shadow-sm border-gray-100 rounded-lg">
            <div className="flex items-center">
                <div 
                    className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full mr-4"
                    style={{ backgroundColor: `${color}15`, color: color, fontSize: '24px' }}
                >
                    {icon}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-500 mb-1 truncate">{title}</p>
                    <div className="flex items-end gap-3">
                        <h3 className="text-2xl font-semibold text-gray-800 m-0">{value}</h3>
                        {trend && (
                            <span 
                                className={`flex items-center text-sm font-medium ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}
                            >
                                {trend.direction === 'up' ? <ArrowUpOutlined className="mr-1" /> : <ArrowDownOutlined className="mr-1" />}
                                {trend.value}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
