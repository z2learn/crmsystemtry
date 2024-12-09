let currentUser = null;

document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        document.getElementById("registerMessage").textContent = data.message;
        document.getElementById("registerMessage").className =
          "alert alert-success";
        document.getElementById("registerForm").reset();
        // Switch to login tab
        bootstrap.Tab.getOrCreateInstance(
          document.querySelector('[data-bs-target="#login-tab"]')
        ).show();
      } else {
        document.getElementById("registerMessage").textContent = data.error;
        document.getElementById("registerMessage").className =
          "alert alert-danger";
      }
    } catch (error) {
      document.getElementById("registerMessage").textContent = "Server error";
      document.getElementById("registerMessage").className =
        "alert alert-danger";
    }
  });

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        currentUser = data.user;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        window.location.href = "/dashboard.html";
      } else {
        document.getElementById("loginMessage").textContent = data.error;
        document.getElementById("loginMessage").className =
          "alert alert-danger";
      }
    } catch (error) {
      document.getElementById("loginMessage").textContent = "Server error";
      document.getElementById("loginMessage").className = "alert alert-danger";
    }
  });
