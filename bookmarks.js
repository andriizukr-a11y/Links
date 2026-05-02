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
  countEl.textContent = `(${realBookmarks.length})`;

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
    try {
      domain = new URL(bookmark.href).hostname;
    } catch {}

    let iconHtml = '';
    if (domain) {
      const iconSrc = CONFIG.customIcons?.[domain] ?? `https://${domain}/favicon.ico`;
      iconHtml = `<img class="bookmark-icon" src="${iconSrc}" data-domain="${domain}" onerror="handleFaviconError(this)">`;
    } else {
      iconHtml = `<span style="margin-right: 12px;">🔗</span>`;
    }

    html += `
      <div class="bookmark-item">
        ${iconHtml}
        <a href="${bookmark.href}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(bookmark.title)}
        </a>
      </div>
    `;
  }

  html += '</div>';
  output.innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Fallback для іконок - замінює на default.png
function handleFaviconError(img) {
  const domain = img.dataset?.domain || '';
  const currentSrc = img.src;
  
  // Якщо це перша спроба (.ico), пробуємо .png
  if (currentSrc.endsWith('/favicon.ico')) {
    img.src = `https://${domain}/favicon.png`;
    return;
  }
  
  // Замінюємо на default.png
  img.src = 'data/favicons/default.png';
  img.onerror = null; // Запобігаємо нескінченному циклу
}
