import { Card, Skeleton } from 'antd';

export default function ChartCard({ title, height = 300, loading = false, children }) {
    return (
        <Card 
            title={title} 
            className="shadow-sm border-gray-100 rounded-lg h-full"
            styles={{ 
                header: { borderBottom: '1px solid #f0f0f0', fontWeight: 600 },
                body: { minHeight: `${height}px` } 
            }}
        >
            {loading ? (
                <div style={{ height: `${height}px` }} className="flex flex-col justify-center">
                    <Skeleton active paragraph={{ rows: 6 }} />
                </div>
            ) : (
                <div style={{ height: `${height}px` }}>
                    {children}
                </div>
            )}
        </Card>
    );
}
