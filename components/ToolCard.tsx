"use client";
import { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  badge?: string;
}

export default function ToolCard({ title, description, icon, children, badge }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-blue-400 mt-0.5">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">{title}</h2>
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900 text-blue-300">{badge}</span>
            )}
          </div>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
