import { useState, useEffect } from 'react';

const cache = {};

export default function useDynamicFields(categoryId) {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!categoryId) {
            setFields([]);
            return;
        }

        if (cache[categoryId]) {
            setFields(cache[categoryId]);
            return;
        }

        setLoading(true);
        fetch(`/admin/categories/${categoryId}/fields/for-form`)
            .then(res => res.json())
            .then(data => {
                cache[categoryId] = data;
                setFields(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch dynamic fields', err);
                setLoading(false);
            });
    }, [categoryId]);

    return { fields, loading };
}
