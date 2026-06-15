import { useEffect } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Form, Input, Button, Checkbox, Alert } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const onFinish = () => {
        clearErrors();
        post(route('login'));
    };

    return (
        <AuthLayout title="Welcome Back">
            <Head title="Log in" />

            {status && (
                <Alert message={status} type="success" showIcon className="mb-6" />
            )}

            <Form
                name="login"
                layout="vertical"
                initialValues={{ remember: data.remember }}
                onFinish={onFinish}
                size="large"
            >
                <Form.Item
                    label="Email Address"
                    validateStatus={errors.email ? 'error' : ''}
                    help={errors.email}
                >
                    <Input
                        prefix={<UserOutlined className="text-gray-400" />}
                        placeholder="john@example.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label="Password"
                    validateStatus={errors.password ? 'error' : ''}
                    help={errors.password}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="••••••••"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </Form.Item>

                <div className="flex items-center justify-between mb-6">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox 
                            checked={data.remember} 
                            onChange={(e) => setData('remember', e.target.checked)}
                        >
                            Remember me
                        </Checkbox>
                    </Form.Item>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Forgot Password?
                        </Link>
                    )}
                </div>

                <Form.Item className="mb-0">
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500"
                        loading={processing}
                    >
                        Log in
                    </Button>
                </Form.Item>
                
                <div className="text-center mt-6 text-gray-500">
                    Don't have an account?{' '}
                    <Link href={route('register')} className="text-blue-600 hover:text-blue-500 font-medium">
                        Sign up
                    </Link>
                </div>
            </Form>
        </AuthLayout>
    );
}
