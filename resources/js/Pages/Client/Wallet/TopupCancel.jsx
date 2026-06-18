import { Link } from '@inertiajs/react';
import { Result, Button, Space } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import ClientLayout from '@/Layouts/ClientLayout';

export default function TopupCancel() {
    const breadcrumbs = [
        { title: <Link href="/client/dashboard">Dashboard</Link> },
        { title: <Link href="/client/wallet">My Wallet</Link> },
        { title: 'Payment Cancelled' },
    ];

    return (
        <ClientLayout breadcrumbs={breadcrumbs}>
            <div className="max-w-2xl mx-auto mt-12">
                <Result
                    status="warning"
                    icon={<CloseCircleOutlined className="text-yellow-500" />}
                    title="Payment Cancelled"
                    subTitle="Your payment was cancelled. No charges have been made to your account."
                    extra={
                        <Space size="middle">
                            <Link href="/client/wallet/topup">
                                <Button type="primary" size="large">
                                    Try Again
                                </Button>
                            </Link>
                            <Link href="/client/wallet">
                                <Button size="large">
                                    Go to Wallet
                                </Button>
                            </Link>
                        </Space>
                    }
                />
            </div>
        </ClientLayout>
    );
}
