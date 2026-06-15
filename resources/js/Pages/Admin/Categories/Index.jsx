import { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Button, Switch, Space, Dropdown, message, Tooltip, Avatar, Drawer, Form, Input, InputNumber, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, DownOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/Common/PageHeader';
import DataTable from '@/Components/Common/DataTable';
import StatusBadge from '@/Components/Common/StatusBadge';
import ConfirmModal from '@/Components/Common/ConfirmModal';
import FilterBar from '@/Components/Common/FilterBar';

export default function Index({ categories, filters }) {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        slug: '',
        description: '',
        icon: '',
        image: null,
        is_active: true,
        sort_order: 0,
        _method: 'post'
    });

    const openCreateDrawer = () => {
        setEditingCategory(null);
        reset();
        clearErrors();
        setData({
            name: '',
            slug: '',
            description: '',
            icon: '',
            image: null,
            is_active: true,
            sort_order: 0,
            _method: 'post'
        });
        setDrawerOpen(true);
    };

    const openEditDrawer = (category) => {
        setEditingCategory(category);
        reset();
        clearErrors();
        setData({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            icon: category.icon || '',
            image: null,
            is_active: !!category.is_active,
            sort_order: category.sort_order || 0,
            _method: 'put' // Inertia spoofing for file uploads
        });
        setDrawerOpen(true);
    };

    const handleSearch = (value) => {
        router.get(route('admin.categories.index'), { ...filters, search: value }, { preserveState: true, replace: true });
    };

    const handleFilterChange = (newFilters) => {
        router.get(route('admin.categories.index'), { ...filters, ...newFilters }, { preserveState: true, replace: true });
    };

    const toggleStatus = (id) => {
        router.patch(route('admin.categories.toggle-status', id), {}, { preserveScroll: true });
    };

    const confirmDelete = (category) => {
        if (category.services_count > 0) {
            message.error('Cannot delete category with active services.');
            return;
        }
        setCategoryToDelete(category);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (categoryToDelete) {
            router.delete(route('admin.categories.destroy', categoryToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setCategoryToDelete(null);
                    setSelectedRowKeys([]);
                }
            });
        }
    };

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash]);

    const handleBulkAction = (action) => {
        if (selectedRowKeys.length === 0) return;
        
        const url = action === 'delete' ? route('admin.categories.bulk-delete') :
                    action === 'enable' ? route('admin.categories.bulk-enable') :
                    route('admin.categories.bulk-disable');

        router.post(url, { ids: selectedRowKeys }, {
            preserveScroll: true,
            onSuccess: () => setSelectedRowKeys([])
        });
    };

    const handleSubmit = () => {
        if (editingCategory) {
            post(route('admin.categories.update', editingCategory.id), {
                preserveScroll: true,
                onSuccess: () => setDrawerOpen(false)
            });
        } else {
            post(route('admin.categories.store'), {
                preserveScroll: true,
                onSuccess: () => setDrawerOpen(false)
            });
        }
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (img) => (
                <Avatar 
                    src={img ? `/storage/${img}` : null} 
                    icon={!img && <PictureOutlined />}
                    shape="square" 
                    size={40} 
                    className="bg-gray-100 text-gray-400"
                />
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            render: (slug) => <span className="text-gray-500 font-mono text-sm">{slug}</span>
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'status',
            render: (isActive) => <StatusBadge status={isActive ? 'active' : 'inactive'} />
        },
        {
            title: 'Services Count',
            dataIndex: 'services_count',
            key: 'services_count',
            render: (count) => count || 0
        },
        {
            title: 'Sort Order',
            dataIndex: 'sort_order',
            key: 'sort_order',
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Manage Fields">
                        <Button 
                            icon={<SettingOutlined />} 
                            onClick={() => router.get(route('admin.categories.fields.index', record.id))} 
                        />
                    </Tooltip>
                    <Tooltip title="Edit Category">
                        <Button 
                            icon={<EditOutlined />} 
                            onClick={() => openEditDrawer(record)} 
                        />
                    </Tooltip>
                    <Switch 
                        checked={record.is_active} 
                        onChange={() => toggleStatus(record.id)} 
                    />
                    <Tooltip title="Delete Category">
                        <Button 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => confirmDelete(record)} 
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const filterOptions = [
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
            ]
        }
    ];

    const bulkMenu = {
        items: [
            { key: 'enable', label: 'Bulk Enable' },
            { key: 'disable', label: 'Bulk Disable' },
            { key: 'delete', label: 'Bulk Delete', danger: true },
        ],
        onClick: (e) => handleBulkAction(e.key)
    };

    const extraToolbar = selectedRowKeys.length > 0 ? (
        <Dropdown menu={bulkMenu}>
            <Button>
                Bulk Actions <DownOutlined />
            </Button>
        </Dropdown>
    ) : null;

    return (
        <>
            <Head title="Manage Categories" />

            <PageHeader 
                title="Categories" 
                actions={[
                    <Button key="new" type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
                        New Category
                    </Button>
                ]}
            />

            <FilterBar 
                filters={filterOptions} 
                values={filters || {}} 
                onChange={handleFilterChange} 
            />

            <DataTable
                columns={columns}
                dataSource={categories?.data || []}
                loading={false}
                pagination={categories ? {
                    current: categories.current_page,
                    pageSize: categories.per_page,
                    total: categories.total,
                    onChange: (page) => router.get(route('admin.categories.index', { ...filters, page }), {}, { preserveState: true })
                } : false}
                rowSelection={{
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys)
                }}
                onSearch={handleSearch}
                searchPlaceholder="Search categories..."
                extra={extraToolbar}
                exportable={true}
            />

            <ConfirmModal
                open={deleteModalOpen}
                title="Delete Category"
                description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteModalOpen(false)}
                danger={true}
            />

            <Drawer
                title={editingCategory ? 'Edit Category' : 'New Category'}
                width={480}
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                extra={
                    <Space>
                        <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
                        <Button type="primary" onClick={handleSubmit} loading={processing}>
                            {editingCategory ? 'Update' : 'Create'}
                        </Button>
                    </Space>
                }
            >
                <Form layout="vertical">
                    <Form.Item 
                        label="Name" 
                        required 
                        validateStatus={errors.name ? 'error' : ''} 
                        help={errors.name}
                    >
                        <Input 
                            value={data.name} 
                            onChange={(e) => {
                                const val = e.target.value;
                                setData(d => ({
                                    ...d,
                                    name: val,
                                    slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                                }));
                            }} 
                        />
                    </Form.Item>
                    
                    <Form.Item 
                        label="Slug" 
                        validateStatus={errors.slug ? 'error' : ''} 
                        help={errors.slug}
                    >
                        <Input 
                            value={data.slug} 
                            onChange={(e) => setData('slug', e.target.value)} 
                        />
                    </Form.Item>

                    <Form.Item 
                        label="Description" 
                        validateStatus={errors.description ? 'error' : ''} 
                        help={errors.description}
                    >
                        <Input.TextArea 
                            rows={4} 
                            value={data.description} 
                            onChange={(e) => setData('description', e.target.value)} 
                        />
                    </Form.Item>

                    <Form.Item 
                        label="Icon" 
                        validateStatus={errors.icon ? 'error' : ''} 
                        help={errors.icon}
                    >
                        <Input 
                            placeholder="e.g. AppstoreOutlined" 
                            value={data.icon} 
                            onChange={(e) => setData('icon', e.target.value)} 
                        />
                    </Form.Item>

                    <Form.Item 
                        label="Image" 
                        validateStatus={errors.image ? 'error' : ''} 
                        help={errors.image}
                    >
                        <Upload 
                            beforeUpload={(file) => {
                                setData('image', file);
                                return false; // prevent default upload behavior
                            }}
                            maxCount={1}
                            listType="picture"
                            onRemove={() => setData('image', null)}
                            fileList={data.image ? [data.image] : []}
                        >
                            <Button icon={<UploadOutlined />}>Select Image</Button>
                        </Upload>
                        {editingCategory && editingCategory.image && !data.image && (
                            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                                Current: <Avatar src={`/storage/${editingCategory.image}`} shape="square" />
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item 
                        label="Status" 
                        validateStatus={errors.is_active ? 'error' : ''} 
                        help={errors.is_active}
                    >
                        <Switch 
                            checked={data.is_active} 
                            onChange={(checked) => setData('is_active', checked)} 
                            checkedChildren="Active" 
                            unCheckedChildren="Inactive"
                        />
                    </Form.Item>

                    <Form.Item 
                        label="Sort Order" 
                        validateStatus={errors.sort_order ? 'error' : ''} 
                        help={errors.sort_order}
                    >
                        <InputNumber 
                            min={0} 
                            value={data.sort_order} 
                            onChange={(val) => setData('sort_order', val)} 
                            className="w-full"
                        />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    );
}

Index.layout = page => <AdminLayout breadcrumbs={[
                { title: 'Admin', href: '/admin/dashboard' },
                { title: 'Categories' }
            ]}>{page}</AdminLayout>;
