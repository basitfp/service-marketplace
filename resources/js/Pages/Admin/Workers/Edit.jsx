import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import WorkerForm from './Form';

function Edit({ worker, skills, services }) {
    return (
        <WorkerForm
            worker={worker}
            skills={skills}
            services={services}
        />
    );
}

Edit.layout = page => (
    <AdminLayout
        breadcrumbs={[
            { title: 'Dashboard', href: route('admin.dashboard') },
            { title: 'Workers', href: route('admin.workers.index') },
            { title: 'Edit' }
        ]}
    >
        {page}
    </AdminLayout>
);

export default Edit;