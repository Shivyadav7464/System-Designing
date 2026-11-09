import React from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./Pages/Dashboard";
import Organizations from "./Pages/Organizations";
import Plans from "./Pages/Plans";
import Subscriptions from "./Pages/Subscriptions";
import Payments from "./Pages/Payment";
function App() {
  const [organizations, setOrganizations] = React.useState([]);
  const [plans, setPlans] = React.useState([]);
  const [subscriptions, setSubscriptions] = React.useState([]);

  const [activePage, setActivePage] = React.useState("Dashboard");

  const [showOrganizationForm, setShowOrganizationForm] =
    React.useState(false);

  const [organizationName, setOrganizationName] = React.useState("");
  const [organizationEmail, setOrganizationEmail] = React.useState("");

  React.useEffect(() => {
    async function loadDashboard() {
      try {
        const [orgRes, plansRes, subsRes] = await Promise.all([
          fetch("http://localhost:3000/organizations"),
          fetch("http://localhost:3000/plans"),
          fetch("http://localhost:3000/subscriptions"),
        ]);

        if (!orgRes.ok || !plansRes.ok || !subsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [orgData, plansData, subsData] = await Promise.all([
          orgRes.json(),
          plansRes.json(),
          subsRes.json(),
        ]);

        setOrganizations(
          Array.isArray(orgData)
            ? orgData
            : orgData.organizations || orgData.data || []
        );

        setPlans(
          Array.isArray(plansData)
            ? plansData
            : plansData.plans || plansData.data || []
        );

        setSubscriptions(
          Array.isArray(subsData)
            ? subsData
            : subsData.subscriptions || subsData.data || []
        );
      } catch (error) {
        console.error("Dashboard data loading failed:", error);
      }
    }

    loadDashboard();
  }, []);

  async function handleAddOrganization(event) {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: organizationName.trim(),
          email: organizationEmail.trim().toLowerCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Failed to create organization");
        return;
      }

      alert("Organization created successfully!");

      setOrganizationName("");
      setOrganizationEmail("");
      setShowOrganizationForm(false);

      const orgResponse = await fetch("http://localhost:3000/organizations");

      if (!orgResponse.ok) {
        throw new Error("Organization created, but refreshing the list failed");
      }

      const orgData = await orgResponse.json();

      setOrganizations(
        Array.isArray(orgData)
          ? orgData
          : orgData.organizations || orgData.data || []
      );
    } catch (error) {
      console.error("Organization creation failed:", error);
      alert(error.message || "Something went wrong");
    }
  }

  
async function handleCancelSubscription(subscriptionId) {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this subscription?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `http://localhost:3000/subscriptions/${subscriptionId}/cancel`,
      { method: "PATCH" }
    );

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Failed to cancel subscription");
      return;
    }

    alert(result.message || "Subscription cancelled successfully!");

    const subsResponse = await fetch(
      "http://localhost:3000/subscriptions"
    );

    if (!subsResponse.ok) {
      throw new Error("Failed to refresh subscriptions");
    }

    const subsData = await subsResponse.json();

    setSubscriptions(
      Array.isArray(subsData)
        ? subsData
        : subsData.subscriptions || subsData.data || []
    );
  } catch (error) {
    console.error("Subscription cancellation failed:", error);
    alert(error.message || "Something went wrong");
  }
}

  function renderPage() {
    switch (activePage) {
      case "Dashboard":
        return (
          <Dashboard
            organizations={organizations}
            plans={plans}
            subscriptions={subscriptions}
          />
        );

      case "Organizations":
        return (
          <Organizations
            organizations={organizations}
            showOrganizationForm={showOrganizationForm}
            setShowOrganizationForm={setShowOrganizationForm}
            organizationName={organizationName}
            setOrganizationName={setOrganizationName}
            organizationEmail={organizationEmail}
            setOrganizationEmail={setOrganizationEmail}
            handleAddOrganization={handleAddOrganization}
          />
        );

      case "Plans":
        return <Plans plans={plans} />;

      case "Subscriptions":
  return (
    <Subscriptions
      subscriptions={subscriptions}
      onCancelSubscription={handleCancelSubscription}
    />
  );

      case "Payments":
        return <Payments />;

      default:
        return <Dashboard organizations={organizations} plans={plans} subscriptions={subscriptions} />;
    }
  }

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
        <Header activePage={activePage} />

        {renderPage()}
      </main>
    </div>
  );
}

export default App;