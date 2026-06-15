import { useState } from 'react';
import { Layout, Menu, Dropdown, Tag, Breadcrumb, ConfigProvider } from 'antd';
import { Link, usePage } from '@inertiajs/react';
import {
    DashboardOutlined,
    FileTextOutlined,
    UserOutlined
} from '@ant-design/icons';
import NotificationBell from '@/Components/Common/NotificationBell';

const { Header, Sider, Content } = Layout;

export default function WorkerLayout({ children, breadcrumbs = [] }) {
    const { url, props } = usePage();
    const { auth } = props;
    const [collapsed, setCollapsed] = useState(false);

    const activeKey = url.split('?')[0];

    const menuItems = [
        { key: '/worker/dashboard', icon: <DashboardOutlined />, label: <Link href="/worker/dashboard">Dashboard</Link> },
        { key: '/worker/orders', icon: <FileTextOutlined />, label: <Link href="/worker/orders">My Orders</Link> },
        { key: '/worker/profile', icon: <UserOutlined />, label: <Link href="/worker/profile">My Profile</Link> },
    ];

    const profileMenuItems = [
        { key: 'logout', label: <Link href={route('logout')} method="post" as="button" className="w-full text-left">Logout</Link> }
    ];

    return (
        <Layout className="min-h-screen">
            <ConfigProvider
                theme={{
                    components: {
                        Menu: {
                            itemSelectedBg: '#E0F2FE',
                            itemSelectedColor: '#3B82F6',
                        },
                        Layout: {
                            siderBg: '#FFFFFF',
                        }
                    }
                }}
            >
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    width={240}
                    collapsedWidth={60}
                    className="border-r border-gray-200"
                >
                    <div className="h-16 flex items-center justify-center m-4 text-gray-800 font-bold text-xl tracking-wider truncate">
                        {collapsed ? 'SM' : 'SERVICEMARKET'}
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[activeKey]}
                        items={menuItems}
                        className="border-r-0"
                    />
                </Sider>
            </ConfigProvider>

            <Layout>
                <Header className="bg-white flex justify-between items-center px-6 shadow-sm border-b border-gray-100 h-16 leading-[4rem]">
                    <div>
                        <Breadcrumb items={breadcrumbs} />
                    </div>
                    <div className="flex items-center gap-6">
                        <NotificationBell />

                        <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" trigger={['click']}>
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition">
                                <span className="text-sm font-medium text-gray-700">{auth?.user?.name || 'Worker'}</span>
                                <Tag color="blue" className="ml-1 m-0 capitalize border-none">{auth?.user?.role || 'worker'}</Tag>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content className="bg-[#F8FAFC] p-6">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
