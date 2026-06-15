import { useState } from 'react';
import { Layout, Menu, Badge, Dropdown, Tag, Breadcrumb, ConfigProvider } from 'antd';
import { Link, usePage } from '@inertiajs/react';
import {
    DashboardOutlined,
    AppstoreOutlined,
    FileTextOutlined,
    WalletOutlined,
    SwapOutlined,
    UserOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import NotificationBell from '@/Components/Common/NotificationBell';

const { Header, Sider, Content } = Layout;

export default function ClientLayout({ children, breadcrumbs = [], cartCount = 0 }) {
    const { url, props } = usePage();
    const { auth } = props;
    const [collapsed, setCollapsed] = useState(false);

    const activeKey = url.split('?')[0];

    const menuItems = [
        { key: '/client/dashboard', icon: <DashboardOutlined />, label: <Link href="/client/dashboard">Dashboard</Link> },
        { key: '/client/services', icon: <AppstoreOutlined />, label: <Link href="/client/services">Browse Services</Link> },
        { key: '/client/orders', icon: <FileTextOutlined />, label: <Link href="/client/orders">My Orders</Link> },
        { key: '/client/wallet', icon: <WalletOutlined />, label: <Link href="/client/wallet">My Wallet</Link> },
        { key: '/client/transactions', icon: <SwapOutlined />, label: <Link href="/client/transactions">Transactions</Link> },
        { key: '/client/profile', icon: <UserOutlined />, label: <Link href="/client/profile">My Profile</Link> },
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
                        <Badge count={cartCount} size="small">
                            <ShoppingCartOutlined className="text-xl text-gray-600 cursor-pointer hover:text-blue-600 transition" />
                        </Badge>
                        
                        <NotificationBell />

                        <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" trigger={['click']}>
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition">
                                <span className="text-sm font-medium text-gray-700">{auth?.user?.name || 'Client'}</span>
                                <Tag color="blue" className="ml-1 m-0 capitalize border-none">{auth?.user?.role || 'client'}</Tag>
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
