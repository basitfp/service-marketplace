import { Link, router, usePage } from '@inertiajs/react';
import { Card, Row, Col, Empty, Button, Statistic, Badge, Tooltip } from 'antd';
import { WalletOutlined, CheckOutlined, CrownOutlined } from '@ant-design/icons';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';
import { useState } from 'react';

export default function Topup({ wallet, packages }) {
    const { props } = usePage();
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    const [loading, setLoading] = useState(false);

    const breadcrumbs = [
        { title: <Link href="/client/dashboard">Dashboard</Link> },
        { title: <Link href="/client/wallet">My Wallet</Link> },
        { title: 'Top Up Credits' },
    ];

    // Calculate best value package (most credits per dollar)
    const packagesWithValue = packages.map(pkg => {
        const totalCredits = pkg.credits + (pkg.bonus_credits || 0);
        const creditsPerDollar = totalCredits / parseFloat(pkg.price);
        return { ...pkg, totalCredits, creditsPerDollar };
    });

    const bestValuePackage = packagesWithValue.length > 0
        ? packagesWithValue.reduce((best, current) => 
            current.creditsPerDollar > best.creditsPerDollar ? current : best
          )
        : null;

    const selectedPackage = packagesWithValue.find(pkg => pkg.id === selectedPackageId);

    const handlePurchase = () => {
        if (!selectedPackageId) return;
        
        setLoading(true);
        
        // Use native form submission for external redirect to Stripe
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('client.wallet.checkout');
        
        // CSRF token from Inertia
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = props.csrf_token || document.querySelector('meta[name="csrf-token"]')?.content || '';
        form.appendChild(csrfInput);
        
        // Package ID
        const packageInput = document.createElement('input');
        packageInput.type = 'hidden';
        packageInput.name = 'package_id';
        packageInput.value = selectedPackageId;
        form.appendChild(packageInput);
        
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <ClientLayout breadcrumbs={breadcrumbs}>
            <PageHeader title="Top Up Wallet" />

            <div className="max-w-6xl mx-auto">
                {/* Current Balance Display */}
                <Card className="mb-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <Statistic
                        title={<span className="text-lg font-medium text-gray-700">Current Balance</span>}
                        value={wallet.balance}
                        suffix="Credits"
                        valueStyle={{ color: '#3B82F6', fontSize: '36px', fontWeight: 'bold' }}
                    />
                </Card>

                {packages.length > 0 ? (
                    <>
                        {/* Credit Packages Grid */}
                        <Row gutter={[24, 24]} className="mb-6">
                            {packagesWithValue.map((pkg) => {
                                const isSelected = selectedPackageId === pkg.id;
                                const isBestValue = bestValuePackage && pkg.id === bestValuePackage.id;

                                return (
                                    <Col key={pkg.id} xs={24} sm={12} lg={8}>
                                        <Badge.Ribbon
                                            text={
                                                <>
                                                    <CrownOutlined /> Best Value
                                                </>
                                            }
                                            color="gold"
                                            className={isBestValue ? 'block' : 'hidden'}
                                        >
                                            <Card
                                                hoverable
                                                onClick={() => setSelectedPackageId(pkg.id)}
                                                className={`text-center h-full cursor-pointer transition-all duration-200 ${
                                                    isSelected
                                                        ? 'border-2 border-blue-500 shadow-lg shadow-blue-200'
                                                        : 'border border-gray-200'
                                                }`}
                                                styles={{
                                                    body: {
                                                        padding: '32px 24px',
                                                        position: 'relative',
                                                    }
                                                }}
                                            >
                                                {/* Bonus Badge */}
                                                {pkg.bonus_credits > 0 && (
                                                    <div className="absolute top-4 right-4">
                                                        <Badge
                                                            count={`+${pkg.bonus_credits} Bonus!`}
                                                            className="bg-green-500 text-[11px] font-bold"
                                                        />
                                                    </div>
                                                )}

                                                {/* Selected Checkmark */}
                                                {isSelected && (
                                                    <div className="absolute top-4 left-4">
                                                        <CheckOutlined className="text-2xl text-blue-500" />
                                                    </div>
                                                )}

                                                {/* Package Name */}
                                                <h3 className="text-xl font-bold text-gray-800 mb-4 mt-2">
                                                    {pkg.name}
                                                </h3>

                                                {/* Credits - Large Number */}
                                                <div className="mb-2">
                                                    <span className="text-5xl font-bold text-blue-500">
                                                        {pkg.credits.toLocaleString()}
                                                    </span>
                                                    <div className="text-lg text-gray-600 mt-1">
                                                        Credits
                                                    </div>
                                                </div>

                                                {/* Total Credits (including bonus) */}
                                                <div className="text-gray-500 mb-4">
                                                    {pkg.totalCredits.toLocaleString()} Total Credits
                                                </div>

                                                {/* Price */}
                                                <div className="text-3xl font-bold text-gray-900 mb-3">
                                                    ${parseFloat(pkg.price).toFixed(2)}
                                                </div>

                                                {/* Description */}
                                                {pkg.description && (
                                                    <p className="text-sm text-gray-600 mt-3">
                                                        {pkg.description}
                                                    </p>
                                                )}
                                            </Card>
                                        </Badge.Ribbon>
                                    </Col>
                                );
                            })}
                        </Row>

                        {/* Bottom Action Bar */}
                        <Card className="sticky bottom-6 shadow-xl border-t-4 border-blue-500">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-center md:text-left">
                                    {selectedPackage ? (
                                        <>
                                            <div className="text-lg font-semibold text-gray-800">
                                                {selectedPackage.name}
                                            </div>
                                            <div className="text-gray-600">
                                                {selectedPackage.totalCredits.toLocaleString()} Credits
                                                for ${parseFloat(selectedPackage.price).toFixed(2)}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-gray-500">
                                            Please select a package to continue
                                        </div>
                                    )}
                                </div>

                                <Tooltip
                                    title={!selectedPackageId ? 'Please select a package' : ''}
                                >
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<WalletOutlined />}
                                        onClick={handlePurchase}
                                        disabled={!selectedPackageId}
                                        loading={loading}
                                        className="px-8"
                                    >
                                        Pay with Stripe
                                    </Button>
                                </Tooltip>
                            </div>
                        </Card>
                    </>
                ) : (
                    <Card>
                        <Empty
                            icon={<WalletOutlined className="text-6xl text-gray-300" />}
                            description="No credit packages available"
                        >
                            <p className="text-gray-600 mt-2">
                                Contact support for assistance with purchasing credits.
                            </p>
                        </Empty>
                    </Card>
                )}
            </div>
        </ClientLayout>
    );
}
