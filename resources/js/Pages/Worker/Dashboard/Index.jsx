import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, Typography } from 'antd';
import WorkerLayout from '@/Layouts/WorkerLayout';

const { Title, Text } = Typography;

export default function Index() {
    return (
        <WorkerLayout breadcrumbs={[{ label: 'Worker Portal' }, { label: 'Dashboard' }]}>
            <Head title="Worker Dashboard" />
            
            <div className="mb-6 mt-2">
                <Title level={3} className="!mb-1">Welcome to your Workspace</Title>
                <Text type="secondary" className="text-base">
                    Manage your orders, update your profile, and track your performance here.
                </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="shadow-sm border-gray-100 rounded-xl" title="Recent Activity">
                    <Text className="text-gray-500 italic">No recent activity to show.</Text>
                </Card>
                <Card className="shadow-sm border-gray-100 rounded-xl" title="Pending Orders">
                    <Text className="text-gray-500 italic">You have no pending orders.</Text>
                </Card>
                <Card className="shadow-sm border-gray-100 rounded-xl" title="Quick Stats">
                    <Text className="text-gray-500 italic">Stats will appear after your first completed order.</Text>
                </Card>
            </div>
        </WorkerLayout>
    );
}
