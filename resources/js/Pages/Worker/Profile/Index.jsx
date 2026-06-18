import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, Form, Input, Button, Upload, Select, message, Alert, Tag, Divider } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import WorkerLayout from '@/Layouts/WorkerLayout';
import PageHeader from '@/Components/Common/PageHeader';

const { TextArea } = Input;

export default function Index({ user, all_skills }) {
    const [personalForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    const handlePersonalSubmit = (values) => {
        setSubmitting(true);

        const formData = new FormData();
        formData.append('name', values.name);
        if (values.phone) formData.append('phone', values.phone);
        if (values.bio) formData.append('bio', values.bio);
        if (values.experience) formData.append('experience', values.experience);
        
        if (values.skill_ids && values.skill_ids.length > 0) {
            values.skill_ids.forEach(id => formData.append('skill_ids[]', id));
        }

        if (profilePhoto) {
            formData.append('profile_photo', profilePhoto.originFileObj);
        }

        router.post(route('worker.profile.update'), formData, {
            forceFormData: true,
            onSuccess: () => {
                message.success('Profile updated successfully');
                setProfilePhoto(null);
            },
            onError: (errors) => {
                Object.keys(errors).forEach(key => {
                    message.error(errors[key]);
                });
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handlePasswordSubmit = (values) => {
        setPasswordSubmitting(true);

        router.put(route('worker.profile.password'), values, {
            onSuccess: () => {
                message.success('Password updated successfully');
                passwordForm.resetFields();
            },
            onError: (errors) => {
                Object.keys(errors).forEach(key => {
                    message.error(errors[key]);
                });
            },
            onFinish: () => setPasswordSubmitting(false),
        });
    };

    const uploadProps = {
        maxCount: 1,
        beforeUpload: (file) => {
            setProfilePhoto({ originFileObj: file });
            return false;
        },
        fileList: profilePhoto ? [profilePhoto] : [],
        onRemove: () => setProfilePhoto(null),
    };

    const getPhotoUrl = () => {
        if (profilePhoto) {
            return URL.createObjectURL(profilePhoto.originFileObj);
        }
        if (user.profile_photo) {
            return `/storage/${user.profile_photo}`;
        }
        return null;
    };

    const getInitials = () => {
        return user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <WorkerLayout breadcrumbs={[{ label: 'My Profile' }]}>
            <Head title="My Profile" />

            <PageHeader title="My Profile" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Section 1: Personal Information */}
                <Card title="Personal Information">
                    <Form
                        form={personalForm}
                        layout="vertical"
                        onFinish={handlePersonalSubmit}
                        initialValues={{
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            bio: user.bio,
                            experience: user.experience,
                            skill_ids: user.skills,
                        }}
                    >
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Photo
                            </label>
                            <div className="flex items-center gap-4">
                                {getPhotoUrl() ? (
                                    <img
                                        src={getPhotoUrl()}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                                        {getInitials()}
                                    </div>
                                )}
                                <Upload {...uploadProps}>
                                    <Button icon={<UploadOutlined />}>Change Photo</Button>
                                </Upload>
                            </div>
                        </div>

                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: 'Name is required' }]}
                        >
                            <Input prefix={<UserOutlined />} />
                        </Form.Item>

                        <Form.Item label="Email" name="email">
                            <Input disabled />
                        </Form.Item>

                        <Form.Item label="Phone" name="phone">
                            <Input />
                        </Form.Item>

                        <Form.Item label="Bio" name="bio">
                            <TextArea rows={4} placeholder="Tell us about yourself..." />
                        </Form.Item>

                        <Form.Item label="Experience" name="experience">
                            <TextArea rows={4} placeholder="Describe your work experience..." />
                        </Form.Item>

                        <Form.Item label="Skills" name="skill_ids">
                            <Select
                                mode="multiple"
                                placeholder="Select your skills"
                                options={all_skills.map(skill => ({
                                    label: skill.name,
                                    value: skill.id,
                                }))}
                            />
                        </Form.Item>
                        <Alert
                            message="Your skill selection affects which orders admin can assign to you."
                            type="info"
                            showIcon
                            className="mb-4"
                        />

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={submitting} size="large">
                                Save Changes
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

                {/* Section 2: Services Offered */}
                <Card title="Services Offered">
                    {user.services.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {user.services.map(service => (
                                    <Tag key={service.id} color="blue" className="text-base py-1 px-3">
                                        {service.name}
                                    </Tag>
                                ))}
                            </div>
                            <Divider className="my-4" />
                            <Alert
                                message="Services are managed by admin. Contact admin to update."
                                type="info"
                                showIcon
                            />
                        </div>
                    ) : (
                        <Alert
                            message="No services assigned yet"
                            description="Services are managed by admin. Contact admin to get assigned to services."
                            type="warning"
                            showIcon
                        />
                    )}
                </Card>

                {/* Section 3: Change Password */}
                <Card title="Change Password">
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handlePasswordSubmit}
                    >
                        <Form.Item
                            label="Current Password"
                            name="current_password"
                            rules={[{ required: true, message: 'Current password is required' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            label="New Password"
                            name="password"
                            rules={[
                                { required: true, message: 'New password is required' },
                                { min: 8, message: 'Password must be at least 8 characters' },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            label="Confirm New Password"
                            name="password_confirmation"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Please confirm your password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button htmlType="submit" loading={passwordSubmitting}>
                                Update Password
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </WorkerLayout>
    );
}
