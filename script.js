/* =========================================================
   PERSONAL COMMAND CENTER
   TASK MANAGEMENT + LOCAL STORAGE + THEME
   ========================================================= */

const STORAGE_KEY = "personalCommandCenterTasks";
const THEME_KEY = "personalCommandCenterTheme";

let tasks = [];
let currentFilter = "all";
let editingTaskId = null;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");

const newTaskBtn = document.getElementById("newTaskBtn");
const emptyNewTaskBtn = document.getElementById("emptyNewTaskBtn");

const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const clearAllBtn = document.getElementById("clearAllBtn");

const themeToggle = document.getElementById("themeToggle");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const taskTableBody = document.getElementById("taskTableBody");
const emptyState = document.getElementById("emptyState");

const modalTitle = document.getElementById("modalTitle");

const taskId = document.getElementById("taskId");
const taskTitle = document.getElementById("taskTitle");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const taskPriority = document.getElementById("taskPriority");
const taskStatus = document.getElementById("taskStatus");
const taskNotes = document.getElementById("taskNotes");

const totalTasks = document.getElementById("totalTasks");
const todayTasks = document.getElementById("todayTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();
    loadTasks();

    bindEvents();

    renderTasks();
    updateStats();

});


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {

    newTaskBtn.addEventListener("click", () => {
        openModal();
    });


    emptyNewTaskBtn.addEventListener("click", () => {
        openModal();
    });


    closeModalBtn.addEventListener("click", () => {
        closeModal();
    });


    cancelModalBtn.addEventListener("click", () => {
        closeModal();
    });


    document.querySelector(".modal-overlay").addEventListener("click", () => {
        closeModal();
    });


    taskForm.addEventListener("submit", (event) => {
        event.preventDefault();
        saveTask();
    });


    searchInput.addEventListener("input", () => {
        renderTasks();
    });


    statusFilter.addEventListener("change", () => {
        renderTasks();
    });


    clearAllBtn.addEventListener("click", () => {
        clearAllTasks();
    });


    themeToggle.addEventListener("click", () => {
        toggleTheme();
    });


    document.querySelectorAll(".nav-item").forEach(button => {

        button.addEventListener("click", () => {

            document.querySelectorAll(".nav-item")
                .forEach(item => item.classList.remove("active"));

            button.classList.add("active");

            currentFilter = button.dataset.filter;

            renderTasks();

        });

    });


    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeModal();
        }

    });

}


/* =========================================================
   LOAD TASKS
   ========================================================= */

function loadTasks() {

    try {

        const storedTasks =
            localStorage.getItem(STORAGE_KEY);

        if (storedTasks) {

            tasks = JSON.parse(storedTasks);

            if (!Array.isArray(tasks)) {
                tasks = [];
            }

            return;
        }


        /*
         * Legacy migration.
         *
         * If an older version of the dashboard used
         * "trackerData", preserve that information.
         */

        const legacyData =
            localStorage.getItem("trackerData");

        if (legacyData) {

            const oldTasks = JSON.parse(legacyData);

            if (Array.isArray(oldTasks)) {

                tasks = oldTasks.map(task => ({
                    id: task.id || generateId(),

                    title: task.title || "",

                    date: task.date || "",

                    time: task.time || "",

                    status: task.status || "pending",

                    notes: task.notes || "",

                    priority: task.priority || "normal"
                }));

                persistTasks();
            }
        }

    } catch (error) {

        console.error(
            "Unable to load tasks:",
            error
        );

        tasks = [];
    }

}


/* =========================================================
   SAVE TASKS
   ========================================================= */

function persistTasks() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );

}


/* =========================================================
   OPEN MODAL
   ========================================================= */

function openModal(task = null) {

    editingTaskId = task ? task.id : null;

    taskForm.reset();

    if (task) {

        modalTitle.textContent = "Edit Task";

        taskId.value = task.id;

        taskTitle.value = task.title || "";

        taskDate.value = task.date || "";

        taskTime.value = task.time || "";

        taskPriority.value =
            task.priority || "normal";

        taskStatus.value =
            task.status || "pending";

        taskNotes.value =
            task.notes || "";

    } else {

        modalTitle.textContent =
            "Create New Task";

        taskId.value = "";

        taskPriority.value = "normal";

        taskStatus.value = "pending";

        /*
         * Automatically use today's date for
         * new tasks.
         */

        taskDate.value =
            getTodayDate();

    }

    taskModal.classList.add("show");

    document.body.style.overflow = "hidden";

    setTimeout(() => {

        taskTitle.focus();

    }, 100);

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal() {

    taskModal.classList.remove("show");

    document.body.style.overflow = "";

    editingTaskId = null;

    taskForm.reset();

}


/* =========================================================
   SAVE / UPDATE TASK
   ========================================================= */

function saveTask() {

    const title =
        taskTitle.value.trim();

    const date =
        taskDate.value;

    const time =
        taskTime.value;

    const priority =
        taskPriority.value || "normal";

    const status =
        taskStatus.value || "pending";

    const notes =
        taskNotes.value.trim();


    if (!title) {

        alert("Please enter a task title.");

        taskTitle.focus();

        return;
    }


    if (!date) {

        alert("Please select a date.");

        taskDate.focus();

        return;
    }


    if (editingTaskId) {

        const index =
            tasks.findIndex(
                task => task.id === editingTaskId
            );


        if (index !== -1) {

            tasks[index] = {

                ...tasks[index],

                title,
                date,
                time,
                priority,
                status,
                notes

            };

        }

    } else {

        const newTask = {

            id: generateId(),

            title,

            date,

            time,

            priority,

            status,

            notes,

            createdAt:
                new Date().toISOString()

        };


        tasks.unshift(newTask);

    }


    persistTasks();

    closeModal();

    renderTasks();

    updateStats();

}


/* =========================================================
   DELETE TASK
   ========================================================= */

function deleteTask(id) {

    const task =
        tasks.find(item => item.id === id);

    if (!task) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${task.title}"?`
        );


    if (!confirmed) {
        return;
    }


    tasks =
        tasks.filter(
            item => item.id !== id
        );


    persistTasks();

    renderTasks();

    updateStats();

}


/* =========================================================
   EDIT TASK
   ========================================================= */

function editTask(id) {

    const task =
        tasks.find(item => item.id === id);

    if (!task) {
        return;
    }

    openModal(task);

}


/* =========================================================
   UPDATE STATUS
   ========================================================= */

function updateTaskStatus(id, status) {

    const task =
        tasks.find(item => item.id === id);

    if (!task) {
        return;
    }


    task.status = status;

    persistTasks();

    renderTasks();

    updateStats();

}


/* =========================================================
   FILTER TASKS
   ========================================================= */

function getFilteredTasks() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const status =
        statusFilter.value;


    const today =
        getTodayDate();


    return tasks.filter(task => {

        /* SEARCH */

        const searchableText = [

            task.title,

            task.notes,

            task.status,

            task.priority,

            task.date

        ]
            .join(" ")
            .toLowerCase();


        const matchesSearch =
            !search ||
            searchableText.includes(search);


        if (!matchesSearch) {
            return false;
        }


        /* STATUS FILTER */

        if (
            status !== "all" &&
            task.status !== status
        ) {
            return false;
        }


        /* SIDEBAR FILTER */

        switch (currentFilter) {

            case "today":

                return task.date === today;


            case "upcoming":

                return (
                    task.date > today &&
                    task.status !== "completed" &&
                    task.status !== "cancelled"
                );


            case "completed":

                return task.status === "completed";


            case "cancelled":

                return task.status === "cancelled";


            case "all":

            default:

                return true;
        }

    });

}


/* =========================================================
   RENDER TASKS
   ========================================================= */

function renderTasks() {

    const filteredTasks =
        getFilteredTasks();


    taskTableBody.innerHTML = "";


    if (filteredTasks.length === 0) {

        emptyState.classList.add("visible");

        return;

    }


    emptyState.classList.remove("visible");


    filteredTasks.forEach(task => {

        const row =
            document.createElement("tr");


        const formattedDate =
            formatDate(task.date);


        const formattedTime =
            formatTime(task.time);


        const statusLabel =
            formatStatus(task.status);


        const priorityLabel =
            formatPriority(task.priority);


        row.innerHTML = `

            <td>
                <div class="task-title"
                     title="${escapeHTML(task.title)}">
                    ${escapeHTML(task.title)}
                </div>
            </td>


            <td>
                ${formattedDate}
            </td>


            <td>
                ${formattedTime}
            </td>


            <td>
                <span class="priority-badge ${task.priority || "normal"}">
                    ${priorityLabel}
                </span>
            </td>


            <td>

                <select
                    class="status-select"
                    data-id="${task.id}">

                    <option
                        value="pending"
                        ${task.status === "pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option
                        value="in-progress"
                        ${task.status === "in-progress" ? "selected" : ""}>
                        In Progress
                    </option>

                    <option
                        value="completed"
                        ${task.status === "completed" ? "selected" : ""}>
                        Completed
                    </option>

                    <option
                        value="cancelled"
                        ${task.status === "cancelled" ? "selected" : ""}>
                        Cancelled
                    </option>

                </select>

            </td>


            <td>

                <div
                    class="task-notes"
                    title="${escapeHTML(task.notes || "")}">
                    ${escapeHTML(task.notes || "—")}
                </div>

            </td>


            <td>

                <div class="actions">

                    <button
                        class="action-btn"
                        title="Edit task"
                        data-action="edit"
                        data-id="${task.id}">
                        ✎
                    </button>


                    <button
                        class="action-btn delete"
                        title="Delete task"
                        data-action="delete"
                        data-id="${task.id}">
                        ×
                    </button>

                </div>

            </td>

        `;


        taskTableBody.appendChild(row);

    });


    /*
     * Bind status dropdowns
     */

    document
        .querySelectorAll(".status-select")
        .forEach(select => {

            select.addEventListener(
                "change",
                event => {

                    const id =
                        event.target.dataset.id;

                    updateTaskStatus(
                        id,
                        event.target.value
                    );

                }
            );

        });


    /*
     * Bind edit/delete buttons
     */

    document
        .querySelectorAll("[data-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;

                    const id =
                        button.dataset.id;


                    if (action === "edit") {

                        editTask(id);

                    }


                    if (action === "delete") {

                        deleteTask(id);

                    }

                }
            );

        });

}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStats() {

    const today =
        getTodayDate();


    const total =
        tasks.length;


    const todayCount =
        tasks.filter(
            task => task.date === today
        ).length;


    const completed =
        tasks.filter(
            task => task.status === "completed"
        ).length;


    const pending =
        tasks.filter(
            task =>
                task.status !== "completed" &&
                task.status !== "cancelled"
        ).length;


    totalTasks.textContent =
        total;


    todayTasks.textContent =
        todayCount;


    completedTasks.textContent =
        completed;


    pendingTasks.textContent =
        pending;

}


/* =========================================================
   CLEAR ALL
   ========================================================= */

function clearAllTasks() {

    if (tasks.length === 0) {

        alert("There are no tasks to clear.");

        return;
    }


    const confirmed =
        confirm(
            "This will permanently delete all tasks from this device. Continue?"
        );


    if (!confirmed) {
        return;
    }


    tasks = [];

    persistTasks();

    renderTasks();

    updateStats();

}


/* =========================================================
   THEME
   ========================================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(THEME_KEY);


    if (savedTheme === "dark") {

        document.documentElement
            .setAttribute(
                "data-theme",
                "dark"
            );

        updateThemeButton(true);

    } else {

        document.documentElement
            .removeAttribute("data-theme");

        updateThemeButton(false);

    }

}


function toggleTheme() {

    const isDark =
        document.documentElement
            .getAttribute("data-theme") === "dark";


    if (isDark) {

        document.documentElement
            .removeAttribute("data-theme");

        localStorage.setItem(
            THEME_KEY,
            "light"
        );

        updateThemeButton(false);

    } else {

        document.documentElement
            .setAttribute(
                "data-theme",
                "dark"
            );

        localStorage.setItem(
            THEME_KEY,
            "dark"
        );

        updateThemeButton(true);

    }

}


function updateThemeButton(isDark) {

    if (!themeToggle) {
        return;
    }


    themeToggle.textContent =
        isDark ? "☀" : "☾";


    themeToggle.title =
        isDark
            ? "Switch to light mode"
            : "Switch to dark mode";

}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function getTodayDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (Number.isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function formatTime(timeString) {

    if (!timeString) {
        return "—";
    }


    const [hours, minutes] =
        timeString.split(":");


    const date =
        new Date();

    date.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
    );


    return date.toLocaleTimeString(
        undefined,
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   LABEL HELPERS
   ========================================================= */

function formatStatus(status) {

    const labels = {

        "pending":
            "Pending",

        "in-progress":
            "In Progress",

        "completed":
            "Completed",

        "cancelled":
            "Cancelled"

    };


    return labels[status] || "Pending";

}


function formatPriority(priority) {

    const labels = {

        high:
            "High",

        normal:
            "Normal",

        low:
            "Low"

    };


    return labels[priority] || "Normal";

}


/* =========================================================
   ID GENERATOR
   ========================================================= */

function generateId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* =========================================================
   HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
