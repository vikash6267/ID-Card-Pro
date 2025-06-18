// src/app/card/components/ui/table.jsx
import { memo, useCallback, useEffect, useRef } from 'react';

export const Table = ({ children, className = '', ...props }) => {
  const tableRef = useRef(null);

  // Setup clipboard handling
  useEffect(() => {
    const handlePaste = (e) => {
      if (props.onPaste) {
        e.preventDefault();
        props.onPaste(e.clipboardData);
      }
    };
    
    const table = tableRef.current;
    table?.addEventListener('paste', handlePaste);
    return () => table?.removeEventListener('paste', handlePaste);
  }, [props.onPaste]);

  return (
    <table
      ref={tableRef}
      className={`w-full border-collapse text-sm ${className}`}
      {...props}
    >
      {children}
    </table>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-gray-100 ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody = memo(({ 
  children, 
  className = '', 
  rowHeight = 40,
  visibleRows,
  ...props 
}) => {
  return (
    <tbody 
      className={`divide-y divide-gray-200 ${className}`}
      style={visibleRows ? { height: `${visibleRows.length * rowHeight}px` } : undefined}
      {...props}
    >
      {visibleRows ? visibleRows.map(children) : children}
    </tbody>
  );
});

export const TableHeader = memo(({ 
  children,
  className = '',
  isSelected = false,
  isPrimary = false,
  isResizable = true,
  width,
  onResize,
  ...props 
}) => {
  const headerRef = useRef(null);
  const isResizingRef = useRef(false);

  const handleMouseMove = useCallback((e) => {
    if (isResizingRef.current && headerRef.current && onResize) {
      const newWidth = headerRef.current.offsetWidth + e.movementX;
      onResize(newWidth);
    }
  }, [onResize]);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleResizeStart = useCallback(() => {
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!isResizable) return;

    const header = headerRef.current;
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle w-1 h-full absolute right-0 top-0 cursor-col-resize';
    resizeHandle.addEventListener('mousedown', handleResizeStart);
    
    header?.appendChild(resizeHandle);

    return () => {
      resizeHandle.removeEventListener('mousedown', handleResizeStart);
      header?.removeChild(resizeHandle);
    };
  }, [isResizable, handleResizeStart]);

  return (
    <th
      ref={headerRef}
      className={`
        px-4 py-2 text-left font-medium relative
        ${isSelected ? 'bg-blue-100' : ''}
        ${isPrimary ? 'border-b-2 border-blue-500 font-semibold' : ''}
        hover:bg-blue-50
        cursor-pointer select-none
        ${isResizable ? 'resizable-column' : ''}
        ${className}
      `}
      style={{ width }}
      {...props}
    >
      {children}
    </th>
  );
});

export const TableCell = memo(({ 
  children,
  className = '',
  isSelected = false,
  isEditing = false,
  dataType = 'text',
  format,
  isValid = true,
  errorMessage,
  ...props 
}) => {
  const formatValue = (value) => {
    if (!format) return value;
    switch(dataType) {
      case 'number': 
        return new Intl.NumberFormat(undefined, format).format(value);
      case 'date': 
        return new Intl.DateTimeFormat(undefined, format).format(new Date(value));
      default: 
        return value;
    }
  };

  return (
    <td
      className={`
        px-4 py-2 border
        ${isSelected ? 'bg-blue-50' : ''}
        ${isEditing ? 'border-blue-500 bg-blue-100' : 'border-gray-200'}
        ${!isValid ? 'bg-red-50 text-red-600 border-red-200' : ''}
        hover:bg-blue-50
        ${className}
      `}
      data-error={!isValid ? errorMessage : null}
      {...props}
    >
      <div className="cell-content">
        {formatValue(children)}
      </div>
    </td>
  );
});

export const TableRow = memo(({ 
  children,
  className = '',
  isSelected = false,
  isHighlighted = false,
  onClick,
  ...props 
}) => {
  return (
    <tr
      className={`
        border-t
        ${isSelected ? 'bg-blue-50' : ''}
        ${isHighlighted ? 'bg-yellow-50' : ''}
        hover:bg-gray-50
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
});

// Add display names for better debugging
Table.displayName = 'Table';
TableHead.displayName = 'TableHead';
TableBody.displayName = 'TableBody';
TableHeader.displayName = 'TableHeader';
TableCell.displayName = 'TableCell';
TableRow.displayName = 'TableRow';