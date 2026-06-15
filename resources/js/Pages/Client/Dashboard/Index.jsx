import { Head } from '@inertiajs/react';
import { Card } from 'antd';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';

export default function Dashboard() {
    return (
        <ClientLayout 
            breadcrumbs={[
                { label: 'Client' },
                { label: 'Dashboard' }
            ]}
        >
            <Head title="Client Dashboard" />
            
            <PageHeader title="Dashboard" />
            
            <Card className="mt-4 shadow-sm border-gray-100 rounded-lg">
                <p className="text-gray-500 text-lg m-0 text-center py-8">
                    Client Dashboard coming soon
                </p>
            </Card>
        </ClientLayout>
    );
}
