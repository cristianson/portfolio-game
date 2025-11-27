import React from "react";

interface JobEntryProps {
  title: string;
  period: string;
  company: string;
  url: string;
  description: string;
  isCurrent?: boolean;
  isLast?: boolean;
  isFirst?: boolean;
}

export function JobEntry({
  title,
  period,
  company,
  url,
  description,
  isCurrent = false,
  isLast = false,
  isFirst = false,
}: JobEntryProps) {
  return (
    <div className="relative pl-6">
      {/* Connector from previous entry */}
      {!isFirst && (
        <div className="absolute left-0 top-0 h-2 w-1 bg-black/20" />
      )}

      {/* Connector to next entry */}
      {!isLast && (
        <div className="absolute left-0 top-2 bottom-[-32px] w-1 bg-black/20" />
      )}

      {/* Dot */}
      <div
        className={`absolute -left-[6px] top-2 w-4 h-4 border-2 border-black rounded-full z-10 ${
          isCurrent ? "bg-blue-500" : "bg-gray-300"
        }`}
      />

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
        <h4 className="text-mono-2xl font-bold leading-tight">{title}</h4>
        <span
          className={`text-mono-base font-bold px-2 py-0.5 rounded border-2 mt-1 sm:mt-0 w-fit whitespace-nowrap ${
            isCurrent
              ? "bg-blue-100 text-blue-800 border-blue-300"
              : "bg-gray-100 text-gray-800 border-gray-300"
          }`}
        >
          {period}
        </span>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-mono-xl text-blue-600 font-bold mb-2 hover:underline inline-block"
      >
        {company}
      </a>
      <p className="text-mono-base leading-relaxed">{description}</p>
    </div>
  );
}
