import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Button, Card, Tag, Avatar, Divider, Space, Typography, List, Rate } from 'antd';
import { EditOutlined, RetweetOutlined, StarFilled, ProjectOutlined, CheckCircleOutlined, SyncOutlined, TrophyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import { BentoGrid, BentoCell } from '@/Components/Common/BentoGrid';
import StatCard from '@/Components/Common/StatCard';
import DataTable from '@/Components/Common/DataTable';
import StatusBadge from '@/Components/Common/StatusBadge';

const { Title, Text, Paragraph } = Typography;

export default function Show({ worker, activeOrdersCount, completedOrdersCount }) {
    const toggleStatus = () => {
        router.patch(route('admin.workers.toggle-status', worker.id), {}, { preserveScroll: true });
    };

    const profile = worker.worker_profile || {};
    const skills = worker.skills || [];
    const services = worker.services || [];

    const totalOrders = activeOrdersCount + completedOrdersCount;
    // Mocked rating and completion rate until reviews module is built
    const avgRating = 4.8;
    const completionRate = totalOrders > 0 ? 95 : 0; 

    // Mocked history until orders module
    const mockOrderHistory = [];
    const mockReviews = [];

    const orderColumns = [
        { title: 'Order ID', dataIndex: 'id', render: val => `#${val}` },
        { title: 'Service', dataIndex: 'service' },
        { title: 'Client', dataIndex: 'client' },
        { title: 'Status', dataIndex: 'status', render: val => <StatusBadge status={val} /> },
        { title: 'Date', dataIndex: 'date' },
        { title: 'Amount', dataIndex: 'amount', render: val => <span className="font-semibold text-emerald-600">{val} C</span> }
    ];

    return (
        <>
            <Head title={`Worker: ${worker.name}`} />

            <PageHeader 
                title={worker.name} 
                subtitle="Worker Profile and Performance Dashboard"
                onBack={() => router.get(route('admin.workers.index'))}
                actions={[
                    <Button 
                        key="status" 
                        icon={<RetweetOutlined />} 
                        onClick={toggleStatus}
                    >
                        Toggle Status ({worker.status === 'active' ? 'Disable' : 'Enable'})
                    </Button>,
                    <Link key="edit" href={route('admin.workers.edit', worker.id)}>
                        <Button type="primary" icon={<EditOutlined />}>
                            Edit Profile
                        </Button>
                    </Link>
                ]}
            />

            <BentoGrid cols={12} gap={6} className="mb-8">
                {/* Row 1: Left Profile Column */}
                <BentoCell span={4}>
                    <Card className="shadow-sm border-gray-100 rounded-xl h-full">
                        <div className="flex flex-col items-center text-center mb-6">
                            <Avatar 
                                size={96} 
                                src={worker.profile_photo ? `/storage/${worker.profile_photo}` : null}
                                className="mb-4 text-3xl flex items-center justify-center bg-indigo-100 text-indigo-500"
                            >
                                {!worker.profile_photo && worker.name.charAt(0)}
                            </Avatar>
                            <Title level={4} className="mb-1 m-0">{worker.name}</Title>
                            <Text type="secondary" className="mb-2">{worker.email}</Text>
                            <Space className="mb-4">
                                <StatusBadge status={worker.status} />
                                {worker.phone && <Tag>{worker.phone}</Tag>}
                            </Space>
                            <Text type="secondary" className="text-sm">
                                Joined {profile.joined_date ? dayjs(profile.joined_date).format('MMMM D, YYYY') : 'Unknown'}
                            </Text>
                        </div>

                        <Divider />

                        <div className="mb-4">
                            <Title level={5} className="text-gray-700">Bio</Title>
                            <Paragraph className="text-gray-600 text-sm">
                                {profile.bio || <span className="italic text-gray-400">No bio provided.</span>}
                            </Paragraph>
                        </div>

                        <div className="mb-4">
                            <Title level={5} className="text-gray-700">Experience</Title>
                            <Paragraph className="text-gray-600 text-sm">
                                {profile.experience || <span className="italic text-gray-400">No experience details provided.</span>}
                            </Paragraph>
                        </div>

                        <div className="mb-4">
                            <Title level={5} className="text-gray-700">Skills</Title>
                            <div className="flex flex-wrap gap-2">
                                {skills.length > 0 ? skills.map(skill => (
                                    <Tag color="purple" key={skill.id}>{skill.name}</Tag>
                                )) : <Text type="secondary" className="text-sm italic">No skills listed</Text>}
                            </div>
                        </div>

                        <div className="mb-4">
                            <Title level={5} className="text-gray-700">Eligible Services</Title>
                            <div className="flex flex-wrap gap-2">
                                {services.length > 0 ? services.map(srv => (
                                    <Tag color="cyan" key={srv.id}>{srv.name}</Tag>
                                )) : <Text type="secondary" className="text-sm italic">Not assigned to any services</Text>}
                            </div>
                        </div>

                        {profile.notes && (
                            <>
                                <Divider />
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                    <Title level={5} className="text-yellow-800 m-0 mb-1">Admin Notes</Title>
                                    <Text className="text-yellow-700 text-sm">{profile.notes}</Text>
                                </div>
                            </>
                        )}
                    </Card>
                </BentoCell>

                {/* Row 1: Right Stats Column */}
                <BentoCell span={8}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <StatCard 
                            title="Total Orders" 
                            value={totalOrders} 
                            icon={<ProjectOutlined />} 
                            color="#3B82F6" 
                        />
                        <StatCard 
                            title="In Progress" 
                            value={activeOrdersCount} 
                            icon={<SyncOutlined spin />} 
                            color="#F59E0B" 
                        />
                        <StatCard 
                            title="Completed" 
                            value={completedOrdersCount} 
                            icon={<CheckCircleOutlined />} 
                            color="#10B981" 
                        />
                        <StatCard 
                            title="Avg Rating" 
                            value={`${avgRating} / 5.0`} 
                            icon={<StarFilled />} 
                            color="#EAB308" 
                        />
                        <StatCard 
                            title="Completion Rate" 
                            value={`${completionRate}%`} 
                            icon={<TrophyOutlined />} 
                            color="#8B5CF6" 
                        />
                    </div>

                    <Card title="Recent Orders History" className="shadow-sm border-gray-100 rounded-xl mb-6" bodyStyle={{ padding: 0 }}>
                        <DataTable 
                            columns={orderColumns} 
                            dataSource={mockOrderHistory} 
                            pagination={false}
                        />
                        {mockOrderHistory.length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                                No orders processed yet.
                            </div>
                        )}
                    </Card>

                    <Card title="Recent Reviews" className="shadow-sm border-gray-100 rounded-xl">
                        <List
                            itemLayout="horizontal"
                            dataSource={mockReviews}
                            locale={{ emptyText: 'No reviews received yet.' }}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar>{item.client.charAt(0)}</Avatar>}
                                        title={<Space><span className="font-medium">{item.client}</span> <Rate disabled defaultValue={item.rating} className="text-sm text-yellow-400" /></Space>}
                                        description={
                                            <div>
                                                <div className="text-gray-700 mt-1">{item.text}</div>
                                                <div className="text-xs text-gray-400 mt-2">{item.date}</div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </BentoCell>
            </BentoGrid>
        </>
    );
}

Show.layout = page => (
    <AdminLayout
        breadcrumbs={[
            { title: 'Dashboard', href: route('admin.dashboard') },
            { title: 'Workers', href: route('admin.workers.index') },
            { title: 'Details' }
        ]}
    >
        {page}
    </AdminLayout>
);

