/* ---------- BOOKMARKS (PARSING + RENDERING) ---------- */

function parseBookmarks(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  const bookmarks = xmlDoc.querySelectorAll("bookmark");
  const result = [];

  bookmarks.forEach(bookmark => {
    const href = bookmark.getAttribute("href");
    const titleEl = bookmark.querySelector("title");
    const title = titleEl?.textContent?.trim() || "Без назви";

    if (href) {
      result.push({ title, href });
    }
  });

  return result;
}

function displayBookmarks(tabId, bookmarks) {
  const output = document.getElementById(`output-${tabId}`);
  const countEl = document.getElementById(`count-${tabId}`);

  const realBookmarks = bookmarks.filter(b => !b.href.includes('separator.floccus.org'));
  if (countEl) {
    countEl.textContent = `${realBookmarks.length}`;
    countEl.classList.add('ready');
  }

  if (!bookmarks.length) {
    output.innerHTML = '<div class="no-results">Закладки не знайдено</div>';
    return;
  }

  let html = '<div class="bookmarks-list">';

  for (const bookmark of bookmarks) {
    if (bookmark.href.includes('separator.floccus.org')) {
      html += `<div class="separator"></div>`;
      continue;
    }

    let domain = '';
    let urlWithPath = '';
    try {
      const urlObj = new URL(bookmark.href);
      domain = urlObj.hostname;
      urlWithPath = urlObj.hostname + urlObj.pathname;
    } catch {}

    let iconHtml = '';
    if (domain) {
      const customIconKey = Object.keys(CONFIG.customIcons || {}).find(key => urlWithPath.startsWith(key));
      const iconSrc = customIconKey
        ? CONFIG.customIcons[customIconKey]
        : `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
      iconHtml = `<img class="bookmark-icon" src="${iconSrc}" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-domain="${domain}" onerror="this.onerror=null;this.src='data/favicons/default.png';">`;
    } else {
      iconHtml = `<span style="margin-right: 12px;">🔗</span>`;
    }

    const domainLabel = domain ? `<span class="bookmark-domain">${domain}</span>` : '';
    html += `
      <a class="bookmark-item" href="${bookmark.href}" target="_blank" rel="noopener noreferrer" data-full-title="${escapeHtml(bookmark.title)}">
        ${iconHtml}
        <span class="bookmark-text">
          <span class="bookmark-title">${escapeHtml(cleanTitle(bookmark.title))}</span>
          ${domainLabel}
        </span>
      </a>
    `;
  }

  html += '</div>';
  output.innerHTML = html;
  // setupTooltips робить forced reflow (scrollWidth/clientWidth) — відкладаємо після першого пайнту.
  requestAnimationFrame(() => requestAnimationFrame(() => setupTooltips(output)));

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isTouchDevice) {
    output.querySelectorAll('.bookmark-item').forEach(item => {
      item.removeAttribute('target');
      item.removeAttribute('rel');
    });
  }
}

function cleanTitle(title) {
  const sites = (CONFIG.cleanTitleSites || []).join('|');
  if (!sites) return title.trim();
  return title.replace(new RegExp(`\\s-\\s(${sites})$`, 'i'), '').trim();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Очищаємо старий кеш фавіконок у localStorage (перехід на Google s2 + кеш браузера).
(function purgeOldFaviconCache() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith('fav_')) localStorage.removeItem(k);
    }
  } catch {}
})();

function setupTooltips(container) {
  container.querySelectorAll('.bookmark-item').forEach(item => {
    const titleEl = item.querySelector('.bookmark-title');
    const fullTitle = item.dataset.fullTitle;
    
    if (titleEl && fullTitle) {
      const isTruncated = titleEl.scrollWidth > titleEl.clientWidth;
      if (isTruncated) {
        item.setAttribute('title', fullTitle);
      } else {
        item.removeAttribute('title');
      }
    }
  });
}

function updateAllTooltips() {
  document.querySelectorAll('.bookmarks-list').forEach(list => {
    setupTooltips(list);
  });
}

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(updateAllTooltips, 100);
});
