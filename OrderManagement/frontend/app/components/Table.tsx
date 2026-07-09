import React from 'react';

export interface ColumnHeader {
  label: string;
  key?: string;
  sortable?: boolean;
}

interface TableProps {
  columns: ColumnHeader[];
  onSort?: (key: string) => void;
  currentSort?: string;
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({
  columns,
  onSort,
  currentSort = '',
  children,
}) => {
  const isDesc = currentSort.startsWith('-');
  const activeSortKey = isDesc ? currentSort.slice(1) : currentSort;

  const handleHeaderClick = (column: ColumnHeader) => {
    if (column.sortable && column.key && onSort) {
      onSort(column.key);
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            {columns.map((column, index) => (
              <th
                key={index}
                onClick={() => handleHeaderClick(column)}
                className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                  column.sortable && onSort ? 'cursor-pointer select-none hover:text-slate-800 hover:bg-slate-100/30' : ''
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{column.label}</span>
                  {column.sortable && column.key && (
                    <span className="text-[10px] text-slate-400">
                      {activeSortKey === column.key ? (
                        isDesc ? (
                          // Down arrow
                          <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          // Up arrow
                          <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                          </svg>
                        )
                      ) : (
                        // Neutral arrow placeholder
                        <svg className="w-3.5 h-3.5 opacity-30 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-normal">
          {children}
        </tbody>
      </table>
    </div>
  );
};
