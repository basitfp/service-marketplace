import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import WorkerForm from './Form';

function Create({ skills, services }) {
    return (
        <WorkerForm
            worker={null}
            skills={skills}
            services={services}
        />
    );
}

Create.layout = page => (
    <AdminLayout
        breadcrumbs={[
            { title: 'Dashboard', href: route('admin.dashboard') },
            { title: 'Workers', href: route('admin.workers.index') },
            { title: 'Create' }
        ]}
    >
        {page}
    </AdminLayout>
);

export default Create;