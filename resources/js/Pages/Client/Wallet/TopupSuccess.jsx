import { Link } from '@inertiajs/react';
import { Result, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import ClientLayout from '@/Layouts/ClientLayout';

export default function TopupSuccess({ session_id }) {
    const breadcrumbs = [
        { title: <Link href="/client/dashboard">Dashboard</Link> },
        { title: <Link href="/client/wallet">My Wallet</Link> },
        { title: 'Payment Successful' },
    ];

    return (
        <ClientLayout breadcrumbs={breadcrumbs}>
            <div className="max-w-2xl mx-auto mt-12">
                <Result
                    status="success"
                    icon={<CheckCircleOutlined className="text-green-500" />}
                    title="Payment Successful!"
                    subTitle="Your credits will be added to your wallet shortly. You will receive a confirmation once the transaction is processed."
                    extra={[
                        <Link key="wallet" href="/client/wallet">
                            <Button type="primary" size="large">
                                Go to My Wallet
                            </Button>
                        </Link>,
                    ]}
                />
                {session_id && (
                    <div className="text-center mt-4 text-gray-500 text-sm">
                        Transaction ID: {session_id}
                    </div>
                )}
            </div>
        </ClientLayout>
    );
}
