import React from 'react';

export interface TopRow {
  label: string;
  count: number;
}

interface TopListProps {
  title: string;
  rows: TopRow[];
  emptyText: string;
  /** Optional explanation shown via an info icon next to the title. */
  hint?: string;
}

// A small ranked "label → count" panel used by the analytics dashboard.
const TopList: React.FC<TopListProps> = ({ title, rows, emptyText, hint }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center gap-1.5 mb-4">
      <h3 className="text-base font-semibold text-gray-700">{title}</h3>
      {hint && (
        <span
          className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 text-gray-500 text-[10px] font-semibold cursor-help leading-none"
          title={hint}
          aria-label={hint}
          role="img"
        >
          i
        </span>
      )}
    </div>
    {rows.length === 0 ? (
      <p className="text-sm text-gray-500">{emptyText}</p>
    ) : (
      <ol className="space-y-2">
        {rows.map((row, index) => (
          <li
            key={`${row.label}-${index}`}
            className="flex justify-between items-center text-sm"
          >
            <span className="text-gray-900 truncate mr-3">
              {index + 1}. {row.label}
            </span>
            <span className="text-gray-500 font-medium whitespace-nowrap">{row.count}</span>
          </li>
        ))}
      </ol>
    )}
  </div>
);

export default TopList;
