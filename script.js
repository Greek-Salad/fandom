document.addEventListener("DOMContentLoaded", function () {
  // === Модальное окно спойлеров ===
  const spoilerModal = document.getElementById("spoiler-modal");
  const acceptBtn = document.getElementById("accept-spoilers");
  const rejectBtn = document.getElementById("reject-spoilers");

  // Проверяем, соглашался ли пользователь ранее
  if (localStorage.getItem("acceptedSpoilers") !== "true") {
    spoilerModal.style.display = "flex"; // Показываем модальное окно
  } else {
    spoilerModal.style.display = "none"; // Скрываем, если уже принимал
  }

  // Обработчик кнопки "Рискнуть"
  acceptBtn.addEventListener("click", function () {
    spoilerModal.style.display = "none";
    localStorage.setItem("acceptedSpoilers", "true"); // Запоминаем согласие
  });

  // Обработчик кнопки "Свалить"
  rejectBtn.addEventListener("click", function () {
    window.close(); // Закрывает вкладку
    // Если window.close() не сработает из-за политик безопасности браузера:
    // можно перенаправить на blank или внешнюю страницу:
    // window.location.href = "about:blank";
  });

  // === Остальной код ===
  const banner = document.getElementById("cookie-banner");
  const closeButton = document.getElementById("close-cookie-btn");

  // Проверяем, был ли баннер уже закрыт
  if (localStorage.getItem("cookieBannerClosed") === "true") {
    banner.style.display = "none";
  } else {
    banner.style.display = "flex"; // Показываем, если не закрыт
  }

  // Обработчик клика по кнопке
  closeButton.addEventListener("click", function () {
    banner.style.display = "none";
    localStorage.setItem("cookieBannerClosed", "true"); // Сохраняем, что закрыли
  });

  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const triggerImg = document.querySelector(".infobox-image img");
  const span = document.querySelector(".modal-close");

  // Открытие модального окна
  triggerImg.onclick = function () {
    modal.style.display = "block";
    modalImg.src = this.src;
    modalImg.alt = this.alt;
  };

  // Закрытие по крестику
  span.onclick = function () {
    modal.style.display = "none";
  };

  // Закрытие по клику вне изображения
  modal.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
});