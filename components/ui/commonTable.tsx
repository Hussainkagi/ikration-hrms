"use client";

import type React from "react";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Table,
  Pagination,
  Spinner,
  Button,
  Card,
  Form,
  InputGroup,
  Dropdown,
  Badge,
} from "react-bootstrap";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  width?: string;
  maxWidth?: string;
  sortable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  searchValue?: (row: T) => string;
  filterValue?: (row: T) => any;
}

interface CommonTableProps<T> {
  data?: T[];
  columns?: Column<T>[];
  loading?: boolean;
  striped?: boolean;
  hover?: boolean;
  responsive?: boolean;
  perPage?: number;
  showPagination?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  cardHeader?: React.ReactNode;
  minHeight?: string;
  resizable?: boolean;
  sortable?: boolean;
  showColumnToggle?: boolean;
  showPerPageSelector?: boolean;
  exportable?: boolean;
  selectableRows?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: T) => void;
  rowClickable?: boolean;
  getRowId?: (row: T) => string;
}

function CommonTable<T extends Record<string, any>>({
  data = [],
  columns = [],
  loading = false,
  striped = false,
  hover = true,
  responsive = true,
  perPage = 10,
  showPagination = true,
  showSearch = true,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  emptyIcon = "bi-inbox",
  emptyAction = null,
  className = "",
  cardHeader = null,
  minHeight = "",
  resizable = true,
  sortable = true,
  showColumnToggle = true,
  showPerPageSelector = true,
  exportable = false,
  selectableRows = false,
  onSelectionChange = undefined,
  onRowClick = undefined,
  rowClickable = true,
  getRowId = (row: T) => row._id || row.id,
}: CommonTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchColumn, setSearchColumn] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const [visibleColumns, setVisibleColumns] = useState<Record<number, boolean>>(
    () => columns.reduce((acc, _, index) => ({ ...acc, [index]: true }), {})
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPerPage, setCurrentPerPage] = useState(perPage);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeData, setResizeData] = useState<{
    columnIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, any[]>>({});
  const [openFilterDropdown, setOpenFilterDropdown] = useState<number | null>(
    null
  );
  const [filterSearchTerms, setFilterSearchTerms] = useState<
    Record<string, string>
  >({});
  const [isMobile, setIsMobile] = useState(false);

  const tableRef = useRef<HTMLTableElement>(null);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  };

  const getDistinctValues = (column: Column<T>) => {
    const values = data
      .map((row) => {
        if (column.filterValue) return column.filterValue(row);
        return getNestedValue(row, column.key);
      })
      .filter((value) => value !== null && value !== undefined);

    return [...new Set(values)].sort((a, b) => {
      if (typeof a === "string" && typeof b === "string")
        return a.localeCompare(b);
      if (typeof a === "number" && typeof b === "number") return a - b;
      return String(a).localeCompare(String(b));
    });
  };

  const handleFilterChange = (
    columnKey: string,
    value: any,
    checked: boolean
  ) => {
    setColumnFilters((prev) => {
      const currentFilters = prev[columnKey] || [];
      const newFilters = checked
        ? [...currentFilters, value]
        : currentFilters.filter((f) => f !== value);

      if (newFilters.length === 0) {
        const { [columnKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [columnKey]: newFilters };
    });
    setCurrentPage(1);
  };

  const clearColumnFilter = (columnKey: string) => {
    setColumnFilters((prev) => {
      const { [columnKey]: _, ...rest } = prev;
      return rest;
    });
  };

  const toggleAllValues = (
    columnKey: string,
    distinctValues: any[],
    selectAll: boolean
  ) => {
    if (selectAll) {
      setColumnFilters((prev) => ({
        ...prev,
        [columnKey]: [...distinctValues],
      }));
    } else {
      clearColumnFilter(columnKey);
    }
    setCurrentPage(1);
  };

  const handleMouseDown = (e: React.MouseEvent, columnIndex: number) => {
    if (!resizable || isMobile) return;
    e.preventDefault();
    setIsResizing(true);
    setResizeData({
      columnIndex,
      startX: e.clientX,
      startWidth: (e.target as HTMLElement).parentElement!.offsetWidth,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeData) return;
      const diff = e.clientX - resizeData.startX;
      const newWidth = Math.max(80, resizeData.startWidth + diff);
      setColumnWidths((prev) => ({
        ...prev,
        [resizeData.columnIndex]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeData(null);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, resizeData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".filter-dropdown")) {
        setOpenFilterDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnKey, direction });
  };

  const handleRowClick = (row: T, event: React.MouseEvent) => {
    if (
      (event.target as Element).closest(
        'input[type="checkbox"], button, a, .btn, [data-bs-toggle], .filter-dropdown'
      )
    ) {
      return;
    }
    if (onRowClick && rowClickable) onRowClick(row);
  };

  const handleRowSelect = (
    rowId: string,
    checked: boolean,
    event: React.ChangeEvent
  ) => {
    if (!selectableRows) return;
    event.stopPropagation();
    const newSelection = new Set(selectedRows);
    checked ? newSelection.add(rowId) : newSelection.delete(rowId);
    setSelectedRows(newSelection);
    if (onSelectionChange) onSelectionChange(Array.from(newSelection));
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selectableRows) return;
    const newSelection = checked
      ? new Set(currentData.map((row) => getRowId(row)))
      : new Set<string>();
    setSelectedRows(newSelection);
    if (onSelectionChange) onSelectionChange(Array.from(newSelection));
  };

  const processedData = useMemo(() => {
    let filtered = [...data];

    Object.entries(columnFilters).forEach(([columnKey, selectedValues]) => {
      if (selectedValues.length > 0) {
        const column = columns.find((col) => col.key === columnKey);
        if (column) {
          filtered = filtered.filter((row) => {
            const value = column.filterValue
              ? column.filterValue(row)
              : getNestedValue(row, column.key);
            return selectedValues.includes(value);
          });
        }
      }
    });

    if (searchTerm.trim()) {
      filtered = filtered.filter((row) => {
        if (searchColumn === "all") {
          return columns.some((column) => {
            const value = column.searchValue
              ? column.searchValue(row)
              : getNestedValue(row, column.key);
            return (
              value &&
              String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
          });
        } else {
          const column = columns.find((col) => col.key === searchColumn);
          if (!column) return true;
          const value = column.searchValue
            ? column.searchValue(row)
            : getNestedValue(row, column.key);
          return (
            value &&
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      });
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key!);
        const bValue = getNestedValue(b, sortConfig.key!);
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, searchColumn, sortConfig, columns, columnFilters]);

  const totalPages = Math.ceil(processedData.length / currentPerPage);
  const startIndex = (currentPage - 1) * currentPerPage;
  const endIndex = startIndex + currentPerPage;
  const currentData = useMemo(
    () =>
      showPagination
        ? processedData.slice(startIndex, endIndex)
        : processedData,
    [processedData, startIndex, endIndex, showPagination]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchColumn, currentPerPage]);

  const handleExport = () => {
    if (!exportable) return;
    const visibleCols = columns.filter((_, i) => visibleColumns[i]);
    const csvContent = [
      visibleCols.map((col) => col.header).join(","),
      ...processedData.map((row) =>
        visibleCols
          .map((col) => `"${getNestedValue(row, col.key) || ""}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const searchableColumns = columns.filter(
    (col) => col.searchable !== false && col.key !== "actions"
  );

  const visibleColumnsList = columns.filter((_, i) => visibleColumns[i]);

  const renderFilterDropdown = (column: Column<T>, originalIndex: number) => {
    if (!column.filterable) return null;

    const distinctValues = getDistinctValues(column);
    const selectedFilters = columnFilters[column.key] || [];
    const isOpen = openFilterDropdown === originalIndex;
    const hasActiveFilter = selectedFilters.length > 0;
    const searchTerm = filterSearchTerms[column.key] || "";

    const filteredValues = distinctValues.filter((value) => {
      if (!searchTerm) return true;
      const displayValue =
        value === null || value === undefined ? "(blank)" : String(value);
      return displayValue.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const allSelected = selectedFilters.length === filteredValues.length;

    return (
      <Dropdown
        show={isOpen}
        onToggle={() => {
          setOpenFilterDropdown(isOpen ? null : originalIndex);
          if (isOpen) {
            setFilterSearchTerms((prev) => ({ ...prev, [column.key]: "" }));
          }
        }}
        className="filter-dropdown d-inline-block"
      >
        <Dropdown.Toggle
          as="button"
          className={`btn btn-link p-0 ms-1 ${
            hasActiveFilter ? "text-primary" : "text-muted"
          }`}
          style={{
            border: "none",
            background: "none",
            fontSize: "12px",
            opacity: hasActiveFilter ? 1 : 0.6,
          }}
        >
          <i className={`bi-funnel${hasActiveFilter ? "-fill" : ""}`}></i>
        </Dropdown.Toggle>

        <Dropdown.Menu
          className="shadow-lg border-0"
          style={{ minWidth: "250px", maxHeight: "300px", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown.Header className="d-flex justify-content-between align-items-center">
            <span
              className="text-uppercase fw-bold"
              style={{ fontSize: "0.75rem" }}
            >
              Filter {column.header}
            </span>
            {hasActiveFilter && (
              <Button
                variant="link"
                size="sm"
                className="p-0 text-danger"
                onClick={() => clearColumnFilter(column.key)}
              >
                Clear
              </Button>
            )}
          </Dropdown.Header>

          <Dropdown.Divider />

          <div className="px-3 pb-2">
            <Form.Control
              type="text"
              placeholder="Search values..."
              value={searchTerm}
              onChange={(e) =>
                setFilterSearchTerms((prev) => ({
                  ...prev,
                  [column.key]: e.target.value,
                }))
              }
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <Dropdown.Divider />

          {filteredValues.length > 0 && (
            <>
              <Dropdown.Item
                onClick={() =>
                  toggleAllValues(column.key, filteredValues, !allSelected)
                }
              >
                <Form.Check
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => {}}
                  label={allSelected ? "Deselect All" : "Select All"}
                  style={{ pointerEvents: "none" }}
                />
              </Dropdown.Item>
              <Dropdown.Divider />
            </>
          )}

          {filteredValues.map((value, index) => {
            const isSelected = selectedFilters.includes(value);
            const displayValue =
              value === null || value === undefined ? "(blank)" : String(value);

            return (
              <Dropdown.Item
                key={index}
                onClick={() =>
                  handleFilterChange(column.key, value, !isSelected)
                }
              >
                <Form.Check
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  label={displayValue}
                  style={{ pointerEvents: "none" }}
                />
              </Dropdown.Item>
            );
          })}

          {filteredValues.length === 0 && searchTerm && (
            <Dropdown.Item disabled>
              No values match "{searchTerm}"
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderSearchBar = () => {
    if (!showSearch || loading) return null;

    const activeFiltersCount = Object.keys(columnFilters).length;

    return (
      <div className="mb-4">
        <div
          className={`row g-3 align-items-center ${
            isMobile ? "flex-column" : ""
          }`}
        >
          <div className={isMobile ? "col-12" : "col-md-6"}>
            <div className="d-flex gap-2 flex-column flex-sm-row">
              <Dropdown className={isMobile ? "w-100" : ""}>
                <Dropdown.Toggle
                  variant="outline-secondary"
                  size="sm"
                  className={isMobile ? "w-100" : ""}
                >
                  <i className="bi-funnel me-1"></i>
                  {searchColumn === "all"
                    ? "All Columns"
                    : columns.find((col) => col.key === searchColumn)?.header}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSearchColumn("all")}>
                    All Columns
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  {searchableColumns.map((col) => (
                    <Dropdown.Item
                      key={col.key}
                      onClick={() => setSearchColumn(col.key)}
                    >
                      {col.header}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              <InputGroup className="flex-grow-1">
                <InputGroup.Text>
                  <i className="bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="bi-x"></i>
                  </Button>
                )}
              </InputGroup>
            </div>
          </div>

          <div className={isMobile ? "col-12" : "col-md-6"}>
            <div
              className={`d-flex gap-2 ${
                isMobile ? "flex-wrap" : "justify-content-end"
              }`}
            >
              {showPerPageSelector && (
                <div className="d-flex align-items-center">
                  <small className="me-2">Show:</small>
                  <Form.Select
                    size="sm"
                    style={{ width: "70px" }}
                    value={currentPerPage}
                    onChange={(e) => setCurrentPerPage(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Form.Select>
                </div>
              )}

              {showColumnToggle && !isMobile && (
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <i className="bi-columns-gap me-1"></i>
                    Columns
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {columns.map((col, i) => (
                      <Dropdown.Item
                        key={i}
                        onClick={() =>
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [i]: !prev[i],
                          }))
                        }
                      >
                        <Form.Check
                          type="checkbox"
                          checked={visibleColumns[i]}
                          onChange={() => {}}
                          label={col.header}
                          style={{ pointerEvents: "none" }}
                        />
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              )}

              {exportable && (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={handleExport}
                >
                  <i className="bi-download me-1"></i>
                  {!isMobile && "Export"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {(selectedRows.size > 0 || activeFiltersCount > 0) && (
          <div className="mt-3 d-flex gap-2 flex-wrap">
            {selectedRows.size > 0 && (
              <Badge bg="primary">
                {selectedRows.size} row{selectedRows.size > 1 ? "s" : ""}{" "}
                selected
              </Badge>
            )}
            {activeFiltersCount > 0 && (
              <>
                <Badge bg="warning">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}{" "}
                  active
                </Badge>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => setColumnFilters({})}
                >
                  Clear All Filters
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMobileCard = (row: T, rowIndex: number) => {
    const rowId = getRowId(row);
    const isSelected = selectedRows.has(rowId);

    return (
      <Card
        key={rowId}
        className={`mb-3 ${isSelected ? "border-primary" : ""}`}
        onClick={(e) => handleRowClick(row, e)}
        style={{
          cursor:
            typeof onRowClick === "function" && rowClickable
              ? "pointer"
              : "default",
        }}
      >
        <Card.Body>
          {selectableRows && (
            <div className="mb-2">
              <Form.Check
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleRowSelect(rowId, e.target.checked, e)}
                label="Select"
              />
            </div>
          )}
          {visibleColumnsList.map((column, colIndex) => {
            const value = column.render
              ? column.render(row, rowIndex + startIndex)
              : getNestedValue(row, column.key);

            return (
              <div key={colIndex} className="mb-2">
                <strong className="text-muted small d-block">
                  {column.header}
                </strong>
                <div>{value}</div>
              </div>
            );
          })}
        </Card.Body>
      </Card>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading data...</p>
        </div>
      );
    }

    if (processedData.length === 0 && searchTerm) {
      return (
        <div className="text-center py-5">
          <i className="bi-search display-6 text-muted"></i>
          <h5 className="mt-3 text-muted">No results found</h5>
          <Button variant="outline-primary" onClick={() => setSearchTerm("")}>
            Clear Search
          </Button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-5">
          <i className={`${emptyIcon} display-6 text-muted`}></i>
          <h5 className="mt-3 text-muted">{emptyMessage}</h5>
          {emptyAction}
        </div>
      );
    }

    if (isMobile) {
      return (
        <div>
          {currentData.map((row, index) => renderMobileCard(row, index))}
        </div>
      );
    }

    const TableWrapper = responsive
      ? ({ children }: { children: React.ReactNode }) => (
          <div
            style={{
              overflowX: "auto",
              width: "100%",
              minHeight: minHeight || "auto",
            }}
          >
            {children}
          </div>
        )
      : ({ children }: { children: React.ReactNode }) => <>{children}</>;

    return (
      <TableWrapper>
        <Table
          ref={tableRef}
          striped={striped}
          hover={hover}
          className={className}
          style={{ tableLayout: "auto", minWidth: "100%" }}
        >
          <thead>
            <tr>
              {selectableRows && (
                <th style={{ width: "50px" }}>
                  <Form.Check
                    type="checkbox"
                    checked={
                      currentData.length > 0 &&
                      currentData.every((row) =>
                        selectedRows.has(getRowId(row))
                      )
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {visibleColumnsList.map((column, index) => {
                const originalIndex = columns.indexOf(column);
                const width = columnWidths[originalIndex] || column.width;

                return (
                  <th
                    key={originalIndex}
                    style={{ width, position: "relative" }}
                    className={column.headerClassName}
                    onClick={() =>
                      column.sortable !== false && handleSort(column.key)
                    }
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <span>{column.header}</span>
                        {renderFilterDropdown(column, originalIndex)}
                      </div>
                      {sortable && column.sortable !== false && (
                        <span className="ms-2">
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === "asc" ? (
                              <i className="bi-arrow-up text-primary"></i>
                            ) : (
                              <i className="bi-arrow-down text-primary"></i>
                            )
                          ) : (
                            <i className="bi-arrow-down-up text-muted opacity-50"></i>
                          )}
                        </span>
                      )}
                    </div>

                    {resizable && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: "4px",
                          cursor: "col-resize",
                          borderRight: "2px solid #dee2e6",
                        }}
                        onMouseDown={(e) => handleMouseDown(e, originalIndex)}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isSelected = selectedRows.has(rowId);

              return (
                <tr
                  key={rowId}
                  className={isSelected ? "table-active" : ""}
                  style={{
                    cursor:
                      typeof onRowClick === "function" && rowClickable
                        ? "pointer"
                        : "default",
                  }}
                  onClick={(e) => handleRowClick(row, e)}
                >
                  {selectableRows && (
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleRowSelect(rowId, e.target.checked, e)
                        }
                      />
                    </td>
                  )}
                  {visibleColumnsList.map((column, colIndex) => {
                    const originalIndex = columns.indexOf(column);
                    const width = columnWidths[originalIndex] || column.width;

                    return (
                      <td
                        key={colIndex}
                        className={column.cellClassName}
                        style={{
                          width,
                          maxWidth: column.maxWidth || "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={
                          column.render
                            ? ""
                            : String(getNestedValue(row, column.key))
                        }
                      >
                        {column.render
                          ? column.render(row, rowIndex + startIndex)
                          : getNestedValue(row, column.key)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrapper>
    );
  };

  const renderPagination = () => {
    if (
      !showPagination ||
      totalPages <= 1 ||
      loading ||
      processedData.length === 0
    )
      return null;

    const items = [];
    const maxVisible = isMobile ? 3 : 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Pagination.Item>
        );
      }
    } else {
      items.push(
        <Pagination.Item
          key={1}
          active={1 === currentPage}
          onClick={() => setCurrentPage(1)}
        >
          1
        </Pagination.Item>
      );

      if (currentPage > 3)
        items.push(<Pagination.Ellipsis key="start-ellipsis" />);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Pagination.Item>
        );
      }

      if (currentPage < totalPages - 2)
        items.push(<Pagination.Ellipsis key="end-ellipsis" />);

      if (totalPages > 1) {
        items.push(
          <Pagination.Item
            key={totalPages}
            active={totalPages === currentPage}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </Pagination.Item>
        );
      }
    }

    return (
      <Card.Footer
        className={`d-flex ${
          isMobile
            ? "flex-column gap-3"
            : "justify-content-between align-items-center"
        }`}
      >
        <div className="text-muted small">
          Showing {startIndex + 1} to {Math.min(endIndex, processedData.length)}{" "}
          of {processedData.length} entries
          {(searchTerm || Object.keys(columnFilters).length > 0) && (
            <span> (filtered from {data.length} total)</span>
          )}
        </div>

        <Pagination size="sm" className="mb-0">
          <Pagination.First
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          />
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          />
          {items}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          />
          <Pagination.Last
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          />
        </Pagination>
      </Card.Footer>
    );
  };

  return (
    <Card className="shadow-sm border-0">
      {cardHeader && (
        <Card.Header className="bg-white">{cardHeader}</Card.Header>
      )}
      <Card.Body className={showSearch ? "p-4" : "p-0"}>
        {renderSearchBar()}
        {renderTable()}
      </Card.Body>
      {renderPagination()}
    </Card>
  );
}

export default CommonTable;
