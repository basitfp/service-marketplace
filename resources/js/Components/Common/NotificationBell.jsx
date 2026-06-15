import React from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import { Badge, Button, Dropdown, Empty, Space, Typography } from 'antd';
import { BellOutlined, CheckCircleOutlined, NotificationOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const notificationMessage = (notification) => (
    notification?.data?.message ||
    notification?.data?.title ||
    'New notification'
);

export default function NotificationBell() {
    const { props } = usePage();
    const notifications = props.notifications || { unread_count: 0, latest: [] };
    const latest = notifications.latest || [];

    const markRead = (notification) => {
        if (notification.read_at) return;

        router.post(route('notifications.read', notification.id), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const markAllRead = () => {
        router.post(route('notifications.read-all'), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const items = latest.length ? [
        ...latest.map((notification) => ({
            key: notification.id,
            label: (
                <button
                    type="button"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        markRead(notification);
                    }}
                    className="w-80 text-left block"
                >
                    <div className="flex gap-3 py-2">
                        <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${notification.read_at ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
                            {notification.read_at ? <CheckCircleOutlined /> : <NotificationOutlined />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className={`text-sm ${notification.read_at ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                                {notificationMessage(notification)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {notification.created_at ? dayjs(notification.created_at).format('MMM D, h:mm A') : ''}
                            </div>
                        </div>
                    </div>
                </button>
            ),
        })),
        { type: 'divider' },
        {
            key: 'footer',
            label: (
                <div className="flex items-center justify-between gap-4 py-1">
                    <Link href={route('notifications.index')} className="text-sm">View all</Link>
                    <Button type="link" size="small" onClick={markAllRead} disabled={!notifications.unread_count}>
                        Mark All Read
                    </Button>
                </div>
            ),
        },
    ] : [
        {
            key: 'empty',
            disabled: true,
            label: (
                <div className="w-80 py-4">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notifications yet" />
                </div>
            ),
        },
        { type: 'divider' },
        {
            key: 'footer',
            label: (
                <Space className="w-full justify-between">
                    <Link href={route('notifications.index')} className="text-sm">View all</Link>
                    <Text type="secondary" className="text-xs">All caught up</Text>
                </Space>
            ),
        },
    ];

    return (
        <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
            <Badge count={notifications.unread_count || 0} size="small">
                <BellOutlined className="text-xl text-gray-600 cursor-pointer hover:text-blue-600 transition" />
            </Badge>
        </Dropdown>
    );
}
