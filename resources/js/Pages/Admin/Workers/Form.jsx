import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Form, Input, Select, Switch, Upload, Button, Divider, Card, DatePicker } from 'antd';
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined, KeyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';

export default function WorkerForm({ worker, skills, services }) {
    const isEdit = !!worker;
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (worker) {
            let photoList = [];
            if (worker.profile_photo) {
                photoList = [{
                    uid: '-1',
                    name: 'Current Photo',
                    status: 'done',
                    url: `/storage/${worker.profile_photo}`
                }];
            }
            form.setFieldsValue({
                ...worker,
                profile_photo: photoList,
                status: worker.status === 'active',
                bio: worker.worker_profile?.bio,
                experience: worker.worker_profile?.experience,
                notes: worker.worker_profile?.notes,
                joined_date: worker.worker_profile?.joined_date ? dayjs(worker.worker_profile.joined_date) : null,
                skill_ids: worker.skills ? worker.skills.map(s => s.id) : [],
                service_ids: worker.services ? worker.services.map(s => s.id) : []
            });
        } else {
            form.setFieldsValue({
                status: true,
                joined_date: dayjs()
            });
        }
    }, [worker, form]);

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let pass = '';
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        form.setFieldValue('password', pass);
    };

    const onFinish = (values) => {
        setSubmitting(true);
        
        // Format photo
        if (values.profile_photo) {
            if (Array.isArray(values.profile_photo) && values.profile_photo[0]?.originFileObj) {
                values.profile_photo = values.profile_photo[0].originFileObj;
            } else if (Array.isArray(values.profile_photo) && values.profile_photo.length === 0) {
                values.profile_photo = null;
            } else {
                delete values.profile_photo;
            }
        }

        // Format dates
        if (values.joined_date) {
            values.joined_date = values.joined_date.format('YYYY-MM-DD');
        }

        values.status = values.status ? 'active' : 'inactive';

        if (!values.password) {
            delete values.password;
        }

        const options = {
            onSuccess: () => setSubmitting(false),
            onError: (errors) => {
                setSubmitting(false);
                const formattedErrors = Object.keys(errors).map(key => ({
                    name: key.split('.'),
                    errors: [errors[key]]
                }));
                form.setFields(formattedErrors);
            }
        };

        if (isEdit) {
            router.post(route('admin.workers.update', worker.id), {
                _method: 'PUT',
                ...values
            }, options);
        } else {
            router.post(route('admin.workers.store'), values, options);
        }
    };

    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Worker' : 'New Worker'} />

            <PageHeader 
                title={isEdit ? `Edit: ${worker.name}` : 'Register New Worker'}
                onBack={() => router.get(route('admin.workers.index'))}
            />

            <div className="pb-12">
                <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                    <Form 
                        form={form} 
                        layout="vertical" 
                        onFinish={onFinish}
                        scrollToFirstError
                        size="large"
                    >
                        <Divider titlePlacement="left" className="!text-lg font-medium !text-indigo-900 border-indigo-200 mt-0">
                            Account Information
                        </Divider>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
                                <Input placeholder="e.g. John Doe" />
                            </Form.Item>

                            <Form.Item label="Email Address" name="email" rules={[{ required: true, type: 'email' }]}>
                                <Input placeholder="john@example.com" />
                            </Form.Item>

                            <Form.Item label="Phone Number" name="phone">
                                <Input placeholder="+1 (555) 000-0000" />
                            </Form.Item>

                            <Form.Item label="Password" name="password" rules={[{ min: 8 }]}>
                                <div className="flex gap-2">
                                    <Input.Password 
                                        placeholder={isEdit ? "Leave blank to keep current password" : "Enter or generate password"} 
                                    />
                                    <Button onClick={generatePassword} icon={<KeyOutlined />} title="Auto Generate">
                                        Auto Generate
                                    </Button>
                                </div>
                            </Form.Item>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-6">
                            <Form.Item label="Profile Photo" name="profile_photo" valuePropName="fileList" getValueFromEvent={normFile}>
                                <Upload name="profile_photo" listType="picture-card" maxCount={1} beforeUpload={() => false}>
                                    <div>
                                        <UploadOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>

                            <div>
                                <Form.Item label="Account Active" name="status" valuePropName="checked" className="mb-4">
                                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                                </Form.Item>
                                
                                <Form.Item label="Joined Date" name="joined_date">
                                    <DatePicker className="w-full" />
                                </Form.Item>
                            </div>
                        </div>

                        <Divider titlePlacement="left" className="!text-lg font-medium !text-indigo-900 border-indigo-200">
                            Professional Profile
                        </Divider>

                        <Form.Item label="Bio" name="bio">
                            <Input.TextArea rows={3} placeholder="A short bio about the worker..." />
                        </Form.Item>

                        <Form.Item label="Experience & Qualifications" name="experience">
                            <Input.TextArea rows={4} placeholder="Details about past work, degrees, certifications..." />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <Form.Item label="Skills" name="skill_ids">
                                <Select 
                                    mode="multiple" 
                                    options={skills.map(s => ({ label: s.name, value: s.id }))} 
                                    placeholder="Select professional skills..."
                                    showSearch
                                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>

                            <Form.Item label="Eligible Services" name="service_ids" help="Services this worker is authorized to fulfill.">
                                <Select 
                                    mode="multiple" 
                                    options={services.map(s => ({ label: s.name, value: s.id }))} 
                                    placeholder="Assign to services..."
                                    showSearch
                                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item label="Internal Administrative Notes" name="notes">
                            <Input.TextArea rows={2} placeholder="Notes only visible to administrators..." className="bg-yellow-50" />
                        </Form.Item>

                        <Divider />

                        <div className="flex justify-end gap-3 pt-2">
                            <Button onClick={() => router.get(route('admin.workers.index'))} icon={<ArrowLeftOutlined />} size="large">
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />} size="large">
                                Save Worker
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </>
    );
}

WorkerForm.layout = page => <AdminLayout breadcrumbs={[
            { label: 'Admin', href: route('admin.dashboard') },
            { label: 'Workers', href: route('admin.workers.index') },
            { label: isEdit ? 'Edit Worker' : 'New Worker' }
        ]}>{page}</AdminLayout>;
