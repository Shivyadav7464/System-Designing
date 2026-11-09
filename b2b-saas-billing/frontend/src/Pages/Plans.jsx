import React from "react";

function Plans({ plans }) {
  return (
    <section className="content-card">
      <div className="section-header">
        <h2>Available Plans</h2>
        <span>{plans.length} plans</span>
      </div>

      {plans.length === 0 ? (
        <p>No plans available.</p>
      ) : (
        plans.map((plan) => (
          <div className="module-row" key={plan.id}>
            <div className="module-icon blue">P</div>

            <div>
              <strong>{plan.name}</strong>
              <p>
                ₹{plan.price} / {plan.billing_cycle}
              </p>
              <small>Plan ID: {plan.id}</small>
            </div>
          </div>
        ))
      )}
    </section>
  );
}

export default Plans;