import { Link, useForm, usePage } from '@inertiajs/react';
import { Card, Form, Input, Button, Upload, Avatar, Descriptions, message } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import ClientLayout from '@/Layouts/ClientLayout';
import PageHeader from '@/Components/Common/PageHeader';
import StatusBadge from '@/Components/Common/StatusBadge';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function Index({ user }) {
    const { flash } = usePage().props;
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [profilePhotoFile, setProfilePhotoFile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const breadcrumbs = [
        { title: <Link href="/client/dashboard">Dashboard</Link> },
        { title: 'My Profile' },
    ];

    // Show success message on flash
    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
    }, [flash]);

    const handleProfileUpdate = (values) => {
        setProfileLoading(true);

        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('phone', values.phone || '');
        formData.append('_method', 'PUT');

        if (profilePhotoFile) {
            formData.append('profile_photo', profilePhotoFile);
        }

        // Using XMLHttpRequest to send FormData with Inertia
        const xhr = new XMLHttpRequest();
        xhr.open('POST', route('client.profile.update'));
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]').content);
        
        xhr.onload = () => {
            setProfileLoading(false);
            if (xhr.status === 200) {
                message.success('Profile updated successfully!');
                window.location.reload();
            } else {
                message.error('Failed to update profile');
            }
        };

        xhr.onerror = () => {
            setProfileLoading(false);
            message.error('Failed to update profile');
        };

        xhr.send(formData);
    };

    const handlePasswordUpdate = (values) => {
        setPasswordLoading(true);

        fetch(route('client.profile.password'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                _method: 'PUT',
                current_password: values.current_password,
                password: values.password,
                password_confirmation: values.password_confirmation,
            }),
        })
            .then((response) => {
                setPasswordLoading(false);
                if (response.ok) {
                    message.success('Password updated successfully!');
                    passwordForm.resetFields();
                } else {
                    return response.json().then((data) => {
                        if (data.errors) {
                            Object.keys(data.errors).forEach((key) => {
                                message.error(data.errors[key][0]);
                            });
                        } else {
                            message.error('Failed to update password');
                        }
                    });
                }
            })
            .catch(() => {
                setPasswordLoading(false);
                message.error('Failed to update password');
            });
    };

    const handlePhotoChange = (info) => {
        if (info.file) {
            setProfilePhotoFile(info.file.originFileObj || info.file);
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return false;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Image must be smaller than 2MB!');
                return false;
            }
            setProfilePhotoFile(file);
            return false; // Prevent auto upload
        },
        showUploadList: false,
    };

    const getAvatarSrc = () => {
        if (profilePhotoFile) {
            return URL.createObjectURL(profilePhotoFile);
        }
        if (user.profile_photo) {
            return `/storage/${user.profile_photo}`;
        }
        return null;
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <ClientLayout breadcrumbs={breadcrumbs}>
            <PageHeader title="My Profile" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Section 1: Personal Information */}
                <Card title="Personal Information">
                    <Form
                        form={profileForm}
                        layout="vertical"
                        onFinish={handleProfileUpdate}
                        initialValues={{
                            name: user.name,
                            email: user.email,
                            phone: user.phone || '',
                        }}
                    >
                        {/* Profile Photo */}
                        <Form.Item label="Profile Photo">
                            <div className="flex items-center gap-4">
                                <Avatar
                                    size={80}
                                    src={getAvatarSrc()}
                                    icon={!getAvatarSrc() && <UserOutlined />}
                                    className={!getAvatarSrc() ? 'bg-blue-500 text-[32px]' : ''}
                                >
                                    {!getAvatarSrc() && getInitials(user.name)}
                                </Avatar>
                                <Upload {...uploadProps} onChange={handlePhotoChange}>
                                    <Button icon={<UploadOutlined />}>Upload New Photo</Button>
                                </Upload>
                                {profilePhotoFile && (
                                    <span className="text-sm text-gray-600">
                                        New photo selected
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                                Maximum file size: 2MB. Supported formats: JPG, PNG, GIF
                            </div>
                        </Form.Item>

                        {/* Name */}
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter your name' }]}
                        >
                            <Input placeholder="Enter your full name" />
                        </Form.Item>

                        {/* Email (Disabled) */}
                        <Form.Item label="Email" name="email">
                            <Input disabled />
                        </Form.Item>

                        {/* Phone */}
                        <Form.Item
                            label="Phone"
                            name="phone"
                            rules={[
                                {
                                    max: 20,
                                    message: 'Phone number must be at most 20 characters',
                                },
                            ]}
                        >
                            <Input placeholder="Enter your phone number (optional)" />
                        </Form.Item>

                        {/* Save Button */}
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={profileLoading}
                                size="large"
                            >
                                Save Changes
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

                {/* Section 2: Account Stats */}
                <Card title="Account Statistics">
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Member Since">
                            {dayjs(user.created_at).format('MMMM D, YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Wallet Balance">
                            <span className="font-semibold text-blue-600">
                                {user.wallet?.balance?.toLocaleString() || 0} Credits
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Account Status">
                            <StatusBadge status={user.status} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Role">
                            <span className="capitalize">{user.role}</span>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Section 3: Change Password */}
                <Card title="Change Password">
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handlePasswordUpdate}
                    >
                        {/* Current Password */}
                        <Form.Item
                            label="Current Password"
                            name="current_password"
                            rules={[
                                { required: true, message: 'Please enter your current password' },
                            ]}
                        >
                            <Input.Password placeholder="Enter your current password" />
                        </Form.Item>

                        {/* New Password */}
                        <Form.Item
                            label="New Password"
                            name="password"
                            rules={[
                                { required: true, message: 'Please enter a new password' },
                                { min: 8, message: 'Password must be at least 8 characters' },
                            ]}
                        >
                            <Input.Password placeholder="Enter new password (min 8 characters)" />
                        </Form.Item>

                        {/* Confirm New Password */}
                        <Form.Item
                            label="Confirm New Password"
                            name="password_confirmation"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Please confirm your new password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error('The two passwords do not match')
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Confirm your new password" />
                        </Form.Item>

                        {/* Update Button */}
                        <Form.Item>
                            <Button htmlType="submit" loading={passwordLoading} size="large">
                                Update Password
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </ClientLayout>
    );
}
