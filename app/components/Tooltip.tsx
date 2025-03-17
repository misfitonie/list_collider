// components/Tooltip.tsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    maxWidth?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({
                                             content,
                                             children,
                                             maxWidth = '15rem',
                                             position = 'top' // Default position is top
                                         }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // Mount check for SSR
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Calculate position to ensure tooltip stays in viewport
    useEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            let x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
            let y = 0;

            // Adjust horizontal position if needed
            if (x < 10) x = 10; // Left boundary
            if (x + tooltipRect.width > viewportWidth - 10) {
                x = viewportWidth - tooltipRect.width - 10; // Right boundary
            }

            // Default to top position for all tooltips regardless of position prop
            y = triggerRect.top - tooltipRect.height - 8;

            // If top would push the tooltip off-screen, only then fallback to other positions
            if (y < 10) {
                if (position === 'bottom' || position === 'top') {
                    // Fallback to bottom
                    y = triggerRect.bottom + 8;
                } else if (position === 'left') {
                    // Try left position
                    x = triggerRect.left - tooltipRect.width - 8;
                    y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                    if (x < 10) {
                        // If left is offscreen, try right
                        x = triggerRect.right + 8;
                    }
                } else if (position === 'right') {
                    // Try right position
                    x = triggerRect.right + 8;
                    y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                    if (x + tooltipRect.width > viewportWidth - 10) {
                        // If right is offscreen, try left
                        x = triggerRect.left - tooltipRect.width - 8;
                    }
                }
            }

            setTooltipPosition({ x, y });
        }
    }, [isVisible, position]);

    const tooltipContent = isVisible && mounted ? (
        createPortal(
            <div
                ref={tooltipRef}
                className="fixed z-[9999] bg-gray-800 text-white text-xs rounded p-2 shadow-lg"
                style={{
                    top: `${tooltipPosition.y}px`,
                    left: `${tooltipPosition.x}px`,
                    maxWidth,
                    pointerEvents: 'none',
                    opacity: 0.95
                }}
            >
                {content}
                {/* Arrow pointing down to the element */}
                <div
                    className="absolute w-2 h-2 bg-gray-800 rotate-45"
                    style={{
                        bottom: '-4px',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}
                />
            </div>,
            document.body
        )
    ) : null;

    return (
        <div className="inline-block" ref={triggerRef}>
            <div
                className="cursor-help"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
            >
                {children}
            </div>

            {tooltipContent}
        </div>
    );
};

export default Tooltip;