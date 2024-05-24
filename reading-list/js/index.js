const books = [];

const SAVED_EVENT = "saved-book";
const RENDER_EVENT = "render-book";

const STORAGE_KEY = "BOOK_LIST";

document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("reading-form");

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  submitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    addBook();

    document.getElementById("book-title").value = "";
    document.getElementById("book-author").value = "";
  });
});

document.addEventListener(RENDER_EVENT, () => {
  const unReadedBookList = document.getElementById("unreaded");
  const readedBookList = document.getElementById("readed");

  unReadedBookList.innerHTML = "";
  readedBookList.innerHTML = "";

  for (const book of books) {
    const bookElement = createBookList(book);
    if (!book.isReaded) unReadedBookList.append(bookElement);
    else readedBookList.append(bookElement);
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log(localStorage.getItem(STORAGE_KEY));
  // add featur here
});

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, isReaded) {
  return {
    id,
    title,
    author,
    isReaded,
  };
}

function addBook() {
  const title = document.getElementById("book-title").value;
  const author = document.getElementById("book-author").value;
  const generateID = generateId();
  const bookObject = generateBookObject(generateID, title, author, false);

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function createBookList(bookObject) {
  const textTitle = document.createElement("div");
  textTitle.classList.add("card-title");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("div");
  textAuthor.classList.add("card-author");
  textAuthor.innerText = bookObject.author;

  const textContainer = document.createElement("div");
  textContainer.classList.add("card-info");
  textContainer.append(textTitle, textAuthor);

  const container = document.createElement("div");
  container.classList.add("card");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  const trashButton = document.createElement("button");
  trashButton.classList.add("trash-button");
  trashButton.addEventListener("click", () => {
    removeBook(bookObject.id);
  });

  if (bookObject.isReaded) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", () => {
      undoBookFromReaded(bookObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", () => {
      addBookToReaded(bookObject.id);
    });

    container.append(checkButton, trashButton);
  }

  return container;
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id == bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function addBookToReaded(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isReaded = true;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function undoBookFromReaded(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isReaded = false;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Broser kamu tidak mendukung local storage");
    return false;
  }

  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
