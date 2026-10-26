import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items?: DropdownItem[];
  children?: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  panelClassName?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  children,
  align = 'right',
  className = '',
  panelClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width?: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 6;
    let left = align === 'right' 
      ? rect.right + window.scrollX - 180 
      : rect.left + window.scrollX;

    // Viewport clamp
    const minLeft = 12;
    const maxLeft = window.innerWidth - 200;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    setCoords({ top, left });
  }, [align]);

  const toggleOpen = () => {
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div ref={triggerRef} className={`relative inline-block ${className}`}>
      <div onClick={toggleOpen} className="cursor-pointer select-none">
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'absolute',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 1100
            }}
            className={`min-w-[180px] p-1.5 rounded-[14px] bg-[#141417]/95 border border-white/10 shadow-2xl backdrop-blur-xl animate-fadeIn ${panelClassName}`}
          >
            {items ? (
              <div className="flex flex-col gap-0.5">
                {items.map((item) => (
                  <button
                    key={item.id}
                    disabled={item.disabled}
                    onClick={() => {
                      item.onClick?.();
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-[8px] text-xs font-medium flex items-center gap-2.5 transition-colors text-left ${
                      item.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : item.danger
                        ? 'text-[#E5484D] hover:bg-[#E5484D]/15'
                        : 'text-[var(--text)] hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {item.icon && <span className="w-3.5 h-3.5 shrink-0 opacity-80">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              children
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
