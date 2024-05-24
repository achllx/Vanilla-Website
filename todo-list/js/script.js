// DOM ini akan dijalakan jika semua content didalam javascript telah berhasil di load
document.addEventListener("DOMContentLoaded", function () {
  
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  // mendeklarasikan DOM pada form
  const submitForm = document.getElementById("form");

  // panggil function addTodo ketika terjadi event pada form
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addTodo();
  });
});

const todos = []; // deklarasi variable todos untuk store array dari todo list yang dibuat
const RENDER_EVENT = "render-todo";

function addTodo() {
  const textTodo = document.getElementById("title").value; // mengambil value dari user input
  const timestamp = document.getElementById("date").value; // mengambil value dari user input

  const generatedID = generateId();

  // membuat object baru
  const todoObject = generateTodoObject(
    generatedID,
    textTodo,
    timestamp,
    false
  );
  todos.push(todoObject); // memasukan object yang telah dibuat ke dalam todos[]

  document.dispatchEvent(new Event(RENDER_EVENT)); // meberikan signal bahwa ada todo yang ditambahkan
  saveData();
}

// function untuk generate id
function generateId() {
  return +new Date();
}

// fucntion untuk generate object
function generateTodoObject(id, task, timestamp, isCompleted) {
  return {
    id,
    task,
    timestamp,
    isCompleted,
  };
}

// mengosongkan dan me-render ulang isi dari todo list
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById("todos");
  uncompletedTODOList.innerHTML = "";

  const completedTODOList = document.getElementById("completed-todos");
  completedTODOList.innerHTML = "";

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (!todoItem.isCompleted) uncompletedTODOList.append(todoElement);
    else completedTODOList.append(todoElement);
  }
});

function makeTodo(todoObject) {
  const textTitle = document.createElement("h2"); // membuat element h2
  textTitle.innerText = todoObject.task; // mengisi element dengan text

  const textTimestamp = document.createElement("p"); // membuat element p
  textTimestamp.innerText = todoObject.timestamp; // mengisi element dengan text

  const textContainer = document.createElement("div"); // membuat element div
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textTimestamp);

  const container = document.createElement("div"); // membuat element div
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `todo-${todoObject.id}`);

  if (todoObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(todoObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(todoObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", function () {
      addTaskToCompleted(todoObject.id);
    });

    container.append(checkButton);
  }

  return container;
}

function addTaskToCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }

  return -1;
}

function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}