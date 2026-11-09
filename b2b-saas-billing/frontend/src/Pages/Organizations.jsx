import React from "react";

function Organizations({
  organizations,
  showOrganizationForm,
  setShowOrganizationForm,
  organizationName,
  setOrganizationName,
  organizationEmail,
  setOrganizationEmail,
  handleAddOrganization,
}) {
  return (
    <section className="content-card">
      <div className="section-header">
        <h2>Organizations</h2>

        <button
          className="add-button"
          onClick={() => setShowOrganizationForm(!showOrganizationForm)}
        >
          + Add Organization
        </button>
      </div>

      {showOrganizationForm && (
        <form onSubmit={handleAddOrganization}>
          <div>
            <label htmlFor="organizationName">Organization Name</label>
            <input
              id="organizationName"
              type="text"
              placeholder="Enter organization name"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="organizationEmail">Organization Email</label>
            <input
              id="organizationEmail"
              type="email"
              placeholder="Enter organization email"
              value={organizationEmail}
              onChange={(event) => setOrganizationEmail(event.target.value)}
              required
            />
          </div>

          <button type="submit">Save Organization</button>

          <button
            type="button"
            onClick={() => setShowOrganizationForm(false)}
          >
            Cancel
          </button>
        </form>
      )}

      <div>
        {organizations.length === 0 ? (
          <p>No organizations found.</p>
        ) : (
          organizations.map((org) => (
            <div className="module-row" key={org.id}>
              <div className="module-icon purple">O</div>

              <div>
                <strong>{org.name}</strong>
                <p>{org.email}</p>
                <small>Organization ID: {org.id}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Organizations;