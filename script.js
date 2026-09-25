const STORAGE_KEY = "personalCommandCenterTasks";

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let activeView = "all";

const $ = (id) => document.getElementById(id);

const modal = $("modalBackdrop");
const form = $("taskForm");

document.addEventListener("DOMContentLoaded", () => {
  setCurrentDate();
  bindEvents();
  render();
});

function bindEvents() {
  $("openAddBtn").addEventListener("click", () => openModal());
  $("emptyAddBtn").addEventListener("click", () => openModal());
  $("closeModalBtn").addEventListener("click", closeModal);
  $("cancelBtn").addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  form.addEventListener("submit", saveTask);

  $("searchInput").addEventListener("input", render);
  $("statusFilter").addEventListener("change", render);

  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
      activeView = button.dataset.view;

      document.querySelectorAll(".nav-item")
        .forEach(item => item.classList.remove("active"));

      button.classList.add("active");

      const titles = {
        all: "All Tasks",
        today: "Today",
        upcoming: "Upcoming",
        completed: "Completed",
        cancelled: "Cancelled"
      };

      $("viewTitle").textContent = titles[activeView];

      render();
    });
  });

  $("clearAllBtn").addEventListener("click", () => {
    if (!tasks.length) return;

    if (confirm("Delete all saved tasks? This cannot be undone.")) {
      tasks = [];
      persist();
      render();
      showToast("All tasks deleted");
    }
  });
}

function setCurrentDate() {
  const now = new Date();

  $("currentDate").textContent = now.toLocaleDateString(
    undefined,
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );
}

function openModal(task = null) {
  form.reset();

  $("taskId").value = "";

  if (task) {

    $("modalTitle").textContent = "Edit Task";
    $("saveBtn").textContent = "Update Task";

    $("taskId").value = task.id;
    $("title").value = task.title;
    $("date").value = task.date;
    $("time").value = task.time;
    $("status").value = task.status;
    $("notes").value = task.notes || "";

  } else {

    $("modalTitle").textContent = "New Task";
    $("saveBtn").textContent = "Save Task";

    const now = new Date();

    $("date").value = formatDateInput(now);
    $("time").value = formatTimeInput(now);
  }

  modal.classList.add("open");

  setTimeout(() => {
    $("title").focus();
  }, 50);
}

function closeModal() {
  modal.classList.remove("open");
}

function saveTask(event) {
  event.preventDefault();

  const id = $("taskId").value;

  const data = {
    id: id || crypto.randomUUID(),
    title: $("title").value.trim(),
    date: $("date").value,
    time: $("time").value,
    status: $("status").value,
    notes: $("notes").value.trim()
  };

  if (!data.title || !data.date || !data.time) {
    return;
  }

  if (id) {

    tasks = tasks.map(task =>
      task.id === id ? data : task
    );

    showToast("Task updated");

  } else {

    tasks.push(data);

    showToast("Task created");
  }

  persist();

  closeModal();

  render();
}

function deleteTask(id) {

  const task = tasks.find(item => item.id === id);

  if (!task) return;

  if (confirm(`Delete "${task.title}"?`)) {

    tasks = tasks.filter(item => item.id !== id);

    persist();

    render();

    showToast("Task deleted");
  }
}

function updateStatus(id, status) {

  tasks = tasks.map(task =>
    task.id === id
      ? { ...task, status }
      : task
  );

  persist();

  render();

  showToast("Status updated");
}

function getVisibleTasks() {

  const search =
    $("searchInput").value.trim().toLowerCase();

  const filter =
    $("statusFilter").value;

  const today =
    formatDateInput(new Date());

  return [...tasks]

    .filter(task => {

      if (
        activeView === "today" &&
        task.date !== today
      ) {
        return false;
      }

      if (
        activeView === "upcoming" &&
        task.date <= today
      ) {
        return false;
      }

      if (
        activeView === "completed" &&
        task.status !== "Completed"
      ) {
        return false;
      }

      if (
        activeView === "cancelled" &&
        task.status !== "Cancelled"
      ) {
        return false;
      }

      if (
        filter !== "all" &&
        task.status !== filter
      ) {
        return false;
      }

      if (search) {

        const haystack =
          `${task.title} ${task.notes} ${task.status}`
          .toLowerCase();

        if (!haystack.includes(search)) {
          return false;
        }
      }

      return true;
    })

    .sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(
        `${b.date} ${b.time}`
      )
    );
}

function render() {

  updateStats();

  const visible =
    getVisibleTasks();

  const body =
    $("taskTableBody");

  body.innerHTML = "";

  $("emptyState").style.display =
    visible.length ? "none" : "block";

  visible.forEach(task => {

    const row =
      document.createElement("tr");

    const titleCell =
      document.createElement("td");

    titleCell.innerHTML =
      `<div class="task-title">
        ${escapeHtml(task.title)}
      </div>`;

    const dateCell =
      document.createElement("td");

    dateCell.textContent =
      formatDisplayDate(task.date);

    const timeCell =
      document.createElement("td");

    timeCell.textContent =
      formatDisplayTime(task.time);

    const statusCell =
      document.createElement("td");

    const select =
      document.createElement("select");

    select.className =
      `status-select ${statusClass(task.status)}`;

    [
      "Scheduled",
      "In Progress",
      "Completed",
      "Cancelled"
    ].forEach(status => {

      const option =
        document.createElement("option");

      option.value = status;
      option.textContent = status;
      option.selected =
        task.status === status;

      select.appendChild(option);
    });

    select.addEventListener(
      "change",
      () => updateStatus(
        task.id,
        select.value
      )
    );

    statusCell.appendChild(select);

    const notesCell =
      document.createElement("td");

    notesCell.className =
      "task-notes";

    notesCell.title =
      task.notes || "";

    notesCell.textContent =
      task.notes || "—";

    const actionsCell =
      document.createElement("td");

    actionsCell.innerHTML = `
      <div class="row-actions">

        <button
          class="icon-btn edit"
          title="Edit task">
          ✎
        </button>

        <button
          class="icon-btn delete"
          title="Delete task">
          ×
        </button>

      </div>
    `;

    actionsCell
      .querySelector(".edit")
      .addEventListener(
        "click",
        () => openModal(task)
      );

    actionsCell
      .querySelector(".delete")
      .addEventListener(
        "click",
        () => deleteTask(task.id)
      );

    row.append(
      titleCell,
      dateCell,
      timeCell,
      statusCell,
      notesCell,
      actionsCell
    );

    body.appendChild(row);
  });
}

function updateStats() {

  const today =
    formatDateInput(new Date());

  $("totalCount").textContent =
    tasks.length;

  $("todayCount").textContent =
    tasks.filter(
      task => task.date === today
    ).length;

  $("completedCount").textContent =
    tasks.filter(
      task => task.status === "Completed"
    ).length;

  $("pendingCount").textContent =
    tasks.filter(
      task =>
        task.status === "Scheduled" ||
        task.status === "In Progress"
    ).length;
}

function persist() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );
}

function formatDateInput(date) {

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTimeInput(date) {

  const hours =
    String(date.getHours())
      .padStart(2, "0");

  const minutes =
    String(date.getMinutes())
      .padStart(2, "0");

  return `${hours}:${minutes}`;
}

function formatDisplayDate(value) {

  if (!value) return "—";

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function formatDisplayTime(value) {

  if (!value) return "—";

  const [hours, minutes] =
    value.split(":");

  const date =
    new Date();

  date.setHours(
    Number(hours),
    Number(minutes)
  );

  return date.toLocaleTimeString(
    [],
    {
      hour: "numeric",
      minute: "2-digit"
    }
  );
}

function statusClass(status) {

  return status
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function escapeHtml(value) {

  return value.replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char])
  );
}

let toastTimer;

function showToast(message) {

  const toast =
    $("toast");

  toast.textContent =
    message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(
      () => toast.classList.remove("show"),
      1800
    );
}
