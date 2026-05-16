const CATEGORIES = ['All', 'Tutoring', 'Design', 'Delivery', 'Tech', 'Writing', 'Other'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'budget-asc', label: 'Budget (Rs.): low to high' },
  { value: 'budget-desc', label: 'Budget (Rs.): high to low' },
  { value: 'rating-desc', label: 'Rating: highest' },
  { value: 'rating-asc', label: 'Rating: lowest' },
];

export default function GigFilters({ search, category, sort, onSearchChange, onCategoryChange, onSortChange }) {
  return (
    <div className="filters">
      <label className="filter-search">
        <span className="filter-label">Search by name</span>
        <input
          type="search"
          placeholder="Search gig title or description…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>
      <label>
        <span className="filter-label">Category</span>
        <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="filter-label">Sort by</span>
        <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
