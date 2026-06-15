import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button, Card, Typography, Space, Tag, Popconfirm, Drawer, Form, Input, Select, Switch, InputNumber, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MenuOutlined, SettingOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';

const { Title } = Typography;

export default function Steps({ service, steps }) {
    const [localSteps, setLocalSteps] = useState(steps);
    
    useEffect(() => {
        setLocalSteps(steps);
    }, [steps]);

    // Step Drawer State
    const [stepDrawerVisible, setStepDrawerVisible] = useState(false);
    const [editingStep, setEditingStep] = useState(null);
    const [stepForm] = Form.useForm();

    // Option Drawer State
    const [optionDrawerVisible, setOptionDrawerVisible] = useState(false);
    const [editingOption, setEditingOption] = useState(null);
    const [activeStepId, setActiveStepId] = useState(null);
    const [optionForm] = Form.useForm();

    const [submitting, setSubmitting] = useState(false);

    // --- Step Actions ---
    const openStepDrawer = (step = null) => {
        setEditingStep(step);
        stepForm.resetFields();
        if (step) {
            stepForm.setFieldsValue({ ...step, is_required: Boolean(step.is_required) });
        } else {
            stepForm.setFieldsValue({ input_type: 'single_select', is_required: true, sort_order: steps.length });
        }
        setStepDrawerVisible(true);
    };

    const onStepFinish = (values) => {
        setSubmitting(true);
        const options = {
            onSuccess: () => setStepDrawerVisible(false),
            onFinish: () => setSubmitting(false)
        };
        if (editingStep) {
            router.put(route('admin.services.steps.update', { service: service.id, step: editingStep.id }), values, options);
        } else {
            router.post(route('admin.services.steps.store', service.id), values, options);
        }
    };

    const deleteStep = (id) => {
        router.delete(route('admin.services.steps.destroy', { service: service.id, step: id }), { preserveScroll: true });
    };

    // --- Option Actions ---
    const openOptionDrawer = (stepId, option = null) => {
        setActiveStepId(stepId);
        setEditingOption(option);
        optionForm.resetFields();
        if (option) {
            optionForm.setFieldsValue({ ...option, is_default: Boolean(option.is_default) });
        } else {
            optionForm.setFieldsValue({ credit_cost: 0, is_default: false, sort_order: 0 });
        }
        setOptionDrawerVisible(true);
    };

    const onOptionFinish = (values) => {
        setSubmitting(true);
        const options = {
            onSuccess: () => setOptionDrawerVisible(false),
            onFinish: () => setSubmitting(false)
        };
        if (editingOption) {
            router.put(route('admin.steps.options.update', { step: activeStepId, option: editingOption.id }), values, options);
        } else {
            router.post(route('admin.steps.options.store', activeStepId), values, options);
        }
    };

    const deleteOption = (stepId, optionId) => {
        router.delete(route('admin.steps.options.destroy', { step: stepId, option: optionId }), { preserveScroll: true });
    };

    // --- Native Drag and Drop ---
    const onDragStart = (e, index) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('dragIndex', index.toString());
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = Number(e.dataTransfer.getData('dragIndex'));
        if (dragIndex === dropIndex) return;

        const newSteps = [...localSteps];
        const [draggedItem] = newSteps.splice(dragIndex, 1);
        newSteps.splice(dropIndex, 0, draggedItem);
        setLocalSteps(newSteps);

        router.post(route('admin.services.steps.reorder', service.id), {
            orderedIds: newSteps.map(s => s.id)
        }, { preserveScroll: true, preserveState: true });
    };

    return (
        <>
            <Head title={`Steps - ${service.name}`} />

            <PageHeader 
                title={`${service.name} — Workflow Steps`}
                subtitle="Configure the multi-step configuration wizard clients will complete when ordering this service."
                onBack={() => router.get(route('admin.services.edit', service.id))}
                actions={[
                    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => openStepDrawer()}>
                        Add Step
                    </Button>
                ]}
            />

            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                {localSteps.map((step, index) => (
                    <Card 
                        key={step.id} 
                        className="shadow-sm border border-gray-200"
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, index)}
                        title={
                            <div className="flex items-center gap-3">
                                <MenuOutlined className="text-gray-400 cursor-move" />
                                <span className="font-semibold text-lg">{step.name}</span>
                                <Tag color={step.input_type === 'single_select' ? 'blue' : 'purple'}>
                                    {step.input_type === 'single_select' ? 'Single Choice' : 'Multiple Choice'}
                                </Tag>
                                {step.is_required && <Tag color="red">Required</Tag>}
                            </div>
                        }
                        extra={
                            <Space onClick={(e) => e.stopPropagation()}>
                                <Button size="small" icon={<EditOutlined />} onClick={() => openStepDrawer(step)}>Edit Step</Button>
                                <Popconfirm title="Delete this step and all its options?" onConfirm={() => deleteStep(step.id)}>
                                    <Button size="small" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Space>
                        }
                    >
                        {step.description && <p className="text-gray-600 mb-4">{step.description}</p>}
                        
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100" onDragOver={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium text-gray-700">Options for this step</span>
                                <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={() => openOptionDrawer(step.id)}>
                                    Add Option
                                </Button>
                            </div>

                            <List
                                size="small"
                                dataSource={step.options}
                                locale={{ emptyText: 'No options configured. Users will not be able to proceed past this step.' }}
                                renderItem={option => (
                                    <List.Item
                                        actions={[
                                            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openOptionDrawer(step.id, option)} />,
                                            <Popconfirm title="Delete option?" onConfirm={() => deleteOption(step.id, option.id)}>
                                                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        ]}
                                    >
                                        <div className="flex flex-col w-full">
                                            <div className="flex justify-between w-full">
                                                <Space>
                                                    <span className="font-medium">{option.label}</span>
                                                    {option.is_default && <Tag color="green" size="small">Default</Tag>}
                                                </Space>
                                                <span className="text-green-600 font-semibold">+{option.credit_cost} Credits</span>
                                            </div>
                                            {option.description && <span className="text-xs text-gray-500 mt-1">{option.description}</span>}
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </Card>
                ))}
                {localSteps.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 shadow-sm">
                        <SettingOutlined className="text-4xl text-gray-300 mb-4" />
                        <Title level={4} className="text-gray-600">No Workflow Steps</Title>
                        <p className="text-gray-500 mb-6">Create steps to build a configuration wizard for clients.</p>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openStepDrawer()} size="large">Create First Step</Button>
                    </div>
                )}
            </div>

            {/* Step Drawer */}
            <Drawer
                title={editingStep ? 'Edit Step' : 'New Step'}
                width={500}
                onClose={() => setStepDrawerVisible(false)}
                open={stepDrawerVisible}
                extra={
                    <Space>
                        <Button onClick={() => setStepDrawerVisible(false)}>Cancel</Button>
                        <Button type="primary" onClick={() => stepForm.submit()} loading={submitting}>
                            Save Step
                        </Button>
                    </Space>
                }
            >
                <Form form={stepForm} layout="vertical" onFinish={onStepFinish}>
                    <Form.Item label="Step Name" name="name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Choose Format" />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={3} placeholder="Instructions for the user..." />
                    </Form.Item>
                    <Form.Item label="Input Type" name="input_type" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="single_select">Single Choice (Radio buttons)</Select.Option>
                            <Select.Option value="multi_select">Multiple Choice (Checkboxes)</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Required Step?" name="is_required" valuePropName="checked">
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                    <Form.Item label="Sort Order" name="sort_order" hidden>
                        <InputNumber />
                    </Form.Item>
                </Form>
            </Drawer>

            {/* Option Drawer */}
            <Drawer
                title={editingOption ? 'Edit Option' : 'New Option'}
                width={400}
                onClose={() => setOptionDrawerVisible(false)}
                open={optionDrawerVisible}
                extra={
                    <Space>
                        <Button onClick={() => setOptionDrawerVisible(false)}>Cancel</Button>
                        <Button type="primary" onClick={() => optionForm.submit()} loading={submitting}>
                            Save Option
                        </Button>
                    </Space>
                }
            >
                <Form form={optionForm} layout="vertical" onFinish={onOptionFinish}>
                    <Form.Item label="Option Label" name="label" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Source File" />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={2} placeholder="Optional details..." />
                    </Form.Item>
                    <Form.Item label="Extra Credit Cost" name="credit_cost" rules={[{ required: true }]}>
                        <InputNumber min={0} className="w-full" prefix="+" suffix="Credits" />
                    </Form.Item>
                    <Form.Item label="Selected by Default?" name="is_default" valuePropName="checked">
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                    <Form.Item label="Sort Order" name="sort_order" hidden>
                        <InputNumber />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    );
}

Steps.layout = page => <AdminLayout breadcrumbs={[
            { title: 'Admin', href: route('admin.dashboard') },
            { title: 'Services', href: route('admin.services.index') },
            { title: 'Edit Service', href: route('admin.services.index') },
            { title: 'Workflow Steps' }
        ]}>{page}</AdminLayout>;
