const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const searchInput = document.getElementById("searchInput");
const addBtn = document.getElementById("addBtn");
const clearCompletedBtn = document.getElementById("clearCompleted");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let draggedIndex = null;


renderTasks();


addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => e.key === "Enter" && addTask());
searchInput.addEventListener("keyup", searchTask);
clearCompletedBtn.addEventListener("click", clearCompleted);



function addTask() {
  const text = taskInput.value.trim();
  if (!text) return alert("Enter a task");

  tasks.push({ text, completed: false });
  taskInput.value = "";
  saveTasks();
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.draggable = true;
    li.dataset.index = index;

    li.innerHTML = `
      <span class="${task.completed ? "completed" : ""}">
        ${task.text}
      </span>
      <div>
        <button class="btn btn-sm btn-warning me-1">Edit</button>
        <button class="btn btn-sm btn-danger">Delete</button>
      </div>
    `;

    
    li.querySelector("span").onclick = () => toggleTask(index);
    li.querySelector(".btn-warning").onclick = () => editTask(index);
    li.querySelector(".btn-danger").onclick = () => deleteTask(index);

    addSwipeEvents(li, index);
    addDragEvents(li);

    taskList.appendChild(li);
  });

  updateCount();
}


function addSwipeEvents(item, index) {
  let startX = 0;

  item.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  item.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - startX;

    if (diff > 80) toggleTask(index);
    else if (diff < -80) deleteTask(index);
  });
}


function addDragEvents(item) {
  item.addEventListener("dragstart", () => {
    draggedIndex = item.dataset.index;
  });

  item.addEventListener("dragover", e => e.preventDefault());

  item.addEventListener("drop", () => {
    const targetIndex = item.dataset.index;
    const moved = tasks.splice(draggedIndex, 1)[0];
    tasks.splice(targetIndex, 0, moved);
    saveTasks();
    renderTasks();
  });
}


function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function editTask(index) {
  const newText = prompt("Edit task", tasks[index].text);
  if (newText && newText.trim()) {
    tasks[index].text = newText;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
}

function searchTask() {
  const value = searchInput.value.toLowerCase();
  [...taskList.children].forEach(li => {
    li.style.display = li.innerText.toLowerCase().includes(value) ? "" : "none";
  });
}

function updateCount() {
  const completed = tasks.filter(t => t.completed).length;
  taskCount.textContent = `${tasks.length} Tasks | ${completed} Completed`;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
