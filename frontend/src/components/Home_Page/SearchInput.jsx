import { useState } from "react";
import FilterIcon from "/FilterIcon.svg";

/**
 * SearchInput — Filter control matching Wireframe 1.
 * Features the funnel icon with "filter" text below it,
 * expandable into filter pills (ALL, FRIENDS, NEW) and search form.
 * @param {{ onSearch: Function, onFilter: Function }} props
 */
function SearchInput({ onSearch, onFilter }) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    if (onFilter) onFilter(filter);
  };

  return (
    <aside className="home-filter-aside" aria-label="Filter and search">
      {/* Wireframe 1: Funnel icon with "filter" label underneath */}
      <button
        type="button"
        id="home-filter-btn"
        className={`wireframe-filter-trigger ${isExpanded ? "active" : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Toggle search and filters"
        aria-expanded={isExpanded}
      >
        <img src={FilterIcon} alt="Filter" className="filter-funnel-img" />
        <span className="filter-funnel-text">filter</span>
      </button>

      {/* Expandable Filter & Search Panel */}
      <div className={`filter-expand-panel ${isExpanded ? "open" : ""}`} id="filter-options-panel">
        <div className="filter-pill-group">
          <button
            type="button"
            id="filter-all"
            className={`filter-btn-pill ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => handleFilterClick("all")}
          >
            ALL
          </button>
          <button
            type="button"
            id="filter-friends"
            className={`filter-btn-pill ${activeFilter === "friends" ? "active" : ""}`}
            onClick={() => handleFilterClick("friends")}
          >
            FRIENDS
          </button>
          <button
            type="button"
            id="filter-new"
            className={`filter-btn-pill ${activeFilter === "new" ? "active" : ""}`}
            onClick={() => handleFilterClick("new")}
          >
            NEW
          </button>
        </div>

        {/* Search form with accessible label */}
        <form className="filter-search-form" onSubmit={handleSearch}>
          <label htmlFor="search-input" className="visually-hidden">Search posts</label>
          <input
            type="text"
            id="search-input"
            placeholder="Search by tag, user, or title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" id="search-submit-btn" className="filter-search-submit">
            Search
          </button>
        </form>
      </div>
    </aside>
  );
}

export default SearchInput;

