import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Form, Input, Button, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        email: '',
    });

    const onFinish = () => {
        clearErrors();
        post(route('password.email'));
    };

    return (
        <AuthLayout title="Forgot Password">
            <Head title="Forgot Password" />

            <div className="mb-6 text-sm text-gray-600 text-center">
                Forgot your password? No problem. Just let us know your email address and we will email you a password
                reset link that will allow you to choose a new one.
            </div>

            {status && (
                <Alert message={status} type="success" showIcon className="mb-6" />
            )}

            <Form
                name="forgot_password"
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
                        autoFocus
                    />
                </Form.Item>

                <Form.Item className="mb-0 mt-6">
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500"
                        loading={processing}
                    >
                        Email Password Reset Link
                    </Button>
                </Form.Item>

                <div className="text-center mt-6 text-gray-500">
                    <Link href={route('login')} className="text-blue-600 hover:text-blue-500 font-medium">
                        Back to Login
                    </Link>
                </div>
            </Form>
        </AuthLayout>
    );
}
