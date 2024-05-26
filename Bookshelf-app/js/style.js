function setProgressValue(progress, value=0) {
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
