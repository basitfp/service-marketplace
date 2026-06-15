import { Breadcrumb } from 'antd';
import { Link } from '@inertiajs/react';

export default function PageHeader({ title, breadcrumbs = [], actions = [] }) {
    const breadcrumbItems = breadcrumbs.map((crumb) => ({
        title: crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label,
    }));

    return (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 m-0 mb-2">{title}</h1>
                {breadcrumbs.length > 0 && (
                    <Breadcrumb items={breadcrumbItems} />
                )}
            </div>
            {actions.length > 0 && (
                <div className="flex items-center gap-3">
                    {actions.map((action, idx) => (
                        <span key={idx}>{action}</span>
                    ))}
                </div>
            )}
        </div>
    );
}
