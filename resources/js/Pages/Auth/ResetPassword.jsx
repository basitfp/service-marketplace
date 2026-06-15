import { useEffect } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import { Form, Input, Button } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        token: token,
        email: email,
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
        post(route('password.store'));
    };

    return (
        <AuthLayout title="Reset Password">
            <Head title="Reset Password" />

            <Form
                name="reset_password"
                layout="vertical"
                onFinish={onFinish}
                size="large"
            >
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
                        autoFocus
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
                        Reset Password
                    </Button>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
}
