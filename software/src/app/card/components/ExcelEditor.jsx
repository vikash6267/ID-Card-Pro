"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableHead, TableBody, TableHeader, TableRow, TableCell } from "./ui/table";
import { Trash2, X, Check, ArrowLeft, ArrowRight, Filter, Type, Search, CaseSensitive, AlignLeft, AlignCenter, AlignRight, Maximize2, Minimize2, Undo2, Redo2, ChevronDown, ArrowUpDown, Download, Replace } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';


export function ExcelEditor({ excelData, onSave }) {
  // State management
  const [data, setData] = useState({ headers: [], rows: [] });
const [originalData, setOriginalData] = useState(null); // 🔄 for change tracking
const isDirty = JSON.stringify(data) !== originalData; // ✅ true only if changed
  const [isEditing, setIsEditing] = useState(false);
  const [editCell, setEditCell] = useState({ row: -1, col: -1, value: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTextTools, setShowTextTools] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [findOptions, setFindOptions] = useState({
    caseSensitive: false,
    wholeWord: false,
    currentColumnOnly: false
  });
  const [currentMatch, setCurrentMatch] = useState(0);
  const [matches, setMatches] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [formatConfig, setFormatConfig] = useState({ 
    type: "", 
    positions: "", 
    separator: "-",
    prefix: "",
    suffix: "",
    insertText: "",
    insertPosition: 0
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [columnFilters, setColumnFilters] = useState({});
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [activeFilterColumn, setActiveFilterColumn] = useState("");
  const [filterOptions, setFilterOptions] = useState({});
  const [selectedFilterValues, setSelectedFilterValues] = useState({});
  const [sortConfig, setSortConfig] = useState([]); // Array of { column, direction }
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [columnWidths, setColumnWidths] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState(null);
  const [resizingStartX, setResizingStartX] = useState(0);
  const [resizingStartWidth, setResizingStartWidth] = useState(0);
  
  const tableRef = useRef(null);
  const editorRef = useRef(null);
  const headerRowRef = useRef(null);

  // Initialize data and history
useEffect(() => {
  if (excelData?.headers && excelData?.rows) {
    const initialData = { 
      headers: excelData.headers,
      rows: excelData.rows.map(row => ({ ...row }))
    };
    setData(initialData);
    setOriginalData(JSON.stringify(initialData)); // ✅ Add this
      if (excelData.headers.length > 0) {
        setSelectedColumn(excelData.headers[0]);
      }
      // Initialize history with first state
      setHistory([initialData]);
      setHistoryIndex(0);
      // Initialize filters
      const filters = {};
      excelData.headers.forEach(header => {
        filters[header] = "";
      });
      setColumnFilters(filters);
      
      // Initialize column widths
      const widths = {};
      excelData.headers.forEach(header => {
        widths[header] = 150; // Default width
      });
      setColumnWidths(widths);
    }
  }, [excelData]);

  // Generate filter options when data changes or filters change
  useEffect(() => {
    if (data.headers.length > 0) {
      const options = {};
      const selections = {};
      
      // First get all rows that match current filters (except the column we're filtering)
      const visibleRows = data.rows.filter(row => {
        return Object.entries(columnFilters).every(([col, filter]) => {
          if (!filter || col === activeFilterColumn) return true;
          if (filter.includes('|')) {
            const values = filter.split('|');
            return values.some(val => 
              row[col]?.toString().toLowerCase().includes(val.toLowerCase()));
          }
          return row[col]?.toString().toLowerCase().includes(filter.toLowerCase());
        });
      });
      
      data.headers.forEach(header => {
        const values = {};
        visibleRows.forEach(row => {
          const val = row[header]?.toString() || '';
          values[val] = (values[val] || 0) + 1;
        });
        
        options[header] = Object.entries(values)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([value, count]) => ({ value, count }));
        
        selections[header] = selectedFilterValues[header] || {};
      });
      
      setFilterOptions(options);
      setSelectedFilterValues(selections);
    }
  }, [data, columnFilters, activeFilterColumn]);

  // Fullscreen toggle function
  const toggleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      editorRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // Save state to history
  const saveToHistory = useCallback((newData) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newData]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Update data and save to history
  const updateData = useCallback((newData) => {
    setData(newData);
    saveToHistory(newData);
  }, [saveToHistory]);

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setData(history[historyIndex - 1]);
      setSelectedRows(new Set()); // Clear row selection on undo
    }
  }, [history, historyIndex]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setData(history[historyIndex + 1]);
      setSelectedRows(new Set()); // Clear row selection on redo
    }
  }, [history, historyIndex]);

  // Column operations
  const deleteColumn = useCallback(() => {
    if (selectedColumns.length === 0) {
      toast.warning("Please select at least one column first");
      return;
    }

    const newHeaders = data.headers.filter(header => !selectedColumns.includes(header));
    const newRows = data.rows.map(row => {
      const newRow = { ...row };
      selectedColumns.forEach(col => delete newRow[col]);
      return newRow;
    });

    updateData({ headers: newHeaders, rows: newRows });
    toast.success(`Deleted ${selectedColumns.length} column(s)`);
  }, [data, selectedColumns, updateData]);

  const deleteRow = useCallback((rowIndex) => {
    const actualIndex = currentPage * rowsPerPage + rowIndex;
    const newRows = [...data.rows];
    newRows.splice(actualIndex, 1);
    updateData({ ...data, rows: newRows });
    toast.success("Row deleted");
  }, [data, currentPage, rowsPerPage, updateData]);

  // Column selection with Shift+Click
  const handleColumnHeaderClick = (header, e) => {
    if (e.shiftKey && data.headers.length > 1) {
      if (selectedColumns.length === 0) {
        setSelectedColumns([header]);
        setSelectedColumn(header);
        return;
      }

      const firstIndex = data.headers.indexOf(selectedColumns[0]);
      const clickedIndex = data.headers.indexOf(header);
      const start = Math.min(firstIndex, clickedIndex);
      const end = Math.max(firstIndex, clickedIndex);
      const newSelectedColumns = data.headers.slice(start, end + 1);
      
      setSelectedColumns(newSelectedColumns);
      setSelectedColumn(header);
    } else if (e.ctrlKey || e.metaKey) {
      if (selectedColumns.includes(header)) {
        setSelectedColumns(selectedColumns.filter(col => col !== header));
        if (selectedColumn === header) {
          setSelectedColumn(selectedColumns.length > 1 ? selectedColumns[0] : "");
        }
      } else {
        setSelectedColumns([...selectedColumns, header]);
        setSelectedColumn(header);
      }
    } else {
      setSelectedColumns([header]);
      setSelectedColumn(header);
    }
  };

  // Open column filter
  const openColumnFilter = (header, e) => {
    e.stopPropagation();
    setActiveFilterColumn(header);
    setShowColumnFilter(true);
  };

  // Toggle all filter values for a column
  const toggleAllFilterValues = (header, selectAll) => {
    const newSelections = { ...selectedFilterValues };
    filterOptions[header]?.forEach(({ value }) => {
      newSelections[header][value] = selectAll;
    });
    setSelectedFilterValues(newSelections);
  };

  // Toggle single filter value
  const toggleFilterValue = (header, value) => {
    setSelectedFilterValues(prev => ({
      ...prev,
      [header]: {
        ...prev[header],
        [value]: !prev[header][value]
      }
    }));
  };

  // Apply column filter with new grouped values
  const applyColumnFilter = (header) => {
    const selectedValues = Object.entries(selectedFilterValues[header])
      .filter(([_, isSelected]) => isSelected)
      .map(([value]) => value);
    
    if (selectedValues.length === 0) {
      setColumnFilters({
        ...columnFilters,
        [header]: ""
      });
    } else {
      setColumnFilters({
        ...columnFilters,
        [header]: selectedValues.join('|')
      });
    }
    setShowColumnFilter(false);
    setCurrentPage(0);
  };

  // Clear filter for a column
  const clearColumnFilter = (header) => {
    setSelectedFilterValues(prev => ({
      ...prev,
      [header]: {}
    }));
    setColumnFilters({
      ...columnFilters,
      [header]: ""
    });
    setShowColumnFilter(false);
  };

  // Text transformation with insert at position
  const transformColumnText = (transformFn, config = {}) => {
    const columnsToTransform = selectedColumns.length > 0 ? selectedColumns : [selectedColumn];
    
    if (columnsToTransform.length === 0 || !columnsToTransform[0]) {
      toast.warning("Please select at least one column first");
      return;
    }

    const newRows = data.rows.map(row => {
      const newRow = { ...row };
      columnsToTransform.forEach(col => {
        if (newRow[col] !== undefined && newRow[col] !== null) {
          let value = newRow[col].toString();
          
          if (config.insertText && config.insertPosition >= 0) {
            const position = Math.min(config.insertPosition, value.length);
            value = value.slice(0, position) + config.insertText + value.slice(position);
          } else if (config.prefix || config.suffix) {
            value = `${config.prefix || ''}${value}${config.suffix || ''}`;
          } else {
            value = transformFn(value);
          }
          
          newRow[col] = value;
        }
      });
      return newRow;
    });

    // Clear text inputs after applying
    if (config.insertText || config.prefix || config.suffix) {
      setFormatConfig(prev => ({
        ...prev,
        insertText: '',
        prefix: '',
        suffix: '',
        insertPosition: 0
      }));
    }

    updateData({ ...data, rows: newRows });
    toast.success(`Transformed ${columnsToTransform.join(', ')} column(s)`);
  };

  const handleTextTransform = (action) => {
    const transformFunctions = {
      trim: (value) => value.trim(),
      trimAll: (value) => value.replace(/\s+/g, ' ').trim(),
      removeSpaces: (value) => value.replace(/\s/g, ''),
      extractNumbers: (value) => value.replace(/[^\d]/g, ''),
      extractLetters: (value) => value.replace(/[^a-zA-Z]/g, ''),
      extractAlphanumeric: (value) => value.replace(/[^a-zA-Z0-9]/g, ''),
      toUpper: (value) => value.toUpperCase(),
      addPrefix: (value) => `${formatConfig.prefix || ''}${value}`,
      addSuffix: (value) => `${value}${formatConfig.suffix || ''}`,
      insertText: (value) => {
        const position = Math.min(formatConfig.insertPosition, value.length);
        return value.slice(0, position) + formatConfig.insertText + value.slice(position);
      }
    };

    return transformFunctions[action] || ((value) => value);
  };

  const textFunctions = {
    trim: () => transformColumnText(handleTextTransform('trim')),
    trimAll: () => transformColumnText(handleTextTransform('trimAll')),
    removeSpaces: () => transformColumnText(handleTextTransform('removeSpaces')),
    extractNumbers: () => transformColumnText(handleTextTransform('extractNumbers')),
    extractLetters: () => transformColumnText(handleTextTransform('extractLetters')),
    extractAlphanumeric: () => transformColumnText(handleTextTransform('extractAlphanumeric')),
    toUpper: () => transformColumnText(handleTextTransform('toUpper')),
    addPrefix: () => transformColumnText(handleTextTransform('addPrefix')),
    addSuffix: () => transformColumnText(handleTextTransform('addSuffix')),
    insertText: () => transformColumnText(handleTextTransform('insertText'))
  };

  // Multi-column sorting
  const requestSort = (column) => {
    let direction = 'asc';
    let newSortConfig = [...sortConfig];
    
    // Check if this column is already sorted
    const existingSortIndex = newSortConfig.findIndex(s => s.column === column);
    
    if (existingSortIndex >= 0) {
      // Column is already in sort config - toggle direction
      direction = newSortConfig[existingSortIndex].direction === 'asc' ? 'desc' : 'asc';
      newSortConfig[existingSortIndex].direction = direction;
    } else {
      // Add new sort column (with shift key for multi-sort)
      if (sortConfig.length > 0 && !(window.event?.shiftKey)) {
        // Replace existing sort if shift not held
        newSortConfig = [{ column, direction }];
      } else {
        // Add to existing sorts if shift held
        newSortConfig = [...newSortConfig, { column, direction }];
      }
    }
    
    setSortConfig(newSortConfig);
  };

  // Apply sorting to rows
  const getSortedRows = useCallback((rows) => {
    if (sortConfig.length === 0) return rows;
    
    return [...rows].sort((a, b) => {
      for (const { column, direction } of sortConfig) {
        const aValue = a[column]?.toString().toLowerCase() || '';
        const bValue = b[column]?.toString().toLowerCase() || '';
        
        if (aValue < bValue) {
          return direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return direction === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });
  }, [sortConfig]);

  // Row selection
  const toggleRowSelection = (rowIndex, event) => {
    const actualIndex = currentPage * rowsPerPage + rowIndex;
    const newSelectedRows = new Set(selectedRows);
    
    if (event.shiftKey && selectedRows.size > 0) {
      // Range selection
      const firstSelected = Math.min(...Array.from(selectedRows));
      const lastSelected = Math.max(...Array.from(selectedRows));
      const start = Math.min(firstSelected, actualIndex);
      const end = Math.max(lastSelected, actualIndex);
      
      for (let i = start; i <= end; i++) {
        newSelectedRows.add(i);
      }
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-selection
      if (newSelectedRows.has(actualIndex)) {
        newSelectedRows.delete(actualIndex);
      } else {
        newSelectedRows.add(actualIndex);
      }
    } else {
      // Single selection
      newSelectedRows.clear();
      newSelectedRows.add(actualIndex);
    }
    
    setSelectedRows(newSelectedRows);
  };

  // Bulk delete selected rows
  const deleteSelectedRows = () => {
    if (selectedRows.size === 0) {
      toast.warning("No rows selected");
      return;
    }
    
    const newRows = data.rows.filter((_, index) => !selectedRows.has(index));
    updateData({ ...data, rows: newRows });
    setSelectedRows(new Set());
    toast.success(`Deleted ${selectedRows.size} row(s)`);
  };

  // Column resizing handlers
  const startResize = (column, e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizingColumn(column);
    setResizingStartX(e.clientX);
    setResizingStartWidth(columnWidths[column] || 150);
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };

  const handleResize = (e) => {
    if (!isResizing) return;
    
    const newWidth = resizingStartWidth + (e.clientX - resizingStartX);
    if (newWidth > 50) { // Minimum width
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
      }));
    }
  };

  const stopResize = () => {
    setIsResizing(false);
    setResizingColumn(null);
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "exported_data.xlsx");
    toast.success("Exported to Excel");
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      data.headers.join(","),
      ...filteredRows.map(row => 
        data.headers.map(header => 
          `"${(row[header] || '').toString().replace(/"/g, '""')}"`
        ).join(",")
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "exported_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported to CSV");
  };

  // Enhanced filtering logic
  const filteredRows = data.rows.filter(row => {
    // Global search
    const matchesSearch = searchTerm 
      ? Object.values(row).some(val => 
          val?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    // Column filters
    const matchesColumnFilters = Object.entries(columnFilters).every(([col, filter]) => {
      if (!filter) return true;
      if (filter.includes('|')) {
        // Enhanced filter with multiple values
        const values = filter.split('|');
        return values.some(val => 
          row[col]?.toString().toLowerCase().includes(val.toLowerCase()));
      }
      return row[col]?.toString().toLowerCase().includes(filter.toLowerCase());
    });

    return matchesSearch && matchesColumnFilters;
  });

  // Apply sorting to filtered rows
  const sortedRows = getSortedRows(filteredRows);

  const paginatedRows = sortedRows.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));

  const startEditing = (rowIndex, colName, e) => {
    // Get the actual index from filteredRows (not paginatedRows)
    const actualRowIndex = sortedRows.findIndex(
      (_, index) => index === currentPage * rowsPerPage + rowIndex
    );

    // If we couldn't find the row, use the original index (fallback)
    const cellValue = actualRowIndex !== -1 
      ? sortedRows[actualRowIndex]?.[colName] || ""
      : data.rows[currentPage * rowsPerPage + rowIndex]?.[colName] || "";

    setEditCell({
      row: actualRowIndex !== -1 ? actualRowIndex : currentPage * rowsPerPage + rowIndex,
      col: colName,
      value: cellValue
    });
    setIsEditing(true);
    
    setTimeout(() => {
      const input = document.getElementById(`cell-${rowIndex}-${colName}`);
      if (input) {
        input.focus();
        if (e?.detail === 2) {
          input.setSelectionRange(0, cellValue.length);
        } else {
          input.setSelectionRange(cellValue.length, cellValue.length);
        }
      }
    }, 10);
  };

  const saveEdit = () => {
    const newRows = [...data.rows];
    
    // Find the original row index in the full dataset
    const originalRowIndex = sortedRows[editCell.row] 
      ? data.rows.findIndex(row => row === sortedRows[editCell.row])
      : editCell.row;

    if (originalRowIndex !== -1 && newRows[originalRowIndex]) {
      newRows[originalRowIndex] = {
        ...newRows[originalRowIndex],
        [editCell.col]: editCell.value
      };
      updateData({ ...data, rows: newRows });
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditing) return;
      
      // Navigation keys
      switch (e.key) {
        case 'ArrowUp':
          if (currentPage > 0 || (currentPage === 0 && selectedRows.size > 0)) {
            e.preventDefault();
            const firstSelected = Math.min(...Array.from(selectedRows));
            if (firstSelected > 0) {
              const newSelected = new Set([firstSelected - 1]);
              setSelectedRows(newSelected);
              
              // Scroll to the row if it's not visible
              const rowElement = document.getElementById(`row-${firstSelected - 1}`);
              rowElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
          break;
          
        case 'ArrowDown':
          if (currentPage < totalPages - 1 || (currentPage === totalPages - 1 && selectedRows.size > 0 && Math.max(...Array.from(selectedRows)) < data.rows.length - 1)) {
            e.preventDefault();
            const lastSelected = Math.max(...Array.from(selectedRows));
            if (lastSelected < data.rows.length - 1) {
              const newSelected = new Set([lastSelected + 1]);
              setSelectedRows(newSelected);
              
              // Scroll to the row if it's not visible
              const rowElement = document.getElementById(`row-${lastSelected + 1}`);
              rowElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
          break;
          
        case 'ArrowLeft':
          if (selectedColumn && data.headers.length > 1) {
            e.preventDefault();
            const currentIndex = data.headers.indexOf(selectedColumn);
            if (currentIndex > 0) {
              const newColumn = data.headers[currentIndex - 1];
              setSelectedColumn(newColumn);
              setSelectedColumns([newColumn]);
            }
          }
          break;
          
        case 'ArrowRight':
          if (selectedColumn && data.headers.length > 1) {
            e.preventDefault();
            const currentIndex = data.headers.indexOf(selectedColumn);
            if (currentIndex < data.headers.length - 1) {
              const newColumn = data.headers[currentIndex + 1];
              setSelectedColumn(newColumn);
              setSelectedColumns([newColumn]);
            }
          }
          break;
          
        case 'Delete':
          if (selectedRows.size > 0) {
            e.preventDefault();
            deleteSelectedRows();
          }
          break;
          
        case 'Enter':
          if (selectedRows.size === 1) {
            e.preventDefault();
            const [selectedRow] = Array.from(selectedRows);
            const page = Math.floor(selectedRow / rowsPerPage);
            const rowIndex = selectedRow % rowsPerPage;
            if (page !== currentPage) {
              setCurrentPage(page);
              setTimeout(() => {
                const firstColumn = data.headers[0];
                startEditing(rowIndex, firstColumn);
              }, 100);
            } else {
              const firstColumn = data.headers[0];
              startEditing(rowIndex, firstColumn);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRows, selectedColumn, data, currentPage, totalPages, rowsPerPage, isEditing]);
  useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (isDirty) {
        onSave(data);
        setOriginalData(JSON.stringify(data));
        toast.success("Changes saved (Ctrl+S)");
      } else {
        toast.info("No changes to save");
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isDirty, data]);


  return (
    <div 
      ref={editorRef}
      className={`space-y-4 ${isFullScreen ? 'fixed inset-0 bg-white z-50 p-4 overflow-auto' : 'relative'}`}
    >
      {/* Toolbar - Updated with better spacing and shadows */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm sticky top-0 z-10">
      {/* Find & Replace Button */}
      <Button 
        onClick={() => setShowFindReplace(true)} 
        variant="outline" 
        className="border-gray-300 hover:bg-gray-100"
      >
        <Replace className="w-4 h-4 mr-2" />
        Find & Replace
      </Button>

      <Button onClick={toggleFullScreen} variant="outline" className="border-gray-300 hover:bg-gray-100">
          {isFullScreen ? (
            <Minimize2 className="w-4 h-4 mr-2" />
          ) : (
            <Maximize2 className="w-4 h-4 mr-2" />
          )}
          {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>

        <Button onClick={undo} variant="outline" className="border-gray-300 hover:bg-gray-100" disabled={historyIndex <= 0}>
          <Undo2 className="w-4 h-4 mr-2" />
          Undo
        </Button>

        <Button 
          onClick={redo} 
          variant="outline"
          className="border-gray-300 hover:bg-gray-100"
          disabled={historyIndex >= history.length - 1}
        >
          <Redo2 className="w-4 h-4 mr-2" />
          Redo
        </Button>

        <Button 
          onClick={() => setShowTextTools(!showTextTools)} 
          variant={showTextTools ? "secondary" : "outline"}
          className={showTextTools ? "" : "border-gray-300 hover:bg-gray-100"}
        >
          <Type className="w-4 h-4 mr-2" />
          Text Tools
        </Button>

        <Button 
          onClick={deleteColumn}
          variant="outline"
          className="border-gray-300 hover:bg-gray-100"
          disabled={selectedColumns.length === 0}
        >
          <span className="w-4 h-4 mr-2">−</span>
          Delete Column
        </Button>

        <Button 
          onClick={deleteSelectedRows}
          variant="outline"
          className="border-gray-300 hover:bg-gray-100"
          disabled={selectedRows.size === 0}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Selected ({selectedRows.size})
        </Button>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search in all columns..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="pl-10 border-2 border-gray-800 focus:border-blue-500 focus-visible:ring-0"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={exportToExcel}
            variant="outline"
            className="border-gray-300 hover:bg-gray-100"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button 
            onClick={exportToCSV}
            variant="outline"
            className="border-gray-300 hover:bg-gray-100"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>

<Button
  onClick={() => {
    onSave(data);
    setOriginalData(JSON.stringify(data));
    toast.success("Changes saved ✅");
  }}
  disabled={!isDirty}
  className={`ml-auto text-white ${isDirty ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
>
  <Check className="w-4 h-4 mr-2" />
  Save <span className="ml-1 text-xs opacity-70">(Ctrl+S)</span>
</Button>
      </div>

      {/* Find & Replace Modal */}
      {showFindReplace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Find & Replace</h3>
              <button 
                onClick={() => {
                  setShowFindReplace(false);
                  setMatches([]);
                  setCurrentMatch(0);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Find Input */}
              <div className="space-y-2">
                <Label>Find</Label>
                <div className="flex gap-2">
                  <Input
                    value={findText}
                    onChange={(e) => {
                      setFindText(e.target.value);
                      // Reset matches when search text changes
                      setMatches([]);
                      setCurrentMatch(0);
                    }}
                    placeholder="Text to find..."
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      const newMatches = [];
                      data.rows.forEach((row, rowIndex) => {
                        Object.entries(row).forEach(([col, value]) => {
                          if (findOptions.currentColumnOnly && !selectedColumns.includes(col)) {
                            return;
                          }
                          
                          const stringValue = value?.toString() || '';
                          let isMatch = false;
                          
                          if (findOptions.wholeWord) {
                            const regex = findOptions.caseSensitive
                              ? new RegExp(`\\b${findText}\\b`)
                              : new RegExp(`\\b${findText}\\b`, 'i');
                            isMatch = regex.test(stringValue);
                          } else {
                            if (findOptions.caseSensitive) {
                              isMatch = stringValue.includes(findText);
                            } else {
                              isMatch = stringValue.toLowerCase().includes(findText.toLowerCase());
                            }
                          }
                          
                          if (isMatch) {
                            newMatches.push({ row: rowIndex, col });
                          }
                        });
                      });
                      setMatches(newMatches);
                      setCurrentMatch(0);
                      
                      if (newMatches.length > 0) {
                        // Navigate to the first match
                        const firstMatch = newMatches[0];
                        const page = Math.floor(firstMatch.row / rowsPerPage);
                        setCurrentPage(page);
                      } else {
                        toast.error("No matches found");
                      }
                    }}
                    disabled={!findText}
                  >
                    Find
                  </Button>
                </div>
              </div>

              {/* Replace Input */}
              <div className="space-y-2">
                <Label>Replace</Label>
                <div className="flex gap-2">
                  <Input
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="Replace with..."
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (matches.length === 0 || currentMatch >= matches.length) {
                        toast.error("No match selected");
                        return;
                      }

                      const match = matches[currentMatch];
                      const newRows = [...data.rows];
                      newRows[match.row] = {
                        ...newRows[match.row],
                        [match.col]: replaceText
                      };
                      
                      updateData({ ...data, rows: newRows });
                      toast.success("Replaced successfully");
                      
                      // Remove the replaced match and update matches
                      const newMatches = matches.filter((_, index) => index !== currentMatch);
                      setMatches(newMatches);
                      if (currentMatch >= newMatches.length) {
                        setCurrentMatch(Math.max(0, newMatches.length - 1));
                      }
                    }}
                    disabled={matches.length === 0}
                  >
                    Replace
                  </Button>
                  <Button
                    onClick={() => {
                      if (matches.length === 0) {
                        toast.error("No matches found");
                        return;
                      }

                      const newRows = [...data.rows];
                      matches.forEach(({ row, col }) => {
                        newRows[row] = {
                          ...newRows[row],
                          [col]: replaceText
                        };
                      });
                      
                      updateData({ ...data, rows: newRows });
                      toast.success(`Replaced ${matches.length} occurrences`);
                      
                      // Clear matches after replacing all
                      setMatches([]);
                      setCurrentMatch(0);
                    }}
                    disabled={matches.length === 0}
                  >
                    Replace All
                  </Button>
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={findOptions.caseSensitive}
                    onChange={(e) => setFindOptions(prev => ({
                      ...prev,
                      caseSensitive: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Case sensitive</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={findOptions.wholeWord}
                    onChange={(e) => setFindOptions(prev => ({
                      ...prev,
                      wholeWord: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Whole word</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={findOptions.currentColumnOnly}
                    onChange={(e) => setFindOptions(prev => ({
                      ...prev,
                      currentColumnOnly: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Selected columns only</span>
                </label>
              </div>

              {/* Match Navigation */}
              {matches.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600">
                    Match {currentMatch + 1} of {matches.length}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newIndex = (currentMatch - 1 + matches.length) % matches.length;
                        setCurrentMatch(newIndex);
                        
                        // Navigate to the page containing the match
                        const match = matches[newIndex];
                        const page = Math.floor(match.row / rowsPerPage);
                        setCurrentPage(page);
                      }}
                      disabled={matches.length <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newIndex = (currentMatch + 1) % matches.length;
                        setCurrentMatch(newIndex);
                        
                        // Navigate to the page containing the match
                        const match = matches[newIndex];
                        const page = Math.floor(match.row / rowsPerPage);
                        setCurrentPage(page);
                      }}
                      disabled={matches.length <= 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showTextTools && (
        <div className="bg-white rounded-lg border border-black-300 shadow-5g p-3 space-y-3 w-25 max-w-4xl">
          {/* Header with close button */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">
              Text Transformations
              {selectedColumns.length > 0 && (
                <span className="text-xs font-normal text-gray-500 ml-2">
                  ({selectedColumns.length} selected)
                </span>
              )}
            </h3>
            <button 
              onClick={() => setShowTextTools(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Single line compact action buttons with boxes */}
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-500">
            <Button 
              onClick={textFunctions.trim}
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-3 border border-gray-500 rounded-md bg-white hover:bg-blue-50 shadow-sm"
              title="Trim whitespace from both ends"
            >
              <AlignLeft className="w-3.5 h-3.5 text-blue-500" />
              <span className="ml-1.5">Trim</span>
            </Button>
            <Button 
              onClick={textFunctions.trimAll}
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-3 border border-gray-300 rounded-md bg-white hover:bg-blue-50 shadow-sm"
              title="Trim and collapse multiple spaces"
            >
              <AlignCenter className="w-3.5 h-3.5 text-blue-500" />
              <span className="ml-1.5">Trim All</span>
            </Button>
            <Button 
              onClick={textFunctions.removeSpaces}
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-3 border border-gray-300 rounded-md bg-white hover:bg-blue-50 shadow-sm"
              title="Remove all spaces"
            >
              <AlignRight className="w-3.5 h-3.5 text-blue-500" />
              <span className="ml-1.5">No Spaces</span>
            </Button>
            <Button 
              onClick={textFunctions.extractNumbers}
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-3 border border-gray-300 rounded-md bg-white hover:bg-blue-50 shadow-sm"
              title="Extract only numbers"
            >
              <span className="w-3.5 h-3.5 text-blue-500">123</span>
              <span className="ml-1.5">Numbers</span>
            </Button>
            <Button 
              onClick={textFunctions.extractLetters}
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-3 border border-gray-300 rounded-md bg-white hover:bg-blue-50 shadow-sm"
              title="Extract only letters"
            >
              <Type className="w-3.5 h-3.5 text-blue-500" />
              <span className="ml-1.5">Letters</span>
            </Button>
            <Button 
              onClick={textFunctions.extractAlphanumeric}
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-3 border border-gray-300 rounded-md bg-white hover:bg-blue-50 shadow-sm"
              title="Extract letters and numbers"
            >
              <CaseSensitive className="w-3.5 h-3.5 text-blue-500" />
              <span className="ml-1.5">Alphanumeric</span>
            </Button>
            <Button 
              onClick={textFunctions.toUpper}
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-3 border border-gray-300 rounded-md bg-white hover:bg-blue-50 shadow-sm"
              title="Convert to uppercase"
            >
              <span className="w-8 h-3.5 text-blue-500">A-Z</span>
              <span className="ml-1.5">Uppercase</span>
            </Button>
          </div>

          {/* Combined text modification section in parallel */}
          <div className="grid grid-cols-3 gap-2">
            {/* Prefix box */}
            <div className="space-y-1">
              <Input
                type="text"
                value={formatConfig.prefix}
                onChange={(e) => setFormatConfig({...formatConfig, prefix: e.target.value})}
                placeholder="Prefix..."
                className="h-8 text-xs w-full border-2 border-gray-800 focus:border-blue-500 focus-visible:ring-0"
              />
              <Button 
                onClick={() => transformColumnText(text => text, { prefix: formatConfig.prefix })}
                size="sm"
                className="h-8 w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!formatConfig.prefix}
              >
                Add Prefix
              </Button>
            </div>

            {/* Suffix box */}
            <div className="space-y-1">
              <Input
                type="text"
                value={formatConfig.suffix}
                onChange={(e) => setFormatConfig({...formatConfig, suffix: e.target.value})}
                placeholder="Suffix..."
                className="h-8 text-xs w-full border-2 border-gray-800 focus:border-blue-500 focus-visible:ring-0"
              />
              <Button 
                onClick={() => transformColumnText(text => text, { suffix: formatConfig.suffix })}
                size="sm"
                className="h-8 w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!formatConfig.suffix}
              >
                Add Suffix
              </Button>
            </div>

            {/* Insert box */}
            <div className="space-y-1">
              <div className="flex gap-1">
                <Input
                  type="text"
                  value={formatConfig.insertText}
                  onChange={(e) => setFormatConfig({...formatConfig, insertText: e.target.value})}
                  placeholder="Text..."
                  className="h-8 text-xs w-12 border-2 border-gray-800 focus:border-blue-500 focus-visible:ring-0"
                />
                <Input
                  type="number"
                  value={formatConfig.insertPosition}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      setFormatConfig({...formatConfig, insertPosition: val});
                    }
                  }}
                  placeholder="Pos"
                  className="h-8 text-xs w-12 border-2 border-gray-800 focus:border-blue-500 focus-visible:ring-0"
                  min="0"
                />
              </div>
              <Button 
                onClick={() => transformColumnText(text => text, { 
                  insertText: formatConfig.insertText,
                  insertPosition: formatConfig.insertPosition 
                })}
                size="sm"
                className="h-8 w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!formatConfig.insertText}
              >
                Add Mid text
              </Button>
            </div>
          </div>

          {/* Selected columns indicator */}
          {selectedColumns.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 truncate">
                <span className="font-medium">Applying to:</span> {selectedColumns.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Column Filter Popup */}
      {showColumnFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl w-80 max-h-[70vh] flex flex-col border-2 border-blue-500">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-sm">Filter: {activeFilterColumn}</h3>
              <button 
                onClick={() => setShowColumnFilter(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-500">
                {filterOptions[activeFilterColumn]?.length || 0} items
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="link"
                  size="sm"
                  className="text-xs h-6 px-2 text-blue-600 hover:text-blue-800"
                  onClick={() => toggleAllFilterValues(activeFilterColumn, true)}
                >
                  Select All
                </Button>
                <Button 
                  variant="link"
                  size="sm"
                  className="text-xs h-6 px-2 text-blue-600 hover:text-blue-800"
                  onClick={() => toggleAllFilterValues(activeFilterColumn, false)}
                >
                  Deselect All
                </Button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {filterOptions[activeFilterColumn]?.map(({ value, count }) => (
                <div 
                  key={value} 
                  className="flex items-center px-3 py-1 hover:bg-blue-50 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={!!selectedFilterValues[activeFilterColumn]?.[value]}
                    onChange={() => toggleFilterValue(activeFilterColumn, value)}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="truncate flex-1">{value || <em className="text-gray-400">(empty)</em>}</span>
                  <span className="text-xs text-gray-500 ml-2">{count}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => clearColumnFilter(activeFilterColumn)}
                className="flex-1 border-gray-300 hover:bg-gray-100"
              >
                Clear
              </Button>
              <Button 
                onClick={() => applyColumnFilter(activeFilterColumn)}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table - Updated with blue borders */}
      <div 
        className="border-2 border-blue-200 rounded-lg overflow-auto shadow-sm" 
        style={{ 
          maxHeight: isFullScreen ? 'calc(100vh - 180px)' : '70vh',
          maxWidth: '100%'
        }}
      >
        <Table className="min-w-full">
          <TableHead className="bg-gray-100 sticky top-0">
            <TableRow ref={headerRowRef}>
              {data.headers.map(header => {
                const isSelected = selectedColumns.includes(header);
                const isPrimary = selectedColumn === header;
                const hasFilter = columnFilters[header] && columnFilters[header].length > 0;
                const sortDirection = sortConfig.find(s => s.column === header)?.direction;
                
                return (
                  <TableHeader 
                    key={header}
                    className={`
                      px-4 py-2 text-left cursor-pointer select-none
                      ${isSelected ? 'bg-blue-100' : ''}
                      ${isPrimary ? 'border-b-2 border-blue-500 font-semibold' : ''}
                      hover:bg-blue-50
                      sticky top-0
                      border-r border-blue-200
                    `}
                    onClick={(e) => handleColumnHeaderClick(header, e)}
                    style={{ width: columnWidths[header] || 'auto' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center">
                        {header}
                        {sortDirection && (
                          <ArrowUpDown className={`w-3 h-3 ml-1 ${sortDirection === 'asc' ? 'text-blue-600' : 'text-blue-400'}`} />
                        )}
                      </span>
                      <div className="flex items-center">
                        {hasFilter && (
                          <span className="bg-blue-500 text-white text-xs px-1 rounded mr-1">
                            ✓
                          </span>
                        )}
                        <button 
                          onClick={(e) => openColumnFilter(header, e)}
                          className="text-gray-500 hover:text-blue-600 mr-1"
                        >
                          <Filter className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => requestSort(header)}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div 
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-300 active:bg-blue-500"
                      onMouseDown={(e) => startResize(header, e)}
                    />
                  </TableHeader>
                );
              })}
              <TableHeader className="px-4 py-2 text-left w-20 sticky top-0 border-l border-blue-200">Delete</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, rowIndex) => {
              const actualRowIndex = currentPage * rowsPerPage + rowIndex;
              const isRowSelected = selectedRows.has(actualRowIndex);
              
              return (
                <TableRow 
                  key={rowIndex} 
                  id={`row-${actualRowIndex}`}
                  className={`
                    border-t border-blue-200 
                    ${isRowSelected ? 'bg-blue-100' : 'hover:bg-blue-50'}
                  `}
                  onClick={(e) => toggleRowSelection(actualRowIndex, e)}
                >
                  {data.headers.map(header => {
                    const isColumnSelected = selectedColumns.includes(header);
                    const isEditingThisCell = isEditing &&
                      editCell.row === actualRowIndex &&
                      editCell.col === header;

                    return (
                      <TableCell 
                        key={`${rowIndex}-${header}`}
                        className={`
                          px-4 py-2 border-r border-blue-200
                          ${isColumnSelected ? 'bg-blue-50' : ''}
                          ${isEditingThisCell ? 'border-2 border-blue-500 bg-blue-100' : ''}
                          hover:bg-blue-100
                        `}
                        onDoubleClick={(e) => startEditing(rowIndex, header, e)}
                      >
                        {isEditingThisCell ? (
                          <Input
                            id={`cell-${rowIndex}-${header}`}
                            value={editCell.value}
                            onChange={(e) => setEditCell({ ...editCell, value: e.target.value })}
                            autoFocus
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="h-8 px-2 py-1 border-2 border-gray-800 focus:border-blue-500 focus-visible:ring-0"
                          />
                        ) : (
                      <div 
                        className={`min-h-8 flex items-center p-1 ${
                          matches.some(m => m.row === currentPage * rowsPerPage + rowIndex && m.col === header)
                            ? 'bg-yellow-200'
                            : ''
                        } ${
                          matches[currentMatch]?.row === currentPage * rowsPerPage + rowIndex && 
                          matches[currentMatch]?.col === header
                            ? 'bg-yellow-400'
                            : ''
                        }`}
                      >
                        {row[header] || <span className="text-gray-400">(empty)</span>}
                      </div>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="px-4 py-2 border-l border-blue-100">
                    <Button
                      variant="ghost"
                      size="iconSm"
                      className="hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRow(rowIndex);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Updated with better styling */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Showing {currentPage * rowsPerPage + 1} to {Math.min((currentPage + 1) * rowsPerPage, sortedRows.length)} of {sortedRows.length} entries
          </span>
          <span className="text-sm text-gray-700">
            (Selected: {selectedRows.size})
          </span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="border-2 border-gray-800 rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-gray-100"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-gray-100"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}