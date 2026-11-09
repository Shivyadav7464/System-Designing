import React from "react";

function Dashboard({ organizations, plans, subscriptions }) {
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "active"
  ).length;

  return (
    <>
      <section className="welcome">
        <h2>Welcome to BillFlow</h2>
        <p>Manage your organizations, plans, and subscriptions in one place.</p>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <h3>Total Organizations</h3>
          <p>{organizations.length}</p>
        </div>

        <div className="stat-card">
          <h3>Available Plans</h3>
          <p>{plans.length}</p>
        </div>

        <div className="stat-card">
          <h3>Active Subscriptions</h3>
          <p>{activeSubscriptions}</p>
        </div>

        <div className="stat-card">
          <h3>Payments</h3>
          <p>—</p>
        </div>
      </section>

      <section className="content-card">
        <div className="section-header">
          <h2>Billing Workspace</h2>
        </div>

        <div className="module-row">
          <div className="module-icon purple">O</div>
          <div>
            <strong>Organizations</strong>
            <p>Manage your registered organizations.</p>
          </div>
        </div>

        <div className="module-row">
          <div className="module-icon blue">P</div>
          <div>
            <strong>Plans</strong>
            <p>View available subscription plans.</p>
          </div>
        </div>

        <div className="module-row">
          <div className="module-icon green">S</div>
          <div>
            <strong>Subscriptions</strong>
            <p>Track active and cancelled subscriptions.</p>
          </div>
        </div>

        <div className="module-row">
          <div className="module-icon orange">₹</div>
          <div>
            <strong>Payments</strong>
            <p>Payment gateway integration is not available yet.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Dashboard;