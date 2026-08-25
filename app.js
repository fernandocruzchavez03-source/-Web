const cars = window.CARVIA_CARS || [];

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function money(number) {
  return new Intl.NumberFormat('es-MX').format(number);
}

function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return '';

  const [year, month, day] = value.split('-');
  const date = new Date(year, Number(month) - 1, day);

  return `${date.getDate()} de ${
    months[date.getMonth()].toLowerCase()
  }, ${date.getFullYear()}`;
}

function carImage(car) {
  if (car.image) {
    return `<img src="${car.image}" alt="${car.name}">`;
  }

  return `
    <div class="placeholder">
      IMAGEN OFICIAL<br>
      PRÓXIMAMENTE
    </div>
  `;
}

/* NAVBAR */

function navigation() {
  return `
    <header class="nav">
      <a class="brand" href="index.html">
        <b>V</b> CARVIA
      </a>

      <nav>
        <a href="index.html">Inicio</a>
        <a href="ubicaciones.html">Ubicaciones</a>
        <a href="inventario.html">Inventario</a>
        <a href="nosotros.html">Nosotros</a>
      </nav>

      <a class="reserve" href="inventario.html">
        Reservar ↗
      </a>
    </header>
  `;
}

/* LISTAS PERSONALIZADAS */

function closeCustomSelects(except = null) {
  document.querySelectorAll('.custom-select.open').forEach((select) => {
    if (select !== except) {
      select.classList.remove('open');
    }
  });
}

function setupCustomSelects(scope = document) {
  const selects = scope.querySelectorAll(
    'select:not([data-carvia-custom])'
  );

  selects.forEach((select) => {
    select.dataset.carviaCustom = 'true';

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';

    const list = document.createElement('div');
    list.className = 'custom-select-list';

    function updateTrigger() {
      const option = select.options[select.selectedIndex];

      trigger.innerHTML = `
        <span>${option.text}</span>
        <i>⌄</i>
      `;
    }

    [...select.options].forEach((option) => {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'custom-select-option';
      button.textContent = option.text;

      if (option.selected) {
        button.classList.add('selected');
      }

      button.addEventListener('click', (event) => {
        event.stopPropagation();

        select.value = option.value;

        select.dispatchEvent(
          new Event('change', { bubbles: true })
        );

        list.querySelectorAll('.selected').forEach((item) => {
          item.classList.remove('selected');
        });

        button.classList.add('selected');

        updateTrigger();
        wrapper.classList.remove('open');
      });

      list.appendChild(button);
    });

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();

      const willOpen = !wrapper.classList.contains('open');

      closeCustomSelects(wrapper);
      wrapper.classList.toggle('open', willOpen);
    });

    select.addEventListener('change', updateTrigger);

    select.style.display = 'none';
    select.insertAdjacentElement('afterend', wrapper);

    wrapper.appendChild(trigger);
    wrapper.appendChild(list);

    updateTrigger();
  });
}

/* CALENDARIO PERSONALIZADO */

function setupDateRanges(scope = document) {
  const pickers = scope.querySelectorAll(
    '[data-carvia-range]:not([data-carvia-ready])'
  );

  pickers.forEach((picker) => {
    picker.dataset.carviaReady = 'true';

    const startInput = picker.querySelector('[data-start-date]');
    const endInput = picker.querySelector('[data-end-date]');
    const trigger = picker.querySelector('[data-date-trigger]');
    const popover = picker.querySelector('[data-calendar-popover]');

    const today = new Date();

    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    function updateTrigger() {
      if (startInput.value && endInput.value) {
        trigger.innerHTML = `
          <span class="date-trigger-label">
            ${formatDate(startInput.value)}
            <b>→</b>
            ${formatDate(endInput.value)}
          </span>

          <i>⌄</i>
        `;
        return;
      }

      if (startInput.value) {
        trigger.innerHTML = `
          <span class="date-trigger-label">
            ${formatDate(startInput.value)}
            <b>→</b>
            Elige devolución
          </span>

          <i>⌄</i>
        `;
        return;
      }

      trigger.innerHTML = `
        <span class="date-trigger-empty">
          Elige tus fechas
        </span>

        <i>⌄</i>
      `;
    }

    function isBetween(value) {
      return (
        startInput.value &&
        endInput.value &&
        value > startInput.value &&
        value < endInput.value
      );
    }

    function renderCalendar() {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);

      const startOffset = (firstDay.getDay() + 6) % 7;
      const daysInMonth = lastDay.getDate();

      let days = '';

      for (let i = 0; i < startOffset; i += 1) {
        days += '<span class="calendar-empty"></span>';
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(currentYear, currentMonth, day);
        const value = isoDate(date);

        let classes = 'calendar-day';

        if (value === startInput.value) {
          classes += ' range-start';
        }

        if (value === endInput.value) {
          classes += ' range-end';
        }

        if (isBetween(value)) {
          classes += ' in-range';
        }

        if (value < isoDate(today)) {
          classes += ' disabled';
        }

        days += `
          <button
            type="button"
            class="${classes}"
            data-calendar-date="${value}"
            ${value < isoDate(today) ? 'disabled' : ''}
          >
            ${day}
          </button>
        `;
      }

      popover.innerHTML = `
        <div class="custom-calendar">

          <div class="calendar-head">
            <button
              type="button"
              class="calendar-nav"
              data-calendar-prev
              aria-label="Mes anterior"
            >
              ←
            </button>

            <strong>
              ${months[currentMonth]} ${currentYear}
            </strong>

            <button
              type="button"
              class="calendar-nav"
              data-calendar-next
              aria-label="Mes siguiente"
            >
              →
            </button>
          </div>

          <div class="calendar-weekdays">
            ${weekDays.map((day) => `<span>${day}</span>`).join('')}
          </div>

          <div class="calendar-days">
            ${days}
          </div>

          <div class="calendar-help">
            Primer clic: recogida · Segundo clic: devolución
          </div>

        </div>
      `;

      const previous = popover.querySelector('[data-calendar-prev]');
      const next = popover.querySelector('[data-calendar-next]');

      previous.addEventListener('click', (event) => {
        event.stopPropagation();

        currentMonth -= 1;

        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear -= 1;
        }

        renderCalendar();
      });

      next.addEventListener('click', (event) => {
        event.stopPropagation();

        currentMonth += 1;

        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear += 1;
        }

        renderCalendar();
      });

      popover.querySelectorAll('[data-calendar-date]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();

          const selectedDate = button.dataset.calendarDate;

          /* Primer clic, o comenzar un nuevo rango */
          if (
            !startInput.value ||
            (startInput.value && endInput.value) ||
            selectedDate < startInput.value
          ) {
            startInput.value = selectedDate;
            endInput.value = '';
          } else {
            /*
              Segundo clic.
              Aquí mismo día también funciona,
              porque solo se compara con < y no con <=.
            */
            endInput.value = selectedDate;

            /* Al elegir devolución sí se cierra */
            popover.classList.remove('open');
          }

          startInput.dispatchEvent(
            new Event('change', { bubbles: true })
          );

          endInput.dispatchEvent(
            new Event('change', { bubbles: true })
          );

          updateTrigger();
          renderCalendar();
        });
      });
    }

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();

      closeCustomSelects();

      popover.classList.toggle('open');

      if (popover.classList.contains('open')) {
        renderCalendar();
      }
    });

    updateTrigger();
  });
}

function enhanceControls(scope = document) {
  setupCustomSelects(scope);
  setupDateRanges(scope);
}

/* INVENTARIO */

function renderCars(list, target) {
  const container = document.querySelector(target);

  if (!container) return;

  container.innerHTML = list.map((car) => `
    <article class="car">
      ${carImage(car)}

      <div class="car-info">
        <small>${car.category}</small>

        <h3>${car.name}</h3>

        <p>
          ${car.passengers} · ${car.power}
        </p>

        <div class="car-bottom">
          <span>Desde $${money(car.price)} MXN</span>

          <button data-car="${car.slug}">
            Ver auto →
          </button>
        </div>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('[data-car]').forEach((button) => {
    button.addEventListener('click', () => {
      openCar(button.dataset.car);
    });
  });
}

/* DETALLE DE AUTO */

function openCar(slug) {
  const car = cars.find((item) => item.slug === slug);

  if (!car) return;

  const modal = document.querySelector('#modal');

  modal.innerHTML = `
    <section class="modal-card">
      <button class="close" aria-label="Cerrar">
        ×
      </button>

      <div class="detail">

        <div>
          ${carImage(car)}
        </div>

        <div>
          <p class="eyebrow">Flota oficial CARVIA</p>

          <h2>${car.name}</h2>

          <p>
            Una selección premium para conducir con confianza,
            estilo y todo resuelto.
          </p>

          <div class="specs">
            <div>
              <b>Categoría</b><br>
              ${car.category}
            </div>

            <div>
              <b>Pasajeros</b><br>
              ${car.passengers}
            </div>

            <div>
              <b>Potencia</b><br>
              ${car.power}
            </div>

            <div>
              <b>Transmisión</b><br>
              Automática
            </div>
          </div>

          <h3>
            $${money(car.price)} MXN / día
          </h3>

          <button class="primary" id="rent">
            Rentar este auto →
          </button>

          <form class="booking" id="booking">

            <label>
              Ciudad

              <select required>
                <option>Ciudad de México, CDMX</option>
                <option>Monterrey, Nuevo León</option>
                <option>Guadalajara, Jalisco</option>
                <option>Cancún, Quintana Roo</option>
                <option>Puebla, Puebla</option>
              </select>
            </label>

            <div class="booking-date-field">
              <label>Fechas de renta</label>

              <div class="date-range-control" data-carvia-range>

                <input
                  type="hidden"
                  id="pickup"
                  data-start-date
                >

                <input
                  type="hidden"
                  id="return"
                  data-end-date
                >

                <button
                  type="button"
                  class="date-range-trigger"
                  data-date-trigger
                >
                  Elige recogida y devolución
                </button>

                <div
                  class="calendar-popover"
                  data-calendar-popover
                ></div>

              </div>
            </div>

            <label>
              Hora

              <select required>
                <option>09:00</option>
                <option>10:00</option>
                <option>12:00</option>
                <option>15:00</option>
                <option>18:00</option>
              </select>
            </label>

            <button class="primary" type="submit">
              Continuar al pago →
            </button>

          </form>
        </div>

      </div>
    </section>
  `;

  modal.classList.add('show');

  enhanceControls(modal);

  modal.querySelector('.close').addEventListener('click', () => {
    modal.classList.remove('show');
  });

  modal.querySelector('#rent').addEventListener('click', () => {
    modal.querySelector('#booking').classList.add('show');
  });

  modal.querySelector('#booking').addEventListener('submit', (event) => {
    event.preventDefault();

    const pickup = modal.querySelector('#pickup').value;
    const returnDate = modal.querySelector('#return').value;

    if (!pickup || !returnDate) {
      alert('Selecciona la fecha de recogida y devolución.');
      return;
    }

    renderPayment(modal, car);
  });
}

/* PAGO SIMULADO */

function renderPayment(modal, car) {
  modal.innerHTML = `
    <section class="modal-card payment-card">
      <button class="close" aria-label="Cerrar">
        ×
      </button>

      <p class="eyebrow">Paso 2 de 2</p>

      <h2>Confirma tu reserva.</h2>

      <p class="payment-copy">
        Pago simulado para el ${car.name}.
        No se cobra ni se guarda información bancaria.
      </p>

      <div class="payment-summary">
        <span>Tarifa CARVIA por día</span>
        <strong>$${money(car.price)} MXN</strong>
      </div>

      <form id="payment-form" class="payment-form">

        <div class="payment-networks">
          <span>Aceptamos</span>

          <div class="network-chips">
            <b class="visa-chip">VISA</b>

            <b class="mastercard-chip">
              <i></i>
              <i></i>
              mastercard
            </b>

            <b class="amex-chip">AMEX</b>
          </div>
        </div>

        <label for="card-holder">
          Titular de la tarjeta

          <input
            id="card-holder"
            type="text"
            placeholder="Nombre como aparece en la tarjeta"
            required
          >
        </label>

        <label for="card-number">
          Número de tarjeta

          <input
            id="card-number"
            type="text"
            inputmode="numeric"
            maxlength="19"
            placeholder="1234 5678 9012 3456"
            required
          >
        </label>

        <div class="payment-row">

          <label for="card-expiry">
            Vencimiento

            <input
              id="card-expiry"
              type="text"
              inputmode="numeric"
              maxlength="5"
              placeholder="MM/AA"
              required
            >
          </label>

          <label for="card-cvv">
            CVV

            <input
              id="card-cvv"
              type="password"
              inputmode="numeric"
              maxlength="3"
              placeholder="123"
              required
            >
          </label>

        </div>

        <div class="invoice-box">

          <div class="invoice-title">
            <span class="invoice-icon">⌁</span>

            <div>
              <b>Factura y confirmación</b>

              <small>
                Te enviaremos los detalles de tu reserva.
              </small>
            </div>
          </div>

          <div class="contact-switch">

            <label class="contact-option">
              <input
                type="radio"
                name="contact-method"
                value="email"
                checked
              >

              <span>Correo</span>
            </label>

            <label class="contact-option">
              <input
                type="radio"
                name="contact-method"
                value="whatsapp"
              >

              <span>WhatsApp</span>
            </label>

          </div>

          <label
            for="invoice-contact"
            class="invoice-input-label"
            id="invoice-contact-label"
          >
            Correo para recibir tu factura

            <input
              id="invoice-contact"
              type="email"
              placeholder="tu@correo.com"
              required
            >
          </label>

        </div>

        <p class="payment-security">
          🔒 Pago simulado. CARVIA no almacena datos de tarjeta.
        </p>

        <button class="primary payment-button" type="submit">
          Confirmar reserva simulada →
        </button>

      </form>
    </section>
  `;

  modal.querySelector('.close').addEventListener('click', () => {
    modal.classList.remove('show');
  });

  const cardNumber = modal.querySelector('#card-number');
  const expiry = modal.querySelector('#card-expiry');
  const cvv = modal.querySelector('#card-cvv');
  const contactInput = modal.querySelector('#invoice-contact');
  const contactLabel = modal.querySelector('#invoice-contact-label');

  cardNumber.addEventListener('input', () => {
    const digits = cardNumber.value
      .replace(/\D/g, '')
      .slice(0, 16);

    cardNumber.value = digits.replace(
      /(\d{4})(?=\d)/g,
      '$1 '
    );
  });

  expiry.addEventListener('input', () => {
    const digits = expiry.value
      .replace(/\D/g, '')
      .slice(0, 4);

    expiry.value = digits.length > 2
      ? `${digits.slice(0, 2)}/${digits.slice(2)}`
      : digits;
  });

  cvv.addEventListener('input', () => {
    cvv.value = cvv.value
      .replace(/\D/g, '')
      .slice(0, 3);
  });

  modal.querySelectorAll(
    'input[name="contact-method"]'
  ).forEach((option) => {
    option.addEventListener('change', () => {
      if (option.value === 'whatsapp') {
        contactInput.type = 'tel';
        contactInput.placeholder = '+52 81 0000 0000';

        contactLabel.childNodes[0].textContent =
          'WhatsApp para recibir tu factura ';
      } else {
        contactInput.type = 'email';
        contactInput.placeholder = 'tu@correo.com';

        contactLabel.childNodes[0].textContent =
          'Correo para recibir tu factura ';
      }

      contactInput.value = '';
    });
  });

  modal.querySelector('#payment-form').addEventListener(
    'submit',
    (event) => {
      event.preventDefault();

      const cleanCardNumber = cardNumber.value.replace(/\s/g, '');

      if (
        cleanCardNumber.length < 16 ||
        expiry.value.length < 5 ||
        cvv.value.length !== 3 ||
        contactInput.value.length === 0
      ) {
        alert('Completa correctamente los datos para la simulación.');
        return;
      }

      modal.querySelector('#payment-form').innerHTML = `
        <div class="notice">
          ✓ Reserva simulada confirmada.
          Tu camino está listo.
        </div>
      `;
    }
  );
}

/* INICIO */

function home() {
  renderCars(cars.slice(0, 6), '#featured');

  const search = document.querySelector('#search');

  if (!search) return;

  search.addEventListener('submit', (event) => {
    event.preventDefault();

    const start = search.querySelector('[data-start-date]');
    const end = search.querySelector('[data-end-date]');

    if (start && end && (!start.value || !end.value)) {
      alert('Elige la fecha de salida y regreso.');
      return;
    }

    const params = new URLSearchParams(
      new FormData(event.currentTarget)
    );

    location.href = `inventario.html?${params.toString()}`;
  });
}

/* INVENTARIO */

function inventory() {
  const category = document.querySelector('#category');
  const order = document.querySelector('#order');

  if (!category || !order) return;

  const passengerRequirement = Number(
    new URLSearchParams(location.search).get('pasajeros') || 0
  );

  function render() {
    let filtered = cars.filter((car) => {
      return category.value === 'Todas' ||
        car.category === category.value;
    });

    if (passengerRequirement) {
      filtered = filtered.filter((car) => {
        return Number.parseInt(car.passengers, 10) >=
          passengerRequirement;
      });
    }

    if (order.value === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    }

    if (order.value === 'desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    renderCars(filtered, '#inventory');

    const count = document.querySelector('#count');

    if (count) {
      count.textContent = `${filtered.length} autos disponibles`;
    }
  }

  category.addEventListener('change', render);
  order.addEventListener('change', render);

  render();
}

/* INICIO GENERAL */

function boot() {
  document.body.insertAdjacentHTML(
    'afterbegin',
    navigation()
  );

  document.body.insertAdjacentHTML(
    'beforeend',
    '<div class="modal" id="modal"></div>'
  );

  enhanceControls(document);

  let lastPosition = 0;

  window.addEventListener('scroll', () => {
    const header = document.querySelector('.nav');
    const currentPosition = window.scrollY;

    header.classList.toggle(
      'hidden',
      currentPosition > 80 &&
      currentPosition > lastPosition
    );

    lastPosition = currentPosition;
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.custom-select')) {
      closeCustomSelects();
    }

    if (!event.target.closest('[data-carvia-range]')) {
      document.querySelectorAll(
        '[data-calendar-popover].open'
      ).forEach((popover) => {
        popover.classList.remove('open');
      });
    }
  });

  const page = document.body.dataset.page;

  if (page === 'home') {
    home();
  }

  if (page === 'inventory') {
    inventory();
  }

  if (page === 'offers') {
    renderCars(
      cars.filter((car) => car.price <= 3500),
      '#offers'
    );
  }
}

document.addEventListener('DOMContentLoaded', boot);