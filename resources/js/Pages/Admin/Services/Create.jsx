import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ServiceForm from './Form';

function Create({ categories, workers }) {
    return (
        <ServiceForm
            service={null}
            categories={categories}
            workers={workers}
        />
    );
}

Create.layout = page => (
    <AdminLayout
        breadcrumbs={[
            { title: 'Dashboard', href: route('admin.dashboard') },
            { title: 'Services', href: route('admin.services.index') },
            { title: 'Create' }
        ]}
    >
        {page}
    </AdminLayout>
);

export default Create;