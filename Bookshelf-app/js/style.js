function setProgressValue(progress, value = 0) {
  if (value < 0 || value > 1) {
    return;
  }

  progress.querySelector(".bar-fill").style.transform = `rotate(${
    value / 2
  }turn)`;

  progress.querySelector(".bar-cover").textContent = `${Math.round(
    value * 100
  )}%`;
}

function showToast(message, duration, type) {
  var toastElement = document.createElement("div");
  toastElement.classList.add("toast", type);
  toastElement.textContent = message;

  var progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");
  toastElement.appendChild(progressBar);

  var toastContainer = document.getElementById("toast-container");
  toastContainer.appendChild(toastElement);

  // animasi muncul
  setTimeout(function () {
    progressBar.style.width = "0%";
    progressBar.style.transitionDuration = `${duration}ms`;
  }, 100); // Slight delay to allow rendering

  // animasi menghilang
  setTimeout(function () {
    toastElement.classList.add("fade-out");
    setTimeout(function () {
      toastElement.remove();
    }, 300);
  }, duration);

  // batas notif yang muncul
  var toasts = toastContainer.getElementsByClassName("toast");
  if (toasts.length > 3) {
    toasts[0].remove();
  }
}
