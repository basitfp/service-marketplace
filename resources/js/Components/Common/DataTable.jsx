import { useState, useEffect } from 'react';
import { Table, Input, Button } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';

export default function DataTable({ 
    columns, 
    dataSource, 
    loading = false, 
    pagination, 
    rowSelection, 
    onSearch, 
    searchPlaceholder = "Search...", 
    extra, 
    exportable = false 
}) {
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (onSearch) {
                onSearch(searchText);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchText, onSearch]);

    const handleExport = () => {
        if (!dataSource || dataSource.length === 0) return;
        
        // Extract headers
        const headers = columns
            .filter(c => c.dataIndex || c.key)
            .map(c => typeof c.title === 'string' ? c.title : c.key || c.dataIndex);
            
        const keys = columns
            .filter(c => c.dataIndex || c.key)
            .map(c => c.dataIndex || c.key);
            
        const csvRows = [headers.join(',')];
        
        for (const row of dataSource) {
            const values = keys.map(key => {
                let val = row[key];
                if (val === null || val === undefined) val = '';
                // Basic escaping for CSV
                return `"${String(val).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex-1 w-full max-w-sm">
                    {onSearch && (
                        <Input
                            placeholder={searchPlaceholder}
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {extra}
                    {exportable && (
                        <Button icon={<DownloadOutlined />} onClick={handleExport}>
                            Export CSV
                        </Button>
                    )}
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                pagination={pagination ? { ...pagination, showSizeChanger: true } : false}
                rowSelection={rowSelection}
                rowKey={(record) => record.id || record.key}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
}
