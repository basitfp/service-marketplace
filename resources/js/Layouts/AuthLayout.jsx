import { Card } from 'antd';
import { Link } from '@inertiajs/react';

export default function AuthLayout({ children, title }) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="mb-8">
                <Link href="/">
                    <div className="text-3xl font-bold text-slate-800 tracking-wider">
                        SERVICE<span className="text-blue-600">MARKET</span>
                    </div>
                </Link>
            </div>
            
            <div className="w-full max-w-[420px]">
                <Card 
                    title={title} 
                    className="shadow-sm border-gray-200"
                    styles={{ 
                        header: { textAlign: 'center', fontSize: '1.25rem', fontWeight: 600, borderBottom: 'none', paddingTop: '24px' },
                        body: { paddingTop: '12px' } 
                    }}
                >
                    {children}
                </Card>
            </div>
        </div>
    );
}
