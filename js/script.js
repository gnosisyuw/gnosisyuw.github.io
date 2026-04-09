"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });

    initTheme();
    loadAndDisplayExperience();
    loadAndDisplayPublications();
    initSectionNav();
});

/**
 * Theme Management
 */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const icon = themeToggle.querySelector('i');

    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const profileImage = document.querySelector('.profile-image');
        if (profileImage) {
            profileImage.src = 'media/profile.jpg';
        }

        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(savedTheme || systemTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
}

/**
 * Publications Logic
 */
let publications = [];
let debounceTimer;

function loadAndDisplayPublications() {
    if (window.papersData) {
        publications = window.papersData.papers;
        displayPublications(publications);
    } else {
        console.error("papers.js not loaded");
    }
}

function toggleAbstract(index) {
    const card = document.getElementById(`publication-${index}`);
    const abstractContent = document.getElementById(`abstract-${index}`);
    
    if (!card || !abstractContent) return;

    const isExpanded = card.classList.contains("expanded");
    card.classList.toggle("expanded");
    
    // Animate height
    abstractContent.style.maxHeight = isExpanded ? "0" : `${abstractContent.scrollHeight}px`;
    
    const chevronIcon = card.querySelector(".fa-chevron-down");
    if (chevronIcon) chevronIcon.classList.toggle("rotate-180");
}

function createMediaElement(paper) {
    if (paper.media && paper.media.trim() !== "") {
        const isVideo = paper.media.match(/\.(mp4|webm|mov|avi|mkv)$/);
        const className = isVideo ? "video-media lazy-video" : "image-media lazy-image";
        const tag = isVideo ? "video" : "img";
        const extraAttrs = isVideo ? 'muted playsinline loop preload="none"' : '';
        const alt = isVideo ? '' : `alt="${paper.title} Preview"`;
        const zoomStyle = paper.mediaZoom ? ` style="transform:scale(${paper.mediaZoom});transform-origin:center center;"` : '';

        return `<${tag} class="${className}" data-src="${paper.media}" ${extraAttrs} ${alt}${zoomStyle} onerror="this.style.display='none'"></${tag}>`;
    }

    return `
        <div class="media-placeholder">
            <div class="media-placeholder-icon-container">
                <i class="fas fa-image media-icon" aria-hidden="true"></i>
            </div>
        </div>
    `;
}

const PUBLICATIONS_INITIAL_COUNT = 5;
let publicationsExpanded = false;

function displayPublications(papers, isFiltered = false) {
    const container = document.getElementById("publications-container");
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    papers.forEach((paper, index) => {
        const mediaContent = createMediaElement(paper);
        const authorsHtml = paper.authors.replace("Wei Yu", "<strong>Wei Yu</strong>");

        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-12';
        if (!isFiltered && index >= PUBLICATIONS_INITIAL_COUNT && !publicationsExpanded) {
            colDiv.classList.add('publication-hidden');
        }

        const cardClass = `card publication-card publication-card-custom ${paper.abstract ? "pointer" : ""}`;
        const onClickAttr = paper.abstract ? `onclick="toggleAbstract(${index})"` : "";

        const projectLink = paper.url
            ? `<a href="${paper.url}" target="_blank" class="project-link" onclick="event.stopPropagation()">
                 <i class="fas fa-external-link-alt"></i>Project Page
               </a>`
            : "";

        const paperLink = paper.paper
            ? `<a href="${paper.paper}" target="_blank" class="project-link" onclick="event.stopPropagation()">
                 <i class="fas fa-file-alt"></i>Paper
               </a>`
            : "";

        const twitterLink = paper.twitter
            ? `<a href="${paper.twitter}" target="_blank" class="project-link" onclick="event.stopPropagation()">
                 <i class="fa-brands fa-x-twitter"></i>Post
               </a>`
            : "";

        const abstractSection = paper.abstract
            ? `<div class="abstract-content" id="abstract-${index}">
                 <p class="mt-2 small">${paper.abstract}</p>
               </div>
               <div class="text-center mt-2 abstract-toggle">
                 <i class="fas fa-chevron-down text-gray-400 transition-transform duration-300"></i>
               </div>`
            : "";

        colDiv.innerHTML = `
        <div class="${cardClass}" id="publication-${index}" ${onClickAttr}>
            <div class="row g-0 align-items-stretch" style="min-height:0;">
                <div class="col-md-3 d-flex align-items-stretch justify-content-center" style="padding:0;">
                    <div class="media-container-custom">
                        ${mediaContent}
                    </div>
                </div>
                <div class="col-md-9 d-flex align-items-center" style="padding:0;">
                    <div class="publication-body-custom">
                        <span class="venue-badge">${paper.venue}</span>
                        <h5 class="mb-1">${paper.title}</h5>
                        <p class="mb-0 small">${authorsHtml}</p>
                        ${(projectLink || paperLink || twitterLink) ? `<div class="mt-2 d-flex gap-3">${paperLink}${projectLink}${twitterLink}</div>` : ""}
                        ${abstractSection}
                    </div>
                </div>
            </div>
        </div>`;

        fragment.appendChild(colDiv);
    });

    container.appendChild(fragment);

    // Show/hide toggle button
    const toggleBtn = document.getElementById("publications-toggle");
    if (!isFiltered && papers.length > PUBLICATIONS_INITIAL_COUNT) {
        toggleBtn.style.display = "flex";
        toggleBtn.innerHTML = publicationsExpanded
            ? `<i class="fas fa-chevron-up me-2"></i>Show Less`
            : `<i class="fas fa-chevron-down me-2"></i>Show More (${papers.length - PUBLICATIONS_INITIAL_COUNT} more)`;
    } else {
        toggleBtn.style.display = "none";
    }

    initLazyLoading();
}

window.togglePublications = function() {
    publicationsExpanded = !publicationsExpanded;
    displayPublications(publications);
};

function filterPublications() {
    const searchInput = document.getElementById("publicationSearch");
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const filteredPapers = publications.filter((paper) =>
        paper.title.toLowerCase().includes(searchTerm) ||
        paper.authors.toLowerCase().includes(searchTerm) ||
        paper.venue.toLowerCase().includes(searchTerm) ||
        (paper.abstract && paper.abstract.toLowerCase().includes(searchTerm))
    );
    const isFiltered = searchTerm.length > 0;
    displayPublications(filteredPapers, isFiltered);
}

// Make accessible globally for the input oninput
window.debouncedFilterPublications = function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(filterPublications, 300);
};

// Make accessible globally for onclick
window.toggleAbstract = toggleAbstract;

/**
 * Lazy Loading
 */
function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                if (element.tagName === 'IMG') {
                    element.src = element.dataset.src;
                    element.classList.remove('lazy-image');
                } else if (element.tagName === 'VIDEO') {
                    element.src = element.dataset.src;
                    element.load();
                    // Only autoplay videos that are in viewport
                    element.play().catch(() => {});
                    element.classList.remove('lazy-video');
                }
                observer.unobserve(element);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    document.querySelectorAll('.lazy-image, .lazy-video').forEach(element => {
        imageObserver.observe(element);
    });
}

/**
 * Experience Section Logic
 */
function loadAndDisplayExperience() {
    if (window.experienceData) {
        displayExperience(window.experienceData.experience);
    } else {
        console.error("experience.js not loaded");
    }
}

function displayExperience(experience) {
    const timeline = document.getElementById("timeline");
    timeline.innerHTML = "";
    const fragment = document.createDocumentFragment();
    
    for (let i = experience.length - 1; i >= 0; i--) {
        const item = experience[i];
        const div = document.createElement('div');
        div.className = 'timeline-item';
        
        const bgStyle = item.logo_bg ? `style="background-color: ${item.logo_bg}"` : '';
        const crossOriginAttr = item.logo_bg ? '' : 'crossorigin="anonymous"';
        const onloadAttr = item.logo_bg ? '' : 'onload="adjustLogoBackground(this)"';

        div.innerHTML = `
            <div class="d-flex align-items-center w-100">
                <div class="experience-logo-container me-3" ${bgStyle}>
                    <img src="${item.logo}" alt="${item.company}" class="experience-logo" ${crossOriginAttr} ${onloadAttr}>
                </div>
                <div>
                    <h4 class="mb-1">${item.company}</h4>
                    <p class="mb-1">${item.title}</p>
                    ${item.time ? `<p class="time-range mb-0">${item.time}</p>` : ''}
                </div>
            </div>
        `;
        fragment.insertBefore(div, fragment.firstChild);
    }
    timeline.appendChild(fragment);
    
    // Scroll to end of timeline
    requestAnimationFrame(() => {
        const container = document.querySelector(".timeline-container");
        if (container) {
            container.scrollLeft = container.scrollWidth;
        }
    });
}

// Global exposure for onload attribute
window.adjustLogoBackground = function(img) {
    if (!img.complete || img.naturalWidth === 0) return;

    try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let totalLuminance = 0;
        let pixelCount = 0;

        // Sample every 40th pixel to save performance
        for (let i = 0; i < data.length; i += 40) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Consider only pixels that are opaque enough
            if (a > 20) {
                // Perceived luminance: 0.299R + 0.587G + 0.114B
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                totalLuminance += luminance;
                pixelCount++;
            }
        }

        if (pixelCount > 0) {
            const avgLuminance = totalLuminance / pixelCount;
            // Threshold: if average luminance > 200 (mostly white/light), switch to dark bg
            if (avgLuminance > 200) {
                img.parentElement.style.backgroundColor = '#1d1d1f';
            }
        }
    } catch (e) {
        console.warn('Could not analyze image for background adjustment:', e);
    }
};

/**
 * Section Navigation Logic
 */
function initSectionNav() {
    const navCurrent = document.getElementById('nav-current');
    const navList = document.getElementById('nav-list');
    const currentSectionName = document.getElementById('current-section-name');
    const sections = document.querySelectorAll('section');
    
    if (!navCurrent || !navList || !currentSectionName || sections.length === 0) return;

    // Populate list
    sections.forEach(section => {
        const id = section.id;
        // Use h1 for Home section if no h2, or default to ID
        let name = '';
        const h2 = section.querySelector('h2');
        if (h2) {
            name = h2.innerText;
        } else if (id === 'home') {
            name = 'Home';
        } else {
            name = id.charAt(0).toUpperCase() + id.slice(1);
        }
        
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerText = name;
        li.dataset.target = id;
        
        li.addEventListener('click', () => {
            const target = document.getElementById(id);
            if (target) {
                // Offset for fixed header if any (minimal here)
                const offset = 20; 
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
            navList.classList.remove('show');
            navCurrent.classList.remove('active');
        });
        
        navList.appendChild(li);
    });
    
    // Toggle menu
    navCurrent.addEventListener('click', (e) => {
        e.stopPropagation();
        navList.classList.toggle('show');
        navCurrent.classList.toggle('active');
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!navCurrent.contains(e.target) && !navList.contains(e.target)) {
            navList.classList.remove('show');
            navCurrent.classList.remove('active');
        }
    });
    
    // Scroll spy
    const observerOptions = {
        root: null,
        // Trigger when section touches the top part of the screen (15% from top)
        rootMargin: '-15% 0px -85% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                // Update text
                let name = '';
                const h2 = entry.target.querySelector('h2');
                if (h2) {
                    name = h2.innerText;
                } else if (id === 'home') {
                    name = 'Home';
                } else {
                    name = id.charAt(0).toUpperCase() + id.slice(1);
                }
                
                currentSectionName.innerText = name;
                
                // Update list active state
                document.querySelectorAll('.nav-item').forEach(item => {
                    if (item.dataset.target === id) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}
