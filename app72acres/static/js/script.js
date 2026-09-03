// =========================================================
// ESTATELINE — Homepage interactivity
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initRevealOnScroll();
  initCategoryChips();
  initSearchForm();
  initFavoriteButtons();
});

/**
 * Fades/slides elements with class "reveal" into view as the
 * user scrolls down to them. Respects prefers-reduced-motion
 * by relying on the CSS transition itself being near-instant
 * in that case (handled in style.css).
 */
function initRevealOnScroll() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((item) => observer.observe(item));
}

/**
 * Category filter chips above the property grid.
 * Currently filters the demo cards client-side by matching
 * the chip label against each card's title/specs text.
 * Replace this with a real request to your Django view
 * (e.g. fetch(`/api/properties?category=${value}`)) once
 * the backend endpoint exists.
 */
function initCategoryChips() {
  const chips = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('.property-card');
  if (!chips.length) return;

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.textContent.trim().toLowerCase();

      cards.forEach((card) => {
        if (filter === 'all') {
          card.style.display = '';
          return;
        }
        const text = card.textContent.toLowerCase();
        const matches =
          (filter.includes('apartment') && text.includes('apartment')) ||
          (filter.includes('house') && (text.includes('house') || text.includes('villa'))) ||
          (filter.includes('plot') && text.includes('plot')) ||
          (filter.includes('commercial') && (text.includes('shop') || text.includes('commercial') || text.includes('office')));

        card.style.display = matches ? '' : 'none';
      });
    });
  });
}

/**
 * Prevents the default full-page reload on the hero search
 * form and logs the query. Swap the console.log for a real
 * redirect to your Django search results view, e.g.:
 *   window.location.href = `/properties/?city=${city}&type=${type}&budget=${budget}`;
 */
function initSearchForm() {
  const form = document.querySelector('.search-panel');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const city = document.getElementById('s-city').value.trim();
    const type = document.getElementById('s-type').value;
    const budget = document.getElementById('s-budget').value;

    // TODO: connect to your Django search endpoint
    console.log('Search submitted:', { city, type, budget });

    // Example of how you'd redirect once the backend route exists:
    // const params = new URLSearchParams({ city, type, budget });
    // window.location.href = `/properties/?${params.toString()}`;
  });
}

/**
 * Toggles the little heart/favorite icon on each property
 * card between saved and unsaved. Purely visual for now —
 * hook this up to a real "save property" endpoint once you
 * have user auth wired up (it should POST the property id
 * for the logged-in user).
 */
function initFavoriteButtons() {
  const favButtons = document.querySelectorAll('.card-fav');

  favButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isSaved = btn.getAttribute('data-saved') === 'true';
      btn.setAttribute('data-saved', String(!isSaved));

      const svg = btn.querySelector('svg');
      svg.setAttribute('fill', !isSaved ? '#A8462F' : 'none');
      svg.setAttribute('stroke', !isSaved ? '#A8462F' : 'currentColor');
    });
  });
}
