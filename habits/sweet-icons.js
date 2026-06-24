/* sweet-icons.js
   Колекція кольорових іконок "солодкого" для перегляду та підстановки у habbits/icons.js
   Кожна іконка має id та svg (20x20). Є функція renderSweetIcons(containerId) для швидкого прев'ю.
   Автор: Zed agent
*/

const SWEET_ICONS = [
  {
    id: 'donut-filled',
    svg: `<!-- Donut (filled) -->
<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="#F8BBD0" d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 6a2 2 0 110 4 2 2 0 010-4z"/>
  <path fill="#FFF" d="M6 9c1.5 1 3 1 6 1s4.5 0 6-1c-1 2-3 3-6 3s-5-1-6-3z"/>
</svg>`
  },
  {
    id: 'cupcake',
    svg: `<!-- Cupcake -->
<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="#FFECB3" d="M5 12c0 3 1.5 5 7 5s7-2 7-5H5z"/>
  <path fill="#FFCDD2" d="M8 9a4 4 0 018 0c1 0 2 .5 2 1H6c0-.5 1-1 2-1z"/>
  <circle cx="12" cy="6" r="1" fill="#D32F2F"/>
</svg>`
  },
  {
    id: 'candy',
    svg: `<!-- Candy (wrapped) -->
<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="#FFE082" d="M12 8c2 0 4 1.5 4 4s-2 4-4 4-4-1.5-4-4 2-4 4-4z"/>
  <path fill="#FF8A65" d="M4 10c2 1.2 3 1.2 5 1.2S12 11 14 11s3 0 5-1.2c-2 2-5 2-7 2s-5 0-7-2z"/>
</svg>`
  },
  {
    id: 'donut-sprinkles',
    svg: `<!-- Donut with sprinkles -->
<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="12" cy="12" r="8" fill="#FFD54F"/>
  <circle cx="12" cy="12" r="3" fill="#FFF"/>
  <g fill="#8E24AA">
    <rect x="9" y="7" width="1" height="2"/>
    <rect x="15" y="8" width="1" height="2"/>
    <rect x="11" y="14" width="1" height="2"/>
  </g>
</svg>`
  },
  {
    id: 'chocolate',
    svg: `<!-- Chocolate bar -->
<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="4" y="6" width="16" height="12" rx="1" fill="#6D4C41"/>
  <g fill="#5D4037">
    <rect x="5" y="7" width="3" height="4"/>
    <rect x="9" y="7" width="3" height="4"/>
    <rect x="13" y="7" width="3" height="4"/>
    <rect x="17" y="7" width="2" height="4"/>
  </g>
</svg>`
  },
  {
    id: 'lollipop',
    svg: `<!-- Lollipop -->
<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="10" cy="8" r="4" fill="#F48FB1"/>
  <rect x="11.5" y="11.5" width="1.5" height="6" fill="#BCAAA4"/>
</svg>`
  }
];

// Attach to window for quick console access (if running in browser)
if (typeof window !== 'undefined') {
  window.SWEET_ICONS = SWEET_ICONS;
}

// Simple renderer: render icons into a container element by id
function renderSweetIcons(containerId) {
  const container = document.getElementById(containerId) || document.body;
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.gap = '12px';
  wrapper.style.alignItems = 'center';
  wrapper.style.flexWrap = 'wrap';

  SWEET_ICONS.forEach(icon => {
    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.fontFamily = 'sans-serif';
    card.style.fontSize = '11px';

    const iconWrap = document.createElement('div');
    iconWrap.innerHTML = icon.svg;
    iconWrap.style.width = '20px';
    iconWrap.style.height = '20px';

    const label = document.createElement('div');
    label.textContent = icon.id;
    label.style.marginTop = '6px';

    card.appendChild(iconWrap);
    card.appendChild(label);
    wrapper.appendChild(card);
  });

  container.appendChild(wrapper);
}

// Export for CommonJS/ES if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SWEET_ICONS, renderSweetIcons };
}

/* Usage:
   - In devtools console: renderSweetIcons()  // appends preview to body
   - Or import SWEET_ICONS and copy svg into icons.js
*/
