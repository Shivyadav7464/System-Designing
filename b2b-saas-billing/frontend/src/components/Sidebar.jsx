import React from "react";

function Sidebar({ activePage, setActivePage }) {
  const navigationItems = [
    "Dashboard",
    "Organizations",
    "Plans",
    "Subscriptions",
    "Payments",
  ];

  return (
    <aside className="sidebar">
      <h2 className="brand">BillFlow</h2>

      <p className="menu-heading">WORKSPACE</p>

      <nav className="navigation">
        {navigationItems.map((page) => (
          <button
            key={page}
            className={`nav-item ${activePage === page ? "active" : ""}`}
            onClick={() => setActivePage(page)}
          >
            {page}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        B2B SaaS Billing
        <span>Management System</span>
      </div>
    </aside>
  );
}

export default Sidebar;