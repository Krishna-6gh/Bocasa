import React from 'react';

interface ChatMarkdownProps {
  content: string;
}

export const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ content }) => {
  // Split into lines or blocks
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let tableBuffer: string[] = [];
  let inTable = false;

  const flushTable = (keyPrefix: string) => {
    if (tableBuffer.length === 0) return;
    const headerRow = tableBuffer[0];
    const dataRows = tableBuffer.slice(2); // skip separator line (e.g. |---|---|)

    const parseRow = (row: string) =>
      row
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1 || (arr.length <= 2 && cell.length > 0));

    const headers = parseRow(headerRow);

    renderedElements.push(
      <div key={`${keyPrefix}-table`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2">
                  {renderInlineFormatting(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
            {dataRows.map((row, rIdx) => {
              const cells = parseRow(row);
              return (
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-800 dark:text-slate-200">
                      {renderInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
    inTable = false;
  };

  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Replace **bold** and `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-slate-900 dark:text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      tableBuffer.push(trimmed);
      return;
    } else if (inTable) {
      flushTable(`tbl-${idx}`);
    }

    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={idx} className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1.5 flex items-center space-x-1.5">
          {renderInlineFormatting(trimmed.substring(4))}
        </h3>
      );
    } else if (trimmed.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={idx} className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2.5 mb-1">
          {renderInlineFormatting(trimmed.substring(5))}
        </h4>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      renderedElements.push(
        <li key={idx} className="ml-4 list-disc text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-0.5">
          {renderInlineFormatting(trimmed.substring(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      renderedElements.push(
        <li key={idx} className="ml-4 list-decimal text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-0.5">
          {renderInlineFormatting(match ? match[2] : trimmed)}
        </li>
      );
    } else if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
      renderedElements.push(
        <div key={idx} className="my-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-700 overflow-x-auto text-center">
          {trimmed.slice(2, -2).trim()}
        </div>
      );
    } else if (trimmed === '') {
      renderedElements.push(<div key={idx} className="h-1.5" />);
    } else {
      renderedElements.push(
        <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-1">
          {renderInlineFormatting(line)}
        </p>
      );
    }
  });

  if (inTable) {
    flushTable('tbl-end');
  }

  return <div className="space-y-0.5 text-xs">{renderedElements}</div>;
};
