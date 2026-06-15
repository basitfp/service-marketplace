export function BentoGrid({ children, cols = 12, gap = 4, className = '' }) {
    return (
        <div 
            className={`grid ${className}`} 
            style={{ 
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, 
                gap: `${gap * 0.25}rem` 
            }}
        >
            {children}
        </div>
    );
}

export function BentoCell({ children, span = 3, className = '' }) {
    return (
        <div 
            className={className}
            style={{ gridColumn: `span ${span} / span ${span}` }}
        >
            {children}
        </div>
    );
}
