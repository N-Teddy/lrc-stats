import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ currentPage, totalItems, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / pageSize);

    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => onPageChange(1)}
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                >1</button>
            );
            if (start > 2) pages.push(<MoreHorizontal key="start-dots" size={14} color="var(--text-muted)" />);
        }

        for (let i = start; i <= end; i++) {
            const isActive = i === currentPage;
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={isActive ? 'glass' : ''}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isActive ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'transparent',
                        color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                        fontWeight: isActive ? '700' : '400',
                        transition: 'all 0.2s'
                    }}
                >
                    {i}
                </button>
            );
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push(<MoreHorizontal key="end-dots" size={14} color="var(--text-muted)" />);
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                >{totalPages}</button>
            );
        }

        return pages;
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.3 : 1
                }}
            >
                <ChevronLeft size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {renderPageNumbers()}
            </div>

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.3 : 1
                }}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;
