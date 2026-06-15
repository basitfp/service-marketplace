import { Select, Input, DatePicker } from 'antd';

const { RangePicker } = DatePicker;

export default function FilterBar({ filters = [], values = {}, onChange }) {
    const handleChange = (key, val) => {
        if (onChange) {
            onChange({ ...values, [key]: val });
        }
    };

    if (!filters || filters.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            {filters.map((filter) => {
                const value = values[filter.key];
                let inputElement = null;

                if (filter.type === 'select') {
                    inputElement = (
                        <Select
                            placeholder={filter.label}
                            className="w-40"
                            value={value}
                            onChange={(v) => handleChange(filter.key, v)}
                            options={filter.options}
                            allowClear
                        />
                    );
                } else if (filter.type === 'input') {
                    inputElement = (
                        <Input
                            placeholder={filter.label}
                            className="w-40"
                            value={value}
                            onChange={(e) => handleChange(filter.key, e.target.value)}
                            allowClear
                        />
                    );
                } else if (filter.type === 'daterange') {
                    inputElement = (
                        <RangePicker
                            className="w-64"
                            value={value}
                            onChange={(dates) => handleChange(filter.key, dates)}
                            allowClear
                        />
                    );
                }

                return (
                    <div key={filter.key} className="flex items-center">
                        {inputElement}
                    </div>
                );
            })}
        </div>
    );
}
