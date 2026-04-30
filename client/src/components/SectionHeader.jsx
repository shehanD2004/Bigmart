import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({ title, subtitle, actionText, actionTo }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
      </div>
      {actionText && actionTo && (
        <Link
          to={actionTo}
          className="hidden sm:inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
        >
          {actionText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
