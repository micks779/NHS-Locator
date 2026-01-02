
import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search sites or teams..." }) => {
  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className={`h-5 w-5 transition-colors ${value ? 'text-[#005eb8]' : 'text-gray-400'}`} />
      </div>
      <input
        type="text"
        className="block w-full pl-12 pr-12 py-4 border-2 border-gray-100 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#005eb8] sm:text-sm transition-all shadow-sm group-hover:border-gray-200"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
          aria-label="Clear search"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-[#005eb8] transition-colors" />
        </button>
      ) : (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <div className="bg-blue-50 p-1.5 rounded-lg">
            <Search className="h-4 w-4 text-[#005eb8]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
