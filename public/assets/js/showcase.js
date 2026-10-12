(() => {
  'use strict';

  const svgNS = 'http://www.w3.org/2000/svg';
  const icon = (name) => {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(svgNS, 'use');
    use.setAttribute('href', `/assets/icons/lucide.svg#${name}`);
    svg.append(use);
    return svg;
  };
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };
  const safeMediaURL = (value) => {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value, location.origin);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const fetchJSON = async (url) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      return await response.json();
    } finally { clearTimeout(timeout); }
  };

  function protectImage(image) {
    image.addEventListener('error', () => {
      const frame = image.parentElement;
      if (!frame || frame.classList.contains('media-error')) return;
      frame.classList.add('media-error');
      frame.append(icon('image-off'), element('p', '', 'Gambar belum bisa dimuat.'));
    }, { once: true });
    if (image.complete && !image.naturalWidth) image.dispatchEvent(new Event('error'));
  }

  const menu = document.querySelector('#mobile-menu');
  const menuToggle = document.querySelector('#menu-toggle');
  menuToggle.addEventListener('click', () => {
    menu.showModal();
    menuToggle.setAttribute('aria-expanded', 'true');
  });
  menu.addEventListener('close', () => menuToggle.setAttribute('aria-expanded', 'false'));
  menu.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.close();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    });
  });
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  matchMedia('(min-width:960px)').addEventListener('change', (event) => {
    if (event.matches && menu.open) menu.close();
  });

  const projectList = document.querySelector('#project-list');
  const projectNotice = document.querySelector('#project-notice');
  const projectStatus = document.querySelector('#project-status');
  const retryProjects = document.querySelector('#retry-projects');
  const initialProjects = [...projectList.children].map((node) => node.cloneNode(true));
  const legacyCovers = new Set([
    '4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
    '26f04b2b-4ba5-4f3b-baef-c3dfdc2d08a5_1600w.webp',
    '5bab247f-35d9-400d-a82b-fd87cfe913d2_1600w.webp',
    '30104e3c-5eea-4b93-93e9-5313698a7156_1600w.webp',
  ]);
  const isCustomCover = (url) => url && !legacyCovers.has(url.split('/').pop()?.split('?')[0]);
  const createProjectImage = (project) => {
    const image = element('img', '');
    image.src = safeMediaURL(project.cover_image_url);
    image.alt = String(project.cover_image_alt || project.title);
    image.loading = 'lazy';
    image.decoding = 'async';
    return image;
  };

  function createProject(project) {
    const article = element('article', 'project-feature');
    const href = `/work/${encodeURIComponent(project.slug)}`;
    const visual = element('a', 'project-art');
    visual.href = href;
    visual.setAttribute('aria-label', `View case study: ${project.title}`);
    if (safeMediaURL(project.cover_image_url)) visual.append(createProjectImage(project));
    else {
      visual.classList.add('media-error');
      visual.append(icon('file-text'), element('p', '', project.title));
    }
    const story = element('div', 'project-story');
    story.append(element('h3', '', project.title), element('p', 'project-category', project.category || 'Selected work'));
    story.append(element('p', '', project.subtitle || project.description || ''));
    const action = element('a', 'button button-outline', 'View case study');
    action.href = href;
    action.append(icon('arrow-right'));
    const actions = element('div', 'actions');
    actions.style.marginTop = '24px';
    actions.append(action);
    story.append(actions);
    article.append(visual, story);
    return article;
  }

  async function syncProjects() {
    projectList.setAttribute('aria-busy', 'true');
    retryProjects.disabled = true;
    projectNotice.hidden = true;
    try {
      const data = await fetchJSON('/api/projects');
      if (!Array.isArray(data.projects)) throw new Error('Invalid projects response');
      const projects = data.projects.filter((p) => p && typeof p.slug === 'string' && p.slug && typeof p.title === 'string');
      const fragment = document.createDocumentFragment();
      const rendered = new Set();
      initialProjects.forEach((template) => {
        const slug = template.dataset.project;
        const project = projects.find((p) => p.slug === slug);
        if (!project) return;
        const article = template.cloneNode(true);
        const cover = safeMediaURL(project.cover_image_url);
        if (isCustomCover(cover)) {
          const frame = article.querySelector('.project-art');
          frame.className = 'project-art';
          frame.replaceChildren(createProjectImage(project));
        }
        fragment.append(article);
        rendered.add(slug);
      });
      projects.filter((p) => !rendered.has(p.slug)).forEach((p) => fragment.append(createProject(p)));
      projectList.replaceChildren(fragment);
      projectList.querySelectorAll('img').forEach(protectImage);
      document.querySelectorAll('.work-strip a[href^="/work/"]').forEach((link) => {
        const slug = decodeURIComponent(new URL(link.href).pathname.split('/').pop());
        link.hidden = !projects.some((p) => p.slug === slug);
      });
      if (!projects.length) {
        projectNotice.hidden = false;
        projectStatus.textContent = 'Studi kasus sedang disiapkan. Sementara itu, Anda bisa melihat arsip visual di bawah.';
        retryProjects.hidden = true;
      } else {
        const headingCopy = document.querySelector('#work .section-heading > p');
        headingCopy.textContent = projects.length === 3
          ? 'Tiga project, tiga tantangan berbeda. Dari membuat aktivitas lebih seru sampai merapikan cara tim mencari informasi dan mengambil keputusan.'
          : 'Pilihan project dari creative thinking, visual, dan solusi digital. Lihat masalahnya, cara saya merespons, dan hasilnya.';
      }
    } catch {
      projectNotice.hidden = false;
      projectStatus.textContent = 'Pembaruan karya belum bisa dimuat. Pilihan karya terakhir tetap bisa dilihat.';
      retryProjects.hidden = false;
    } finally {
      projectList.setAttribute('aria-busy', 'false');
      retryProjects.disabled = false;
    }
  }
  retryProjects.addEventListener('click', syncProjects);

  let archiveItems = [];
  let filteredItems = [];
  let activeCategory = 'All visuals';
  let imageIndex = 0;
  const archiveGrid = document.querySelector('#archive-grid');
  const archiveFilters = document.querySelector('#archive-filters');
  const archiveRecovery = document.querySelector('#archive-recovery');
  const archiveStatus = document.querySelector('#archive-status');
  const archiveCount = document.querySelector('#archive-count');
  const retryArchive = document.querySelector('#retry-archive');
  const imageDialog = document.querySelector('#image-dialog');
  const enlargedImage = document.querySelector('#enlarged-image');
  const lightboxError = document.querySelector('#lightbox-error');
  const previousImage = document.querySelector('#previous-image');
  const nextImage = document.querySelector('#next-image');
  const interfaceCaptures = [
    { url: '/assets/work/listing-hub.jpg', alt: 'Pencarian dan perbandingan properti di Listing Hub', caption: 'Listing Hub / Search & comparison', category: 'Interface design' },
    { url: '/assets/work/listing-filter.jpg', alt: 'Filter listing mobile untuk memilih transaksi, tipe properti, budget, agent, dan luas properti', caption: 'Listing Hub / Mobile filtering', category: 'Interface design' },
  ];
  const seedCaptions = new Set([
    'Minimalist monochrome aesthetic study', 'Editorial design composition',
    'High-contrast typographic structure', 'Conceptual motion framing', 'Digital layout fragment',
  ]);
  const seedFiles = new Set([
    '4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
    'c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg',
    '917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg',
  ]);
  const isUneditedSeed = (item) => /^gallery-0[1-5]$/.test(item.id || '')
    && /^Visual Archive Fragment 0[1-5]$/.test(item.alt || '')
    && seedCaptions.has(item.caption)
    && seedFiles.has(item.url?.split('/').pop());

  function showImage(index) {
    if (!filteredItems.length) return;
    imageIndex = (index + filteredItems.length) % filteredItems.length;
    const item = filteredItems[imageIndex];
    enlargedImage.hidden = false;
    lightboxError.hidden = true;
    enlargedImage.alt = item.alt || item.caption || 'Visual archive';
    enlargedImage.src = item.url;
    document.querySelector('#image-caption').textContent = item.caption || item.alt || item.category;
    document.querySelector('#image-position').textContent = `${imageIndex + 1} / ${filteredItems.length} · ${item.category}`;
    previousImage.disabled = nextImage.disabled = filteredItems.length < 2;
  }
  enlargedImage.addEventListener('error', () => {
    enlargedImage.hidden = true;
    lightboxError.hidden = false;
  });
  previousImage.addEventListener('click', () => showImage(imageIndex - 1));
  nextImage.addEventListener('click', () => showImage(imageIndex + 1));
  imageDialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(imageIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  imageDialog.addEventListener('close', () => enlargedImage.removeAttribute('src'));

  function renderArchive() {
    filteredItems = archiveItems.filter((item) => activeCategory === 'All visuals' || item.category === activeCategory);
    archiveFilters.querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button.textContent === activeCategory)));
    archiveCount.textContent = `${filteredItems.length} visual${filteredItems.length === 1 ? '' : 's'}`;
    const fragment = document.createDocumentFragment();
    filteredItems.forEach((item, index) => {
      const button = element('button', 'archive-item');
      button.type = 'button';
      button.setAttribute('aria-label', `Enlarge image: ${item.caption || item.alt || item.category}`);
      button.setAttribute('aria-haspopup', 'dialog');
      const frame = element('span', 'archive-image');
      const image = element('img', '');
      image.src = item.url;
      image.alt = item.alt || item.caption || item.category;
      image.loading = 'lazy';
      image.decoding = 'async';
      const enlarge = element('span', 'enlarge-label');
      enlarge.append(icon('maximize-2'), element('span', '', 'Enlarge'));
      frame.append(image, enlarge);
      button.append(frame, element('span', 'archive-caption', item.caption || item.alt || 'Visual exploration'), element('span', 'archive-category', item.category));
      button.addEventListener('click', () => { showImage(index); imageDialog.showModal(); });
      fragment.append(button);
      protectImage(image);
    });
    archiveGrid.replaceChildren(fragment);
    archiveGrid.dataset.count = String(filteredItems.length);
    if (!filteredItems.length) archiveGrid.append(element('p', 'archive-state', 'Belum ada visual di kategori ini.'));
  }

  async function loadArchive() {
    archiveRecovery.hidden = true;
    archiveGrid.setAttribute('aria-busy', 'true');
    retryArchive.disabled = true;
    try {
      const data = await fetchJSON('/api/gallery');
      if (!Array.isArray(data.items)) throw new Error('Invalid archive response');
      const publishedItems = data.items.filter((item) => item && safeMediaURL(item.url) && !isUneditedSeed(item));
      const uniqueURLs = new Set(publishedItems.map((item) => safeMediaURL(item.url)));
      archiveItems = [...publishedItems, ...interfaceCaptures.filter((item) => !uniqueURLs.has(safeMediaURL(item.url)))].map((item) => ({
        url: safeMediaURL(item.url), alt: String(item.alt || ''),
        caption: String(item.caption || ''), category: String(item.category || 'Visual'),
      }));
      const categories = ['All visuals', ...new Set(archiveItems.map((item) => item.category))];
      if (!categories.includes(activeCategory)) activeCategory = 'All visuals';
      archiveFilters.replaceChildren();
      categories.forEach((category) => {
        const button = element('button', 'filter-button', category);
        button.type = 'button';
        button.addEventListener('click', () => { activeCategory = category; renderArchive(); });
        archiveFilters.append(button);
      });
      archiveFilters.hidden = categories.length < 3;
      renderArchive();
      if (!archiveItems.length) archiveGrid.replaceChildren(element('p', 'archive-state', 'Arsip visual sedang dikurasi. Lihat studi kasus di atas untuk menjelajahi karya saya.'));
    } catch {
      archiveGrid.replaceChildren();
      archiveFilters.hidden = true;
      archiveCount.textContent = '';
      archiveRecovery.hidden = false;
      archiveStatus.textContent = 'Arsip visual belum bisa dimuat. Periksa koneksi Anda, lalu coba lagi.';
    } finally {
      archiveGrid.setAttribute('aria-busy', 'false');
      retryArchive.disabled = false;
    }
  }
  retryArchive.addEventListener('click', loadArchive);
  document.querySelectorAll('img[src]').forEach(protectImage);
  document.querySelector('#copyright-year').textContent = new Date().getFullYear();
  syncProjects();
  loadArchive();
})();
