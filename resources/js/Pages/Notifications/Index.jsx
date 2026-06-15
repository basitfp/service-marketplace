import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button, List, Tag, Typography } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, NotificationOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AdminLayout from '@/Layouts/AdminLayout';
import ClientLayout from '@/Layouts/ClientLayout';
import WorkerLayout from '@/Layouts/WorkerLayout';
import PageHeader from '@/Components/Common/PageHeader';

const { Text } = Typography;

const layoutForRole = (role) => {
    if (role === 'client') return ClientLayout;
    if (role === 'worker') return WorkerLayout;
    return AdminLayout;
};

export default function Index({ notificationsList }) {
    const { props } = usePage();
    const role = props.auth?.user?.role || 'admin';
    const Layout = layoutForRole(role);

    const markRead = (notification) => {
        router.post(route('notifications.read', notification.id), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const destroy = (notification) => {
        router.delete(route('notifications.destroy', notification.id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <Layout breadcrumbs={[{ label: 'Notifications' }]}>
            <Head title="Notifications" />

            <PageHeader title="Notifications" breadcrumbs={[{ label: 'Notifications' }]} />

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                <List
                    dataSource={notificationsList.data}
                    locale={{ emptyText: 'No notifications yet.' }}
                    renderItem={(notification) => (
                        <List.Item
                            actions={[
                                !notification.read_at && (
                                    <Button key="read" type="link" onClick={() => markRead(notification)}>
                                        Mark read
                                    </Button>
                                ),
                                <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={() => destroy(notification)} />,
                            ].filter(Boolean)}
                        >
                            <List.Item.Meta
                                avatar={notification.read_at ? <CheckCircleOutlined className="text-gray-400 text-xl mt-1" /> : <NotificationOutlined className="text-blue-500 text-xl mt-1" />}
                                title={(
                                    <div className="flex items-center gap-2">
                                        <span>{notification.data?.message || 'New notification'}</span>
                                        {!notification.read_at && <Tag color="blue">Unread</Tag>}
                                    </div>
                                )}
                                description={<Text type="secondary">{dayjs(notification.created_at).format('MMM D, YYYY h:mm A')}</Text>}
                            />
                        </List.Item>
                    )}
                />
            </div>
        </Layout>
    );
}
