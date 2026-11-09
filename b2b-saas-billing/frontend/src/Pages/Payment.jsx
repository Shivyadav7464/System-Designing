import React from "react";

function Payments() {
  return (
    <section className="content-card">
      <div className="section-header">
        <h2>Payments</h2>
      </div>

      <div className="module-row">
        <div className="module-icon orange">₹</div>

        <div>
          <strong>Payment Management</strong>
          <p>
            Payment gateway integration is not available yet.
          </p>
          <p>
            Payment processing and transaction history will be
            added in a future step.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Payments;