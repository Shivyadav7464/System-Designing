import React from "react";

function Header({ activePage }) {
  return (
    <header className="topbar">
      <h1>{activePage}</h1>

      <div className="profile">
        <div className="avatar">A</div>

        <div>
          <strong>Admin</strong>
          <span>Administrator</span>
        </div>
      </div>
    </header>
  );
}

export default Header;