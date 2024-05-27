const books = []; //object untuk buku
let readed = [];
let unread = [];

const SAVED_EVENT = "saved-book"; //event menyimpan perubahan
const RENDER_EVENT = "render-book"; //event perubahan pada data yang akan ditampilkan

const STORAGE_KEY = "BOOK-LIST"; //key local storage

const progressBar = document.querySelector(".progress-bar"); // element progress bar

document.addEventListener("DOMContentLoaded", () => {
    const submitForm = document.getElementById("book-form");

    document
        .getElementById("unread-card-container")
        .addEventListener("change", checkboxHandler);

    document
        .getElementById("readed-card-container")
        .addEventListener("change", checkboxHandler);

    if (isStorageExist()) {
        loadDataFromStorage();
    }

    widgetHandler();

    document.getElementById("unread-search").addEventListener("input", () => {
        searchBooks(false);
    });

    document.getElementById("readed-search").addEventListener("input", () => {
        searchBooks(true);
    });

    submitForm.addEventListener("submit", (e) => {
        e.preventDefault();

        addBook();

        document.getElementById("book-title").value = "";
        document.getElementById("book-author").value = "";
        document.getElementById("book-year").value = "";
        document.getElementById("book-check").checked = false;
    });
});

// render buku
document.addEventListener(RENDER_EVENT, () => {
    readed = books.filter((book) => book.isComplete);
    unread = books.filter((book) => !book.isComplete);

    const checkReadedSearch = document
        .getElementById("readed-search")
        .value.toLowerCase();

    const checkUnreadSearch = document
        .getElementById("unread-search")
        .value.toLowerCase();

    if (checkReadedSearch !== "" || checkReadedSearch !== null) {
        searchBooks(true);
    } else {
        renderReadedBooks();
    }

    if (checkUnreadSearch !== "" || checkUnreadSearch !== null) {
        searchBooks(false);
    } else {
        renderUnreadBooks();
    }

    widgetHandler();
});

function renderReadedBooks(filteredBooks = null) {
    const readedCardContainer = document.getElementById("readed-card-container");

    readedCardContainer.innerHTML = "";

    const booksToRender = filteredBooks || readed;

    for (const book of booksToRender) {
        const newCard = createBookCard(book);
        readedCardContainer.append(newCard);
    }
}

function renderUnreadBooks(filteredBooks = null) {
    const unreadCardContainer = document.getElementById("unread-card-container");

    unreadCardContainer.innerHTML = "";

    const booksToRender = filteredBooks || unread;

    for (const book of booksToRender) {
        const newCard = createBookCard(book);
        unreadCardContainer.append(newCard);
    }
}

// fungsi pencarian untuk 2 kategori rak buku
function searchBooks(isComplete) {
    const searchInput = isComplete
        ? document.getElementById("readed-search").value.toLowerCase()
        : document.getElementById("unread-search").value.toLowerCase();

    if (isComplete) {
        const filteredBooks = readed.filter((book) => {
            return book.title.toLowerCase().includes(searchInput);
        });
        renderReadedBooks(filteredBooks);
    } else {
        const filteredBooks = unread.filter((book) => {
            return book.title.toLowerCase().includes(searchInput);
        });
        renderUnreadBooks(filteredBooks);
    }
}

// generate id
function generateId() {
    return +new Date();
}

// pembuatan bentuk object buku
function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    };
}

// handler checkbox
function checkboxHandler(event) {
    if (event.target.type === "checkbox") {
        if (event.target.checked) {
            addBookToReaded(event.target.id);
        } else {
            undoBookFromReaded(event.target.id);
        }
    }
}

// handler untuk widgets
function widgetHandler() {
    const totalBooks = books.length;
    const completeBooks = books.filter((book) => book.isComplete).length;
    const incompleteBooks = books.filter((book) => !book.isComplete).length;

    document.getElementById("total-book").innerText = totalBooks;
    document.getElementById("unread-total").innerText = incompleteBooks;
    document.getElementById("readed-total").innerText = completeBooks;

    if (totalBooks !== 0) {
        setProgressValue(progressBar, completeBooks / totalBooks);
    } else {
        setProgressValue(progressBar);
    }
}

// fungsi mencari data buku dengan id
function findBook(bookId) {
    for (const book of books) {
        if (book.id == bookId) {
            return book;
        }
    }
    return null;
}

// fungsi mencari index buku dengan id
function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

// fungsi menambahkan buku
function addBook() {
    const title = document.getElementById("book-title").value;
    const author = document.getElementById("book-author").value;
    const year = parseInt(document.getElementById("book-year").value, 10);
    const isComplete = document.getElementById("book-check").checked;

    const bookObject = generateBookObject(
        generateId(),
        title,
        author,
        year,
        isComplete
    );

    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));

    showToast("Buku ditambahkan", 3000, "success");

    saveData();
}

// membuat kartu untuk ditampilkan
function createBookCard(bookObject) {
    // card
    const card = document.createElement("div");
    card.classList.add("card");

    // checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = bookObject.id;
    checkbox.name = bookObject.id;
    checkbox.checked = bookObject.isComplete;

    const label = document.createElement("label");
    label.htmlFor = bookObject.id;

    const cardCheckbox = document.createElement("div");
    cardCheckbox.classList.add("custom-checkbox");
    cardCheckbox.append(checkbox, label);

    // card text
    const text = document.createElement("h2");
    text.innerText = bookObject.title;

    const subText = document.createElement("p");
    subText.innerText = `${bookObject.author}, ${bookObject.year}`;

    const cardText = document.createElement("div");
    cardText.classList.add("card-text");
    cardText.append(text, subText);

    // delete button
    const deleteButton = document.createElement("div");
    deleteButton.classList.add("delete-card");
    deleteButton.addEventListener("click", () => {
        removeBook(bookObject.id);
    });

    card.append(cardCheckbox, cardText, deleteButton);

    // gabungkan card
    return card;
}

// handler memindahkan buku dari rak belum selesai ke selesai
function addBookToReaded(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) {
        showToast("Buku tidak ditemukan", 3000, "error");
        return;
    }

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

// handler memindahkan buku dari rak selesai ke belum selesai
function undoBookFromReaded(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) {
        showToast("Buku tidak ditemukan", 3000, "error");
        return;
    }

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// menghapus buku dari rak
function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    const bookObject = findBook(bookId);

    if (bookTarget === -1) {
        showToast("Buku tidak ditemukan", 3000, "error");
        return;
    }

    // munculkan popup
    const popup = document.getElementById("overlay");
    const confirmButton = document.getElementById("confirm-button");
    const cancelButton = document.getElementById("cancel-button");
    const confirmData = document.getElementById("confirm-data");

    confirmData.innerHTML = `
    <p> Apakah anda yakin untuk menghapus buku <b>"${bookObject.title}"</b>(<b>${bookObject.author}, ${bookObject.year}</b>)`;

    popup.style.display = "flex";

    // konfirmasi penghapusan buku
    function confirmHandler() {
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        showToast("Buku dihapus", 3000, "error");
        saveData();
        popup.style.display = "none";
        cleanup();
    }

    function cancelHandler() {
        popup.style.display = "none";
        cleanup();
    }

    function cleanup() {
        confirmButton.removeEventListener("click", confirmHandler);
        cancelButton.removeEventListener("click", cancelHandler);
    }

    confirmButton.addEventListener("click", confirmHandler);
    cancelButton.addEventListener("click", cancelHandler);
}

// fungsi menyimpan data ke dalam localstorage di webstorage
function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

// fungsi pengecekan browser mendukun webstorage atau tidak
function isStorageExist() {
    if (typeof Storage === undefined) {
        showToast("Broser kamu tidak mendukung local storage", 3000, "error");
        return false;
    }

    return true;
}

// fungsi mengambil data dari localstorage
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
        for (const book of data) {
            book.year = parseInt(book.year, 10);
            books.push(book);
        }
    }
    
    document.dispatchEvent(new Event(RENDER_EVENT));
}
