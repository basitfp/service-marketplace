import { useEffect } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

export default function Register() {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const onFinish = () => {
        clearErrors();
        post(route('register'));
    };

    return (
        <AuthLayout title="Create an Account">
            <Head title="Register" />

            <Form
                name="register"
                layout="vertical"
                onFinish={onFinish}
                size="large"
            >
                <Form.Item
                    label="Full Name"
                    validateStatus={errors.name ? 'error' : ''}
                    help={errors.name}
                >
                    <Input
                        prefix={<UserOutlined className="text-gray-400" />}
                        placeholder="John Doe"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label="Email Address"
                    validateStatus={errors.email ? 'error' : ''}
                    help={errors.email}
                >
                    <Input
                        prefix={<MailOutlined className="text-gray-400" />}
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

                <Form.Item
                    label="Confirm Password"
                    validateStatus={errors.password_confirmation ? 'error' : ''}
                    help={errors.password_confirmation}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="••••••••"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                </Form.Item>

                <Form.Item className="mb-0 mt-6">
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500"
                        loading={processing}
                    >
                        Register
                    </Button>
                </Form.Item>

                <div className="text-center mt-6 text-gray-500">
                    Already have an account?{' '}
                    <Link href={route('login')} className="text-blue-600 hover:text-blue-500 font-medium">
                        Log in
                    </Link>
                </div>
            </Form>
        </AuthLayout>
    );
}
