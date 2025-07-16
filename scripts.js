// DOM Elements
const columns = {
  todo: document.getElementById("todo-tasks"),
  progress: document.getElementById("progress-tasks"),
  done: document.getElementById("done-tasks"),
};

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const addDrawingBtn = document.getElementById("addDrawingBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const countElements = {
  todo: document.getElementById("todo-count"),
  progress: document.getElementById("progress-count"),
  done: document.getElementById("done-count"),
};

const drawingModal = document.getElementById("drawingModal");
const editModal = document.getElementById("editModal");
let currentEditTaskId = null;

let tasks = JSON.parse(localStorage.getItem("gisTasks")) || [];

function renderTasks() {
  Object.values(columns).forEach((col) => (col.innerHTML = ""));

  tasks.forEach((task) => {
    const taskEl = document.createElement("div");
    taskEl.className = `task ${task.status}-task`;
    taskEl.draggable = true;
    taskEl.dataset.id = task.id;

    let taskContent = `
      <div class="task-header">
        <span>${task.drawing}</span>
        <div class="task-actions">
    `;

    if (task.status !== "todo") {
      taskContent += `<button class="edit-btn" data-id="${task.id}">✏️ Edit</button>`;
    }
    taskContent += `<button class="delete-btn" data-id="${task.id}">🗑️</button>`;
    taskContent += `</div></div>`;

    taskContent += `
      <div class="task-details">
        <div><strong>Assigned:</strong> ${task.assigned || "Unassigned"}</div>
        ${
          task.status === "progress"
            ? `
          <div><strong>Started:</strong> ${formatDate(task.startDate)}</div>
          <div><strong>Days:</strong> ${calculateDays(task.startDate)}</div>
          `
            : ""
        }
        ${
          task.status === "done"
            ? `
          <div><strong>Started:</strong> ${formatDate(task.startDate)}</div>
          <div><strong>Completed:</strong> ${formatDate(
            task.completedDate
          )}</div>
          <div><strong>Days:</strong> ${calculateDays(
            task.startDate,
            task.completedDate
          )}</div>
          <div><strong>Completed by:</strong> ${task.completedBy}</div>
          <div class="form-group">
            <label>Action Code:</label>
            <select class="action-code-select" data-id="${task.id}">
              <option value="Code1" ${
                task.actionCode === "Code1" ? "selected" : ""
              }>Code1</option>
              <option value="Code3" ${
                task.actionCode === "Code3" ? "selected" : ""
              }>Code3</option>
            </select>
          </div>
          `
            : ""
        }
      </div>
    `;

    taskEl.innerHTML = taskContent;
    columns[task.status].appendChild(taskEl);
  });

  setupDragAndDrop();
  setupEditButtons();
  setupDeleteButtons();
  updateCounters();
  setupActionCodeSelectors();
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

function calculateDays(startDate, endDate) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

function setupDragAndDrop() {
  Object.entries(columns).forEach(([status, col]) => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.style.backgroundColor = "rgba(0,0,0,0.05)";
    });

    col.addEventListener("dragleave", () => {
      col.style.backgroundColor = "";
    });

    col.addEventListener("drop", (e) => {
      e.preventDefault();
      col.style.backgroundColor = "";
      const taskId = document.querySelector(".dragging")?.dataset.id;
      if (taskId) {
        const newStatus = col.id.replace("-tasks", "");
        updateTaskStatus(taskId, newStatus);
      }
    });
  });

  document.querySelectorAll(".task").forEach((task) => {
    task.addEventListener("dragstart", () => task.classList.add("dragging"));
    task.addEventListener("dragend", () => task.classList.remove("dragging"));
  });
}

function updateTaskStatus(taskId, newStatus) {
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      const updatedTask = { ...task, status: newStatus };
      if (newStatus === "progress" && !updatedTask.startDate) {
        updatedTask.startDate = today();
      }
      if (newStatus === "done") {
        updatedTask.completedDate = today();
        if (!updatedTask.completedBy && updatedTask.assigned) {
          updatedTask.completedBy = updatedTask.assigned;
        }
        updatedTask.actionCode = updatedTask.actionCode || "Code1";
      }

      return updatedTask;
    }
    return task;
  });
  saveTasks();
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function setupEditButtons() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const taskId = btn.dataset.id;
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        currentEditTaskId = taskId;
        document.getElementById("editDrawing").value = task.drawing || "";
        document.getElementById("editAssigned").value = task.assigned || "";
        document.getElementById("editStartDate").value = task.startDate || "";
        editModal.style.display = "block";
      }
    });
  });
}

function setupDeleteButtons() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Delete this task?")) {
        const taskId = btn.dataset.id;
        tasks = tasks.filter((t) => t.id !== taskId);
        saveTasks();
      }
    });
  });
}

function setupActionCodeSelectors() {
  document.querySelectorAll(".action-code-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      const taskId = e.target.dataset.id;
      const selectedCode = e.target.value;
      tasks = tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, actionCode: selectedCode };
        }
        return task;
      });
      saveTasks();
    });
  });
}

function saveTasks() {
  localStorage.setItem("gisTasks", JSON.stringify(tasks));
  renderTasks();
}

function exportToJSON() {
  const dataStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gis-kanban-export.json";
  a.click();
}

function importFromJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      tasks = JSON.parse(e.target.result);
      saveTasks();
    } catch {
      alert("Invalid JSON file!");
    }
  };
  reader.readAsText(file);
}

function importFromCSV(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    lines.forEach((drawingNumber) => {
      tasks.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        drawing: drawingNumber,
        status: "todo",
        assigned: "",
        startDate: "",
        completedBy: "",
      });
    });
    saveTasks();
    alert(`${lines.length} drawings imported to To Do`);
  };
  reader.readAsText(file);
}

function clearAllTasks() {
  if (confirm("Are you sure you want to delete all tasks?")) {
    tasks = [];
    saveTasks();
  }
}

function updateCounters() {
  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    progress: tasks.filter((t) => t.status === "progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
  Object.entries(counts).forEach(([status, count]) => {
    countElements[status].textContent = count;
  });
}

function initModals() {
  addDrawingBtn.addEventListener(
    "click",
    () => (drawingModal.style.display = "block")
  );

  document.getElementById("confirmAddBtn").addEventListener("click", () => {
    const drawingNumber = document
      .getElementById("newDrawingNumber")
      .value.trim();
    if (drawingNumber) {
      tasks.push({
        id: Date.now().toString(),
        drawing: drawingNumber,
        status: "todo",
        assigned: "",
        startDate: "",
        completedBy: "",
      });
      saveTasks();
      document.getElementById("newDrawingNumber").value = "";
      drawingModal.style.display = "none";
    }
  });

  document.getElementById("confirmEditBtn").addEventListener("click", () => {
    if (currentEditTaskId) {
      const drawing = document.getElementById("editDrawing").value.trim();
      const assigned = document.getElementById("editAssigned").value.trim();
      const startDate = document.getElementById("editStartDate").value;
      tasks = tasks.map((task) => {
        if (task.id === currentEditTaskId) {
          return { ...task, drawing, assigned, startDate };
        }
        return task;
      });
      saveTasks();
      editModal.style.display = "none";
    }
  });

  document.querySelectorAll(".close").forEach((btn) => {
    btn.addEventListener("click", () => {
      drawingModal.style.display = "none";
      editModal.style.display = "none";
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target === drawingModal) drawingModal.style.display = "none";
    if (e.target === editModal) editModal.style.display = "none";
  });
}

function init() {
  initModals();
  exportBtn.addEventListener("click", exportToJSON);
  importBtn.addEventListener("change", (e) => {
    if (e.target.files[0]) importFromJSON(e.target.files[0]);
  });
  clearAllBtn.addEventListener("click", clearAllTasks);
  saveTasks();
}

document.getElementById("csvImportBtn").addEventListener("change", (e) => {
  if (e.target.files[0]) importFromCSV(e.target.files[0]);
});

init();
