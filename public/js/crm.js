let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  window.location.href = "/index.html";
}

document.getElementById("userName").textContent = currentUser.name;

async function loadCustomers() {
  try {
    const response = await fetch(`/customers/${currentUser.id}`);
    const customers = await response.json();

    const customersList = document.getElementById("customersList");
    customersList.innerHTML = "";

    customers.forEach((customer) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.email || "-"}</td>
                <td>${customer.phone || "-"}</td>
                <td>${customer.company || "-"}</td>
                <td><span class="status-badge status-${customer.status.toLowerCase()}">${
        customer.status
      }</span></td>
                <td>
                    <button class="btn btn-sm btn-primary me-2" onclick="editCustomer(${
                      customer.id
                    })">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${
                      customer.id
                    })">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
      customersList.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading customers:", error);
  }
}

async function addCustomer() {
  const name = document.getElementById("customerName").value;
  const email = document.getElementById("customerEmail").value;
  const phone = document.getElementById("customerPhone").value;
  const company = document.getElementById("customerCompany").value;
  const status = document.getElementById("customerStatus").value;
  const notes = document.getElementById("customerNotes").value;

  try {
    const response = await fetch("/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        company,
        status,
        notes,
        userId: currentUser.id,
      }),
    });

    if (response.ok) {
      bootstrap.Modal.getInstance(
        document.getElementById("addCustomerModal")
      ).hide();
      document.getElementById("addCustomerForm").reset();
      loadCustomers();
    }
  } catch (error) {
    console.error("Error adding customer:", error);
  }
}

async function editCustomer(id) {
  try {
    const response = await fetch(`/customers/${id}`);
    const customer = await response.json();

    document.getElementById("editCustomerId").value = customer.id;
    document.getElementById("editCustomerName").value = customer.name;
    document.getElementById("editCustomerEmail").value = customer.email;
    document.getElementById("editCustomerPhone").value = customer.phone;
    document.getElementById("editCustomerCompany").value = customer.company;
    document.getElementById("editCustomerStatus").value = customer.status;
    document.getElementById("editCustomerNotes").value = customer.notes;

    new bootstrap.Modal(document.getElementById("editCustomerModal")).show();
  } catch (error) {
    console.error("Error loading customer:", error);
  }
}

async function updateCustomer() {
  const id = document.getElementById("editCustomerId").value;
  const name = document.getElementById("editCustomerName").value;
  const email = document.getElementById("editCustomerEmail").value;
  const phone = document.getElementById("editCustomerPhone").value;
  const company = document.getElementById("editCustomerCompany").value;
  const status = document.getElementById("editCustomerStatus").value;
  const notes = document.getElementById("editCustomerNotes").value;

  try {
    const response = await fetch(`/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        company,
        status,
        notes,
      }),
    });

    if (response.ok) {
      bootstrap.Modal.getInstance(
        document.getElementById("editCustomerModal")
      ).hide();
      loadCustomers();
    }
  } catch (error) {
    console.error("Error updating customer:", error);
  }
}

async function deleteCustomer(id) {
  if (confirm("Are you sure you want to delete this customer?")) {
    try {
      const response = await fetch(`/customers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadCustomers();
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "/index.html";
}

// Load customers when page loads
loadCustomers();
