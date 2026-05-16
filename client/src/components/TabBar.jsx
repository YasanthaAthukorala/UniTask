export default function TabBar({ activeTab, onTabChange, myCount, exploreCount }) {
  return (
    <div className="tab-bar" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'mine'}
        className={`tab ${activeTab === 'mine' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('mine')}
      >
        My gigs
        {myCount > 0 && <span className="tab-count">{myCount}</span>}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'explore'}
        className={`tab ${activeTab === 'explore' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('explore')}
      >
        Explore gigs
        {exploreCount > 0 && <span className="tab-count">{exploreCount}</span>}
      </button>
    </div>
  );
}
