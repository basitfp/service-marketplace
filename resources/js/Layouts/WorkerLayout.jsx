import { useState } from 'react';
import { Layout, Menu, Dropdown, Tag, Breadcrumb, ConfigProvider, Button } from 'antd';
import { Link, usePage, router } from '@inertiajs/react';
import {
    DashboardOutlined,
    FileTextOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined
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
        { key: 'logout', label: <Link href={route('logout')} method="post" as="button" className="w-full text-left text-red-600 hover:text-red-700 font-medium">Logout</Link>, icon: <LogoutOutlined className="text-red-600" /> }
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <Layout className="min-h-screen overflow-x-hidden">
            <style>{`
                /* Premium Menu Styling */
                .premium-sidebar .ant-menu-dark .ant-menu-item {
                    margin-bottom: 6px !important;
                    transition: all 150ms ease !important;
                    border-radius: 8px !important;
                    width: calc(100% - 16px) !important;
                    margin-left: 8px !important;
                }
                .premium-sidebar .ant-menu-dark .ant-menu-item-selected {
                    background-color: #1E293B !important;
                    border-left: 4px solid #3B82F6 !important;
                    color: #FFFFFF !important;
                }
                .premium-sidebar .ant-menu-dark .ant-menu-item:not(.ant-menu-item-selected):hover {
                    background-color: #1E293B !important;
                    color: #F8FAFC !important;
                }
                .premium-sidebar .logout-item {
                    transition: all 150ms ease;
                }
                .premium-sidebar .logout-item:hover {
                    background-color: rgba(239, 68, 68, 0.1) !important;
                    color: #ef4444 !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 12px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #94a3b8;
                    border-radius: 20px;
                    border: 2px solid #f1f5f9;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #64748b;
                }
            `}</style>

            <ConfigProvider
                theme={{
                    components: {
                        Menu: {
                            darkItemBg: 'transparent',
                            darkItemColor: '#94A3B8',
                        },
                        Layout: {
                            siderBg: '#0F172A',
                        }
                    }
                }}
            >
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={260}
                    collapsedWidth={80}
                    theme="dark"
                    className="premium-sidebar relative flex flex-col h-screen"
                    style={{ position: 'sticky', top: 0, left: 0, zIndex: 50 }}
                >
                    {/* Floating Toggle Button */}
                    <div 
                        className="absolute -right-3 top-16 z-50 shadow-md"
                        style={{ transform: 'translateY(-50%)' }}
                    >
                        <Button 
                            type="default" 
                            shape="circle" 
                            size="small"
                            onClick={() => setCollapsed(!collapsed)}
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            className="bg-white border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300"
                        />
                    </div>

                    <div className="h-16 flex items-center justify-center m-4 text-white font-bold tracking-wider truncate mb-6">
                        {collapsed ? <div className="text-xl bg-blue-600 rounded p-2 text-center w-10 h-10 flex items-center justify-center leading-none">SM</div> : <div className="text-2xl">ServiceMarket</div>}
                    </div>

                    <div
                        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
                        style={{ height: 'calc(100vh - 180px)' }}
                    >
                        <Menu
                            theme="dark"
                            mode="inline"
                            selectedKeys={[activeKey]}
                            items={menuItems}
                        />
                    </div>

                    {/* Bottom Logout Area */}
                    <div className="absolute bottom-0 w-full bg-[#0F172A] border-t border-slate-800 p-4">
                        <div 
                            onClick={handleLogout}
                            className={`flex items-center text-slate-400 logout-item cursor-pointer rounded-lg p-2 ${collapsed ? 'justify-center' : 'px-4'}`}
                        >
                            <LogoutOutlined className={collapsed ? "text-lg" : "text-md mr-3"} />
                            {!collapsed && <span className="font-medium">Logout</span>}
                        </div>
                    </div>
                </Sider>
            </ConfigProvider>

            <Layout className="overflow-y-auto overflow-x-hidden w-full max-w-full h-screen custom-scrollbar">
                <Header className="bg-white flex justify-between items-center px-6 shadow-sm border-b border-gray-100 h-16 leading-[4rem] sticky top-0 z-40">
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

                <Content className="bg-[#F8FAFC] p-6 max-w-full overflow-x-hidden">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
