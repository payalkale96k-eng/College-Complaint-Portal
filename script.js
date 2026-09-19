

let complaints =
    JSON.parse(localStorage.getItem("collegeComplaints")) || [];


function showSection(sectionId, element) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active-section");
    });

    document.getElementById(sectionId).classList.add("active-section");


    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });

    if (element) {
        element.classList.add("active");
    }


    const titles = {
        dashboard: "Dashboard",
        submit: "Submit Complaint",
        complaints: "My Complaints"
    };

    document.getElementById("pageTitle").textContent =
        titles[sectionId];


    if (sectionId === "dashboard") {
        updateDashboard();
    }

    if (sectionId === "complaints") {
        renderComplaints();
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}




function generateComplaintId() {

    const year = new Date().getFullYear();

    const number = String(complaints.length + 1)
        .padStart(4, "0");

    return `CMP-${year}-${number}`;
}




document.getElementById("complaintForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const complaint = {

            id: generateComplaintId(),

            category:
                document.getElementById("category").value,

            priority:
                document.getElementById("priority").value,

            subject:
                document.getElementById("subject").value,

            location:
                document.getElementById("location").value,

            date:
                document.getElementById("date").value,

            description:
                document.getElementById("description").value,

            status: "Submitted",

            createdAt:
                new Date().toLocaleString()

        };


        complaints.push(complaint);


        localStorage.setItem(
            "collegeComplaints",
            JSON.stringify(complaints)
        );


        this.reset();


        showToast(
            `Complaint ${complaint.id} submitted successfully!`
        );


        updateDashboard();


        setTimeout(() => {

            showSection(
                "complaints",
                document.querySelectorAll(".nav-link")[2]
            );

        }, 1000);

    });




function updateDashboard() {

    const total = complaints.length;

    const pending = complaints.filter(c =>
        c.status === "Submitted" ||
        c.status === "Under Review"
    ).length;

    const progress = complaints.filter(c =>
        c.status === "Assigned" ||
        c.status === "In Progress"
    ).length;

    const resolved = complaints.filter(c =>
        c.status === "Resolved"
    ).length;


    document.getElementById("totalComplaints")
        .textContent = total;

    document.getElementById("pendingComplaints")
        .textContent = pending;

    document.getElementById("progressComplaints")
        .textContent = progress;

    document.getElementById("resolvedComplaints")
        .textContent = resolved;


    renderRecentComplaints();
}




function renderRecentComplaints() {

    const table =
        document.getElementById("recentComplaints");


    const recent =
        [...complaints].reverse().slice(0, 5);


    if (recent.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No complaints submitted yet.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = recent.map(complaint => `

        <tr>

            <td class="id">
                ${complaint.id}
            </td>

            <td>
                ${escapeHTML(complaint.subject)}
            </td>

            <td>
                ${escapeHTML(complaint.category)}
            </td>

            <td>
                <span class="priority-${complaint.priority.toLowerCase()}">
                    ${complaint.priority}
                </span>
            </td>

            <td>
                ${statusBadge(complaint.status)}
            </td>

        </tr>

    `).join("");
}



function renderComplaints() {

    const table =
        document.getElementById("complaintsTable");


    const search =
        document.getElementById("searchInput")
        .value
        .toLowerCase();


    const status =
        document.getElementById("statusFilter")
        .value;


    let filtered = complaints.filter(complaint => {

        const matchesSearch =
            complaint.id.toLowerCase().includes(search) ||
            complaint.subject.toLowerCase().includes(search) ||
            complaint.category.toLowerCase().includes(search);


        const matchesStatus =
            status === "All" ||
            complaint.status === status;


        return matchesSearch && matchesStatus;

    });


    if (filtered.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;padding:30px;color:#718096">
                    No complaints found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = filtered
        .reverse()
        .map(complaint => `

        <tr>

            <td class="id">
                ${complaint.id}
            </td>

            <td>
                ${escapeHTML(complaint.subject)}
            </td>

            <td>
                ${escapeHTML(complaint.category)}
            </td>

            <td>
                ${complaint.date}
            </td>

            <td>
                <span class="priority-${complaint.priority.toLowerCase()}">
                    ${complaint.priority}
                </span>
            </td>

            <td>
                ${statusBadge(complaint.status)}
            </td>

            <td>

                <button
                    class="action-btn"
                    onclick="viewComplaint('${complaint.id}')">

                    <i class="fa-solid fa-eye"></i>

                </button>


                <button
                    class="action-btn delete-btn"
                    onclick="deleteComplaint('${complaint.id}')">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

    `).join("");
}




function statusBadge(status) {

    let className = "status-submitted";


    if (status === "Under Review") {
        className = "status-review";
    }

    if (
        status === "Assigned" ||
        status === "In Progress"
    ) {
        className = "status-progress";
    }

    if (status === "Resolved") {
        className = "status-resolved";
    }


    return `
        <span class="badge ${className}">
            ${status}
        </span>
    `;
}



function viewComplaint(id) {

    const complaint =
        complaints.find(c => c.id === id);


    if (!complaint) return;


    document.getElementById("modalBody").innerHTML = `

        <h2>
            Complaint Details
        </h2>


        <div class="detail-row">
            <strong>Complaint ID</strong>
            <span>${complaint.id}</span>
        </div>


        <div class="detail-row">
            <strong>Subject</strong>
            <span>
                ${escapeHTML(complaint.subject)}
            </span>
        </div>


        <div class="detail-row">
            <strong>Category</strong>
            <span>
                ${escapeHTML(complaint.category)}
            </span>
        </div>


        <div class="detail-row">
            <strong>Location</strong>
            <span>
                ${escapeHTML(complaint.location)}
            </span>
        </div>


        <div class="detail-row">
            <strong>Priority</strong>
            <span>
                ${complaint.priority}
            </span>
        </div>


        <div class="detail-row">
            <strong>Status</strong>
            ${statusBadge(complaint.status)}
        </div>


        <div class="detail-row">
            <strong>Date</strong>
            <span>
                ${complaint.date}
            </span>
        </div>


        <div class="detail-row">

            <strong>Description</strong>

            <p>
                ${escapeHTML(complaint.description)}
            </p>

        </div>

    `;


    document
        .getElementById("detailsModal")
        .classList.add("show");
}




function closeModal() {

    document
        .getElementById("detailsModal")
        .classList.remove("show");
}


window.addEventListener("click", function(event) {

    const modal =
        document.getElementById("detailsModal");

    if (event.target === modal) {
        closeModal();
    }

});




function deleteComplaint(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this complaint?"
        );


    if (!confirmed) return;


    complaints =
        complaints.filter(c => c.id !== id);


    localStorage.setItem(
        "collegeComplaints",
        JSON.stringify(complaints)
    );


    renderComplaints();

    updateDashboard();

    showToast("Complaint deleted successfully.");
}




function showToast(message) {

    const toast =
        document.getElementById("toast");

    document.getElementById("toastMessage")
        .textContent = message;


    toast.classList.add("show");


    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}



function toggleTheme() {

    document.body.classList.toggle("dark-mode");

}




function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("show");
}




function logout() {

    const confirmLogout =
        confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        showToast("Logged out successfully.");

    }
}



function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}




document.getElementById("date").value =
    new Date().toISOString().split("T")[0];


updateDashboard();