import React from "react";

function Subscriptions({ subscriptions, onCancelSubscription }) {
    const [statusFilter, setStatusFilter] = React.useState("all");
    
const filteredSubscriptions =
  statusFilter === "all"
    ? subscriptions
    : subscriptions.filter(
        (subscription) => subscription.status === statusFilter
    );      

  return (
    <section className="content-card subscriptions-card">
      <div className="section-header">
        <div>
          <h2>Subscriptions</h2>
          <p>Manage and monitor your organization subscriptions.</p>
        </div>

        
<div className="subscription-toolbar">
  <select
    value={statusFilter}
    onChange={(event) => setStatusFilter(event.target.value)}
    className="subscription-filter"
  >
    <option value="all">All Subscriptions</option>
    <option value="active">Active</option>
    <option value="cancelled">Cancelled</option>
  </select>

  <span className="subscription-count">
    {subscriptions.length} subscriptions
  </span>
</div>

      </div>

      {filteredSubscriptions.length === 0 ? (
        <p>No subscriptions found.</p>
      ) : (
        <div className="subscription-list">
          {filteredSubscriptions.map((subscription) => {
            const subscriptionId =
              subscription.subscription_id ?? subscription.id;

            const isActive = subscription.status === "active";

            return (
              <div className="subscription-item" key={subscriptionId}>
                <div className="module-icon green subscription-icon">S</div>

                <div className="subscription-details">
                  <strong>
                    {subscription.organization_name ||
                      `Subscription #${subscriptionId}`}
                  </strong>

                  <span>
                    {subscription.plan_name || "Plan"}
                    {subscription.price != null
                      ? ` · ₹${subscription.price}`
                      : ""}
                    {subscription.billing_cycle
                      ? ` / ${subscription.billing_cycle}`
                      : ""}
                  </span>

                  <small>Subscription ID: {subscriptionId}</small>
                </div>

                <span
                  className={`subscription-status ${
                    isActive ? "is-active" : "is-cancelled"
                  }`}
                >
                  {subscription.status}
                </span>

                {isActive && (
                  <button
                    className="cancel-subscription-button"
                    onClick={() => onCancelSubscription(subscriptionId)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Subscriptions;