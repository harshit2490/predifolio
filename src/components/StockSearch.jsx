import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiLoader } from 'react-icons/fi';

function StockSearch({ value, onChange, id, placeholder, autoFocus }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const encoded = encodeURIComponent(searchQuery.trim());
      const res = await fetch(
        `/api/screener/company/search/?q=${encoded}`
      );

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      setSuggestions(data || []);
      setIsOpen(data && data.length > 0);
      setActiveIndex(-1);
    } catch (err) {
      // Fallback: try direct API (may fail due to CORS)
      try {
        const encoded = encodeURIComponent(searchQuery.trim());
        const res = await fetch(
          `https://www.screener.in/api/company/search/?q=${encoded}`
        );
        const data = await res.json();
        setSuggestions(data || []);
        setIsOpen(data && data.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    // Debounce: clear previous timer, set new 1.5s timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 800);
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.name);
    onChange(suggestion.name);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          e.preventDefault();
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="stock-search-wrapper" ref={wrapperRef}>
      <div className="stock-search-input-wrap">
        <input
          id={id}
          className="form-input stock-search-input"
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder || 'Search stock name...'}
          autoComplete="off"
          autoFocus={autoFocus}
        />
        <div className="stock-search-icon">
          {loading ? (
            <FiLoader className="stock-search-spinner" />
          ) : (
            <FiSearch />
          )}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="stock-search-dropdown">
          {suggestions.map((s, index) => (
            <li
              key={s.id}
              className={`stock-search-item ${index === activeIndex ? 'active' : ''
                }`}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="stock-search-name">{s.name}</span>
              <span className="stock-search-url">
                {s.url?.split('/company/')[1]?.replace(/\//g, '').replace('consolidated', '') || ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StockSearch;
