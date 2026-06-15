import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ServiceForm from './Form';

function Edit({ service, categories, workers }) {
    const existingFieldValues = {};

    if (service && service.field_values) {
        service.field_values.forEach(fv => {
            if (fv.category_field) {
                let val = fv.value;
                const type = fv.category_field.field_type;

                try {
                    if (val && (val.startsWith('[') || val.startsWith('{'))) {
                        val = JSON.parse(val);
                    }
                } catch (e) {}

                if (val && (type === 'image_upload' || type === 'file_upload')) {
                    val = [{
                        uid: fv.id,
                        name: 'Current File',
                        status: 'done',
                        url: `/storage/${val}`,
                        originalPath: val
                    }];
                }

                existingFieldValues[fv.category_field.field_key] = val;
            }
        });
    }

    return (
        <ServiceForm
            service={service}
            categories={categories}
            workers={workers}
            existingFieldValues={existingFieldValues}
        />
    );
}

Edit.layout = page => (
    <AdminLayout
        breadcrumbs={[
            { title: 'Dashboard', href: route('admin.dashboard') },
            { title: 'Services', href: route('admin.services.index') },
            { title: 'Edit' }
        ]}
    >
        {page}
    </AdminLayout>
);

export default Edit;