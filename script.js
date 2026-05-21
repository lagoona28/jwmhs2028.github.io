/* =========================================================
   JWMHS CLASS OF 2028 WEBSITE
   FULL SCRIPT.JS
   Google Sheets + Dashboard + Countdown + Polls + Mobile Nav
========================================================= */

/* =========================
   SCROLL ANIMATIONS
========================= */

const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }

    });

}, {
    threshold:0.1
});

document.querySelectorAll(".fade-up")
.forEach((el) => observer.observe(el));

/* =========================
   ACTIVE NAVIGATION
========================= */

const tabs =
document.querySelectorAll(".tab");

const mobileMenuLinks =
document.querySelectorAll(".mobile-menu-link");

const mobileBottomLinks =
document.querySelectorAll(".mobile-bottom-link");

const moreMenu =
document.getElementById("more-menu");

const moreMenuToggle =
document.getElementById("more-menu-toggle");

const mainPageHashes =
new Set([
    "#home",
    "#council",
    "#dashboard",
    "#student-tools",
    "#events",
    "#feedback",
    "#communication",
    "#requests"
]);

function normalizeNavigationHash(value){

    if(!value){
        return "#home";
    }

    if(value === "index.html" || value.endsWith("/index.html")){
        return "#home";
    }

    const hashIndex =
    value.indexOf("#");

    if(hashIndex >= 0){
        return value.slice(hashIndex) || "#home";
    }

    return value;

}

function normalizeToolPageAnchors(){

    if(!document.body.classList.contains("tool-page")){
        return;
    }

    document.querySelectorAll("a[href^='#']")
    .forEach((link) => {

        const hash =
        normalizeNavigationHash(link.getAttribute("href"));

        if(mainPageHashes.has(hash)){
            link.setAttribute("href", `index.html${hash}`);
        }

    });

}

normalizeToolPageAnchors();

function setActiveNavigation(hash){

    const targetHash =
    normalizeNavigationHash(hash || "#home");

    tabs.forEach((tab) => {

        tab.classList.toggle(
            "active",
            normalizeNavigationHash(tab.getAttribute("href")) === targetHash
        );

    });

    mobileMenuLinks.forEach((link) => {

        link.classList.toggle(
            "active",
            normalizeNavigationHash(link.getAttribute("href")) === targetHash
        );

    });

    mobileBottomLinks.forEach((link) => {

        link.classList.toggle(
            "active",
            normalizeNavigationHash(link.getAttribute("href")) === targetHash
        );

    });

    if(moreMenu){

        const moreMenuHasActiveLink =
        Boolean(moreMenu.querySelector(".tab.active"));

        moreMenu.classList.toggle(
            "has-active",
            moreMenuHasActiveLink
        );

    }

}

tabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        setActiveNavigation(normalizeNavigationHash(tab.getAttribute("href")));
        closeMoreMenu();

    });

});

mobileMenuLinks.forEach((link) => {

    link.addEventListener("click", () => {

        setActiveNavigation(normalizeNavigationHash(link.getAttribute("href")));
        closeMobileMenu();

    });

});

mobileBottomLinks.forEach((link) => {

    link.addEventListener("click", () => {

        setActiveNavigation(normalizeNavigationHash(link.getAttribute("href")));

    });

});

function closeMoreMenu(){

    if(moreMenu){
        moreMenu.classList.remove("open");
    }

    if(moreMenuToggle){
        moreMenuToggle.setAttribute("aria-expanded", "false");
    }

}

if(moreMenu && moreMenuToggle){

    moreMenuToggle.addEventListener("click", (event) => {

        event.stopPropagation();

        const isOpen =
        moreMenu.classList.toggle("open");

        moreMenuToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

    });

    document.addEventListener("click", (event) => {

        if(!moreMenu.contains(event.target)){
            closeMoreMenu();
        }

    });

    document.addEventListener("keydown", (event) => {

        if(event.key === "Escape"){
            closeMoreMenu();
        }

    });

}

/* =========================
   MOBILE MENU
========================= */

const mobileMenuToggle =
document.getElementById("mobile-menu-toggle");

const mobileMenuPanel =
document.getElementById("mobile-menu-panel");

function closeMobileMenu(){

    if(mobileMenuToggle){
        mobileMenuToggle.classList.remove("open");
    }

    if(mobileMenuPanel){
        mobileMenuPanel.classList.remove("open");
    }

}

if(mobileMenuToggle && mobileMenuPanel){

    mobileMenuToggle.addEventListener("click", () => {

        mobileMenuToggle.classList.toggle("open");
        mobileMenuPanel.classList.toggle("open");

    });

}

/* =========================
   ANNOUNCEMENT BAR
========================= */

const makeoverAlert =
document.getElementById("makeover-alert");

const makeoverAlertClose =
document.getElementById("makeover-alert-close");

function loadMakeoverAlertState(){

    if(!makeoverAlert){
        return;
    }

    const alertClosed =
    localStorage.getItem("jwmhs2028_makeover_alert_closed");

    if(alertClosed === "true"){
        makeoverAlert.classList.add("hide");
    }

}

if(makeoverAlertClose && makeoverAlert){

    makeoverAlertClose.addEventListener("click", () => {

        makeoverAlert.classList.add("hide");

        localStorage.setItem(
            "jwmhs2028_makeover_alert_closed",
            "true"
        );

    });

}

/* =========================
   SAFE TEXT HELPERS
========================= */

function escapeHTML(value){

    return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

function safeUrl(value){

    const url =
    String(value || "").trim();

    if(
        url.startsWith("http://")
        || url.startsWith("https://")
        || url.startsWith("#")
        || url.startsWith("mailto:")
    ){
        return url;
    }

    return "#";

}

/* =========================
   CSV PARSER
========================= */

function parseCSV(csv){

    const rows = [];
    let currentRow = [];
    let currentValue = "";
    let insideQuotes = false;

    for(let i = 0; i < csv.length; i++){

        const char = csv[i];
        const nextChar = csv[i + 1];

        if(char === '"' && insideQuotes && nextChar === '"'){
            currentValue += '"';
            i++;
        }

        else if(char === '"'){
            insideQuotes = !insideQuotes;
        }

        else if(char === "," && !insideQuotes){
            currentRow.push(currentValue.trim());
            currentValue = "";
        }

        else if((char === "\n" || char === "\r") && !insideQuotes){

            if(currentValue || currentRow.length){
                currentRow.push(currentValue.trim());
                rows.push(currentRow);
                currentRow = [];
                currentValue = "";
            }

            if(char === "\r" && nextChar === "\n"){
                i++;
            }

        }

        else{
            currentValue += char;
        }

    }

    if(currentValue || currentRow.length){
        currentRow.push(currentValue.trim());
        rows.push(currentRow);
    }

    return rows;

}

/* =========================
   GOOGLE SHEETS LINKS
========================= */

const updatesSheetUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vR5RuaHWBn_YylV0jvB7U6SevGSk9ayuiT1VO0M3uZ3rv4RCqcZrm333buUutaXExySMm5yHBT2KRAy/pub?output=csv";

const councilProjectsSheetUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQeMGUQHV6CMpvsaGOfd2JA-DbLfBDaVUKCoEleJPX8PMI6LeOXKRuO-KoNYUjS0KOK1R25tmYCRb48/pub?output=csv";

const quickLinksSheetUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSAMnlOh_x8FjB1fdGIjDmsnp9-alXvVd9w9NorXFacoDkbrZJeCgbmn4Kx-e2SwMVp5rMeTZIBgi7f/pub?output=csv";

const bellScheduleSheetUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQZh0vXKshkIhNs9J7m7MoMhc2PNwfC3VCGdFm-jAqzC31dOOVBoP57Npu3955eoku0GOm2dVfiDP5n/pub?output=csv";

const weeklyHappeningsSheetUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSqhG-hCgKuMomTaGCQdDfTA-UyLCJSFVf716mm87c5XyHnjKHCErzCIVjNZGjEReGPAI-dj3T_jyFF/pub?output=csv";

const faqSheetUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQgmb3X2UyqatNuOBBJ2jh6Xtgz2xiQ988DIceEW6PUUFBK4vMxD7t_cVGwY2jP29P62V2H2vg_23P8/pub?output=csv";

const heroCountdownSheetUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRVxzEdCkIZj2SFlhtNQ5C8OEJK3XuO4WZVUjQS1RQO-3T9fymlzByHQ6pftc41LJS75sHUa4sESaLv/pub?output=csv";

const courseSheetUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTraauIam0LG5jmQ6wRg9crrAGhDZEAwPU2E6kaiCN02afrLOuJop4SJK7JgptYRdcdeBQ_AgOuOl40/pub?output=csv";

const clubsSheetUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRTraMHVcYD9Ac9ki1fHVUAQgcvWBuS8GMIiyXf4lJ6nkEaRgVE-LNogJspvCemNYjgdvGkwvz6a23P/pub?output=csv";

const examPrepSheetUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRIzJfr4XejuAbEarmURoIK9wmiUmjMMZpoITiiiO9nFYYC5TNWlhVD9UEgWvC8GU7WuPU-wASwxcYq/pub?output=csv";

const viewerCounterApiUrl =
"https://script.google.com/macros/s/AKfycbzXTnEq-tpPUsr7DXJN7E88V7_WvgLmKWTTmtpZZJlBHamW45_tkM4917rMjRb0wRRZ/exec";

const viewerCounterCsvUrl =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vT0YxQoPJd-9g6BPZU9LB-SiObDeWGPcTPz4E5mNJ1eUJJ7T45paQfFSIbfvt7IXCmIyRfzZLJpVHAp/pub?output=csv";

const viewerCounterStorageKey =
"jwmhs2028_viewer_id";
/* =========================
   DARK MODE
========================= */

const themeToggle =
document.getElementById("theme-toggle");

const themeToggleIcon =
document.getElementById("theme-toggle-icon");

const themeToggleText =
document.getElementById("theme-toggle-text");

const mobileThemeToggle =
document.getElementById("mobile-theme-toggle");

const mobileThemeToggleIcon =
document.getElementById("mobile-theme-toggle-icon");

const mobileThemeToggleText =
document.getElementById("mobile-theme-toggle-text");

function applySavedTheme(){

    const savedTheme =
    localStorage.getItem("jwmhs2028_theme");

    if(savedTheme === "light"){
        document.body.classList.remove("dark-mode");
    }
    else{
        document.body.classList.add("dark-mode");
    }

    updateThemeToggleText();

}

function updateThemeToggleText(){

    const isDark =
    document.body.classList.contains("dark-mode");

    if(themeToggleIcon){
        themeToggleIcon.textContent =
        isDark ? "☀️" : "🌙";
    }

    if(themeToggleText){
        themeToggleText.textContent =
        isDark ? "Light Mode" : "Dark Mode";
    }

    if(mobileThemeToggleIcon){
        mobileThemeToggleIcon.textContent =
        isDark ? "☀️" : "🌙";
    }

    if(mobileThemeToggleText){
        mobileThemeToggleText.textContent =
        isDark ? "Light" : "Dark";
    }

    if(themeToggle){
        themeToggle.setAttribute("aria-pressed", String(isDark));
    }

    if(mobileThemeToggle){
        mobileThemeToggle.setAttribute("aria-pressed", String(isDark));
    }

}

function toggleTheme(){

    document.body.classList.toggle("dark-mode");

    const isDark =
    document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "jwmhs2028_theme",
        isDark ? "dark" : "light"
    );

    updateThemeToggleText();

}

if(themeToggle){

    themeToggle.addEventListener("click", toggleTheme);

}

if(mobileThemeToggle){

    mobileThemeToggle.addEventListener("click", toggleTheme);

}

/* =========================
   VIEWER COUNTER
========================= */

function getViewerId(){

    let viewerId =
    localStorage.getItem(viewerCounterStorageKey);

    if(!viewerId){

        if(window.crypto && crypto.randomUUID){
            viewerId =
            crypto.randomUUID();
        }
        else{
            viewerId =
            `viewer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        }

        localStorage.setItem(viewerCounterStorageKey, viewerId);

    }

    return viewerId;

}

function updateViewerCounter(count, status){

    const countElement =
    document.getElementById("viewer-count");

    const statusElement =
    document.getElementById("viewer-count-status");

    if(countElement && count !== undefined){
        countElement.textContent =
        String(count);
    }

    if(statusElement && status){
        statusElement.textContent =
        status;
    }

}

async function loadViewerCounter(){

    const countElement =
    document.getElementById("viewer-count");

    if(!countElement){
        return;
    }

    if(!viewerCounterApiUrl){
        loadViewerCounterFromCsv();
        return;
    }

    try{

        const data =
        await requestViewerCounterPayload();

        if(!data.success){
            throw new Error(data.message || "Viewer counter unavailable");
        }

        updateViewerCounter(
            data.uniqueViewers ?? data.count ?? "--",
            "Live unique count from Google Sheets."
        );

    }

    catch(error){

        console.error(error);

        updateViewerCounter(
            "Offline",
            "Viewer counter could not be reached."
        );

    }

}

async function loadViewerCounterFromCsv(){

    if(!viewerCounterCsvUrl){
        updateViewerCounter("Ready", "Paste your Apps Script web app URL in script.js to start counting.");
        return;
    }

    try{

        const response =
        await fetch(viewerCounterCsvUrl, {
            cache:"no-store"
        });

        const csv =
        await response.text();

        const rows =
        parseCSV(csv)
        .filter(row => row.some(cell => String(cell || "").trim()));

        const uniqueViewers =
        Math.max(rows.length - 1, 0);

        updateViewerCounter(
            uniqueViewers,
            "Showing the published Google Sheet count. Add the Apps Script web app URL to record new viewers."
        );

    }

    catch(error){

        console.error(error);

        updateViewerCounter(
            "Ready",
            "Paste your Apps Script web app URL in script.js to start counting."
        );

    }

}

function requestViewerCounterPayload(){

    return new Promise((resolve, reject) => {

        const callbackName =
        `__jwmhsViewerCounter${Date.now()}${Math.random().toString(16).slice(2)}`;

        const url =
        new URL(viewerCounterApiUrl);

        url.searchParams.set("action", "trackViewer");
        url.searchParams.set("visitorId", getViewerId());
        url.searchParams.set("path", window.location.pathname || "/");
        url.searchParams.set("page", document.title || "Mitchell Class of 2028");
        url.searchParams.set("referrer", document.referrer || "");
        url.searchParams.set("userAgent", navigator.userAgent || "");
        url.searchParams.set("callback", callbackName);

        const script =
        document.createElement("script");

        const cleanup = () => {

            delete window[callbackName];
            script.remove();

        };

        const timeoutId =
        window.setTimeout(() => {
            cleanup();
            reject(new Error("Viewer counter timed out"));
        }, 8000);

        window[callbackName] = (data) => {
            window.clearTimeout(timeoutId);
            cleanup();
            resolve(data);
        };

        script.onerror = () => {
            window.clearTimeout(timeoutId);
            cleanup();
            reject(new Error("Viewer counter failed to load"));
        };

        script.src =
        url.toString();

        document.head.appendChild(script);

    });

}

/* =========================
   LIVE UPDATES
========================= */

async function loadUpdates(){

    const container =
    document.getElementById("events-container");

    if(!container){
        return;
    }

    try{

        const response =
        await fetch(updatesSheetUrl);

        const csv =
        await response.text();

        const rows =
        parseCSV(csv);

        container.innerHTML = "";

        rows.forEach((row) => {

            if(row.length === 0){
                return;
            }

            const title =
            row[0] || "";

            const description =
            row[1] || "";

            const image =
            row[2] || "";

            if(title){

                container.innerHTML += `

                <div class="event-card fade-up">

                    ${image ? `
                    <img
                    src="${escapeHTML(image)}"
                    class="update-image"
                    alt="${escapeHTML(title)}">
                    ` : ""}

                    <h3>${escapeHTML(title)}</h3>

                    <p>${escapeHTML(description)}</p>

                </div>

                `;

            }

        });

        document.querySelectorAll(".fade-up")
        .forEach((el) => observer.observe(el));

    }

    catch(error){

        console.error(error);

        container.innerHTML = `

        <div class="event-card">
            <h3>Unable To Load Updates</h3>
            <p>Please try again later.</p>
        </div>

        `;

    }

}

/* =========================
   HERO COUNTDOWN
========================= */

let heroCountdownTarget = null;
let heroCountdownInterval = null;

async function loadHeroCountdown(){

    const card =
    document.getElementById("hero-countdown-card");

    const labelEl =
    document.getElementById("hero-countdown-label");

    const titleEl =
    document.getElementById("hero-countdown-title");

    const buttonEl =
    document.getElementById("hero-countdown-button");

    const dateLabelEl =
    document.getElementById("hero-countdown-date-label");

    if(!card || !labelEl || !titleEl || !buttonEl || !dateLabelEl){
        return;
    }

    try{

        const response =
        await fetch(heroCountdownSheetUrl);

        const csv =
        await response.text();

        const rows =
        parseCSV(csv).slice(1);

        const countdown =
        rows.find(row => row[0] && row[2]);

        if(!countdown){
            throw new Error("No countdown found");
        }

        const title =
        countdown[0] || "Countdown";

        const description =
        countdown[1] || "Let the countdown begin!";

        const targetDateTime =
        countdown[2] || "";

        const dateLabel =
        countdown[3] || "";

        const buttonText =
        countdown[4] || "";

        const buttonLink =
        countdown[5] || "";

        heroCountdownTarget =
        new Date(targetDateTime);

        if(Number.isNaN(heroCountdownTarget.getTime())){
            throw new Error("Invalid countdown date");
        }

        labelEl.textContent =
        title;

        titleEl.textContent =
        description;

        dateLabelEl.textContent =
        dateLabel || formatHeroCountdownDate(heroCountdownTarget);

        const hasButton =
        buttonText.trim() && buttonLink.trim();

        if(hasButton){

            buttonEl.textContent =
            buttonText;

            buttonEl.href =
            safeUrl(buttonLink);

            buttonEl.style.display =
            "inline-flex";

        }

        else{

            buttonEl.style.display =
            "none";

        }

        updateHeroCountdown();

        if(heroCountdownInterval){
            clearInterval(heroCountdownInterval);
        }

        heroCountdownInterval =
        setInterval(updateHeroCountdown, 1000);

    }

    catch(error){

        console.error(error);

        labelEl.textContent =
        "Countdown Unavailable";

        titleEl.textContent =
        "Countdown could not be loaded.";

        dateLabelEl.textContent =
        "Check back soon.";

        buttonEl.style.display =
        "none";

        setHeroCountdownValues(0, 0, 0, 0);

    }

}

function updateHeroCountdown(){

    if(!heroCountdownTarget){
        return;
    }

    const now =
    new Date();

    const difference =
    heroCountdownTarget.getTime() - now.getTime();

    if(difference <= 0){

        setHeroCountdownValues(0, 0, 0, 0);

        const titleEl =
        document.getElementById("hero-countdown-title");

        if(titleEl){
            titleEl.textContent =
            "The countdown is over!";
        }

        return;

    }

    const days =
    Math.floor(difference / (1000 * 60 * 60 * 24));

    const hours =
    Math.floor((difference / (1000 * 60 * 60)) % 24);

    const minutes =
    Math.floor((difference / (1000 * 60)) % 60);

    const seconds =
    Math.floor((difference / 1000) % 60);

    setHeroCountdownValues(days, hours, minutes, seconds);

}

function setHeroCountdownValues(days, hours, minutes, seconds){

    const daysEl =
    document.getElementById("hero-countdown-days");

    const hoursEl =
    document.getElementById("hero-countdown-hours");

    const minutesEl =
    document.getElementById("hero-countdown-minutes");

    const secondsEl =
    document.getElementById("hero-countdown-seconds");

    if(daysEl){
        daysEl.textContent =
        String(days).padStart(2, "0");
    }

    if(hoursEl){
        hoursEl.textContent =
        String(hours).padStart(2, "0");
    }

    if(minutesEl){
        minutesEl.textContent =
        String(minutes).padStart(2, "0");
    }

    if(secondsEl){
        secondsEl.textContent =
        String(seconds).padStart(2, "0");
    }

}

function formatHeroCountdownDate(date){

    return date.toLocaleString("en-US", {
        timeZone:"America/New_York",
        month:"long",
        day:"numeric",
        year:"numeric",
        hour:"numeric",
        minute:"2-digit"
    });

}

/* =========================
   WEEKLY HAPPENINGS
========================= */

async function loadWeeklyHappenings(){

    const container =
    document.getElementById("weekly-happenings-container");

    if(!container){
        return;
    }

    try{

        const response =
        await fetch(weeklyHappeningsSheetUrl);

        const csv =
        await response.text();

        const rows =
        parseCSV(csv).slice(1);

        const happenings =
        rows
        .filter(row => row[0] || row[1] || row[2])
        .map(row => {
            return {
                title:row[0] || "Untitled Update",
                date:row[1] || "",
                description:row[2] || "",
                tag:row[3] || ""
            };
        });

        if(happenings.length === 0){
            throw new Error("No weekly happenings found");
        }

        container.innerHTML =
        happenings.slice(0, 5).map(item => {

            const dateParts =
            formatWeeklyDate(item.date);

            return `

            <div class="weekly-item">

                <div class="weekly-date">
                    <span>${escapeHTML(dateParts.top)}</span>
                    <strong>${escapeHTML(dateParts.bottom)}</strong>
                </div>

                <div class="weekly-main">
                    <h4>${escapeHTML(item.title)}</h4>
                    <p>${escapeHTML(item.description)}</p>
                </div>

                <div class="weekly-tag">
                    ${escapeHTML(item.tag)}
                </div>

            </div>

            `;

        }).join("");

    }

    catch(error){

        console.error(error);

        container.innerHTML = `

        <div class="dashboard-loading">
            Weekly happenings could not be loaded.
        </div>

        `;

    }

}

function formatWeeklyDate(dateText){

    const raw =
    String(dateText || "").trim();

    if(!raw){
        return {
            top:"DATE",
            bottom:"TBD"
        };
    }

    const parsedDate =
    new Date(raw);

    if(!Number.isNaN(parsedDate.getTime())){

        return {
            top:parsedDate.toLocaleDateString("en-US", {
                weekday:"short"
            }).toUpperCase(),
            bottom:parsedDate.toLocaleDateString("en-US", {
                month:"short",
                day:"numeric"
            }).toUpperCase()
        };

    }

    const parts =
    raw.split(" ");

    if(parts.length >= 2){

        return {
            top:parts[0].toUpperCase(),
            bottom:parts.slice(1).join(" ").toUpperCase()
        };

    }

    return {
        top:"DATE",
        bottom:raw.toUpperCase()
    };

}

/* =========================
   QUICK LINKS
========================= */

async function loadQuickLinks(){

    const container =
    document.getElementById("quick-links-container");

    if(!container){
        return;
    }

    try{

        const response =
        await fetch(quickLinksSheetUrl);

        const csv =
        await response.text();

        const rows =
        parseCSV(csv).slice(1);

        const links =
        rows
        .filter(row => row[0] && row[2])
        .map(row => {
            return {
                title:row[0] || "Link",
                description:row[1] || "",
                link:row[2] || "#",
                icon:row[3] || "🔗"
            };
        });

        if(links.length === 0){
            throw new Error("No quick links found");
        }

        container.innerHTML =
        links.slice(0, 8).map(link => {

            const isExternal =
            String(link.link).startsWith("http");

            return `

            <a
            href="${safeUrl(link.link)}"
            class="quick-link-tile"
            ${isExternal ? `target="_blank" rel="noopener noreferrer"` : ""}>

                <span>${escapeHTML(link.icon)}</span>

                <strong>${escapeHTML(link.title)}</strong>

                ${link.description ? `
                <small>${escapeHTML(link.description)}</small>
                ` : ""}

            </a>

            `;

        }).join("");

    }

    catch(error){

        console.error(error);

        container.innerHTML = `

        <div class="dashboard-loading">
            Quick links could not be loaded.
        </div>

        `;

    }

}

/* =========================
   COUNCIL PROJECTS
========================= */

async function loadCouncilProjects(){

    const container =
    document.getElementById("projects-container");

    if(!container){
        return;
    }

    try{

        const response =
        await fetch(councilProjectsSheetUrl);

        const csv =
        await response.text();

        const rows =
        parseCSV(csv).slice(1);

        const projects =
        rows
        .filter(row => row[0])
        .map(row => {
            return {
                project:row[0] || "Untitled Project",
                status:row[1] || "Planning",
                description:row[2] || "",
                priority:row[3] || ""
            };
        });

        if(projects.length === 0){
            throw new Error("No projects found");
        }

        container.innerHTML =
        projects.slice(0, 6).map(project => {

            return `

            <div class="project-row">

                <div class="project-info">

                    <h4>${escapeHTML(project.project)}</h4>

                    <p>
                        ${escapeHTML(project.description)}
                        ${project.priority ? ` · ${escapeHTML(project.priority)} Priority` : ""}
                    </p>

                </div>

                <span class="project-status ${getStatusClass(project.status)}">
                    ${escapeHTML(project.status)}
                </span>

            </div>

            `;

        }).join("");

    }

    catch(error){

        console.error(error);

        container.innerHTML = `

        <div class="dashboard-loading">
            Council projects could not be loaded.
        </div>

        `;

    }

}

function getStatusClass(status){

    const normalized =
    String(status || "")
    .toLowerCase()
    .trim()
    .replaceAll("&", "and")
    .replaceAll("/", " ")
    .replaceAll(" ", "-");

    if(normalized.includes("planning")){
        return "status-planning";
    }

    if(normalized.includes("progress")){
        return "status-in-progress";
    }

    if(normalized.includes("feedback")){
        return "status-collecting-feedback";
    }

    if(normalized.includes("completed") || normalized.includes("done")){
        return "status-completed";
    }

    if(normalized.includes("paused") || normalized.includes("hold")){
        return "status-paused";
    }

    return "status-default";

}

/* =========================
   BELL SCHEDULE
========================= */

let allBellSchedules = {};
let selectedBellScheduleName = "";

async function loadBellSchedule(){

    const select =
    document.getElementById("bell-schedule-select");

    const container =
    document.getElementById("bell-schedule-container");

    if(!select || !container){
        return;
    }

    try{

        const response =
        await fetch(bellScheduleSheetUrl);

        const csv =
        await response.text();

        const rows =
        parseCSV(csv).slice(1);

        allBellSchedules =
        buildBellScheduleData(rows);

        const scheduleNames =
        Object.keys(allBellSchedules);

        if(scheduleNames.length === 0){
            throw new Error("No bell schedules found");
        }

        select.innerHTML =
        scheduleNames.map((scheduleName) => {
            return `
            <option value="${escapeHTML(scheduleName)}">
                ${escapeHTML(scheduleName)}
            </option>
            `;
        }).join("");

        selectedBellScheduleName =
        scheduleNames[0];

        select.value =
        selectedBellScheduleName;

        renderBellSchedule(selectedBellScheduleName);
        renderBellLunchTimes(selectedBellScheduleName);
        renderDesignatedLunches(selectedBellScheduleName);

    }

    catch(error){

        console.error(error);

        select.innerHTML = `
        <option value="">Schedule unavailable</option>
        `;

        container.innerHTML = `

        <div class="dashboard-loading">
            Bell schedule could not be loaded.
        </div>

        `;

        const lunchContainer =
        document.getElementById("designated-lunches-container");

        if(lunchContainer){
            lunchContainer.innerHTML = `

            <div class="dashboard-loading">
                Designated lunches could not be loaded.
            </div>

            `;
        }

        const lunchTimesContainer =
        document.getElementById("bell-lunch-times-container");

        if(lunchTimesContainer){
            lunchTimesContainer.innerHTML = `

            <div class="dashboard-loading">
                Lunch times could not be loaded.
            </div>

            `;
        }

    }

}

function buildBellScheduleData(rows){

    const schedules = {};
    const lastPeriodBySchedule = {};
    const headers =
    rows[0] || [];

    const hasHeaderRow =
    headers.some(header => normalizeSheetHeader(header) === "schedulename")
    || headers.some(header => normalizeSheetHeader(header) === "period");

    const dataRows =
    hasHeaderRow ? rows.slice(1) : rows;

    const scheduleIndex =
    hasHeaderRow
    ? getSheetColumnIndex(headers, ["ScheduleName", "Schedule Name", "Schedule"], 0)
    : 0;

    const periodIndex =
    hasHeaderRow
    ? getSheetColumnIndex(headers, ["Period"], 1)
    : 1;

    const startIndex =
    hasHeaderRow
    ? getSheetColumnIndex(headers, ["StartTime", "Start Time"], 2)
    : 2;

    const endIndex =
    hasHeaderRow
    ? getSheetColumnIndex(headers, ["EndTime", "End Time"], 3)
    : 3;

    const notesIndex =
    hasHeaderRow
    ? getSheetColumnIndex(headers, ["Notes"], 4)
    : 4;

    const lunchGroupIndex =
    hasHeaderRow
    ? getSheetColumnIndex(headers, ["LunchGroup", "Lunch Group"], 5)
    : 5;

    const lunchStartIndex =
    hasHeaderRow
    ? getSheetColumnIndex(headers, ["LunchStart", "Lunch Start"], 6)
    : 6;

    const lunchEndIndex =
    hasHeaderRow
    ? getSheetColumnIndex(headers, ["LunchEnd", "Lunch End"], 7)
    : 7;

    const lunchRoomsIndex =
    hasHeaderRow
    ? getSheetColumnIndex(headers, ["LunchRooms", "Lunch Rooms"], 8)
    : 8;

    let lastScheduleName =
    "Regular Bell Schedule";

    dataRows.forEach((row) => {

        const rawScheduleName =
        String(getSheetCell(row, scheduleIndex) || "").trim();

        const scheduleName =
        rawScheduleName || lastScheduleName || "Regular Bell Schedule";

        if(rawScheduleName){
            lastScheduleName =
            rawScheduleName;
        }

        const period =
        getSheetCell(row, periodIndex) || "";

        const startTime =
        getSheetCell(row, startIndex) || "";

        const endTime =
        getSheetCell(row, endIndex) || "";

        const notes =
        getSheetCell(row, notesIndex) || "";

        const lunchGroup =
        getSheetCell(row, lunchGroupIndex) || "";

        const lunchStart =
        getSheetCell(row, lunchStartIndex) || "";

        const lunchEnd =
        getSheetCell(row, lunchEndIndex) || "";

        const lunchRooms =
        getSheetCell(row, lunchRoomsIndex) || "";

        const hasPeriodDetails =
        period || startTime || endTime || notes;

        const hasLunchDetails =
        lunchGroup || lunchStart || lunchEnd || lunchRooms;

        if(!hasPeriodDetails && !hasLunchDetails){
            return;
        }

        if(!schedules[scheduleName]){
            schedules[scheduleName] = [];
        }

        let existingPeriod =
        null;

        const periodKey =
        hasPeriodDetails
        ? `${period}|${startTime}|${endTime}|${notes}`
        : "__designated_lunches__";

        if(!hasPeriodDetails && hasLunchDetails){

            existingPeriod =
            findLunchHostPeriod(
                schedules[scheduleName],
                lunchStart,
                lunchEnd
            )
            || lastPeriodBySchedule[scheduleName]
            || null;

        }

        if(!existingPeriod){

            existingPeriod =
            schedules[scheduleName].find(item => item.key === periodKey);

        }

        if(!existingPeriod){

            existingPeriod = {
                key:periodKey,
                period:period || "Lunch",
                startTime:startTime,
                endTime:endTime,
                notes:notes,
                lunchOnly:!hasPeriodDetails,
                lunches:[]
            };

            schedules[scheduleName].push(existingPeriod);

        }

        if(hasPeriodDetails){
            lastPeriodBySchedule[scheduleName] =
            existingPeriod;
        }

        if(hasLunchDetails){

            addLunchToPeriod(existingPeriod, {
                group:lunchGroup || "Lunch",
                start:lunchStart || "",
                end:lunchEnd || "",
                rooms:lunchRooms || ""
            });

        }

    });

    Object.keys(schedules).forEach((scheduleName) => {
        mergeOrphanLunchPeriods(schedules[scheduleName]);
    });

    return schedules;

}

function mergeOrphanLunchPeriods(periods){

    let previousPeriod =
    null;

    periods.forEach((period) => {

        if(!period.lunchOnly){
            previousPeriod =
            period;
            return;
        }

        period.lunches.forEach((lunch) => {

            const hostPeriod =
            findLunchHostPeriod(
                periods,
                lunch.start,
                lunch.end
            )
            || previousPeriod;

            if(hostPeriod){
                addLunchToPeriod(hostPeriod, lunch);
            }

        });

    });

}

function parseBellTimeToMinutes(value){

    const text =
    String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

    const match =
    text.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/);

    if(!match){
        return null;
    }

    let hours =
    Number(match[1]);

    const minutes =
    Number(match[2] || 0);

    const meridiem =
    match[3];

    if(meridiem === "pm" && hours !== 12){
        hours += 12;
    }

    if(meridiem === "am" && hours === 12){
        hours = 0;
    }

    return (hours * 60) + minutes;

}

function rangesOverlap(startA, endA, startB, endB){

    if(
        startA === null
        || endA === null
        || startB === null
        || endB === null
    ){
        return false;
    }

    return startA < endB && endA > startB;

}

function findLunchHostPeriod(periods, lunchStart, lunchEnd){

    const lunchStartMinutes =
    parseBellTimeToMinutes(lunchStart);

    const lunchEndMinutes =
    parseBellTimeToMinutes(lunchEnd);

    if(lunchStartMinutes === null || lunchEndMinutes === null){
        return null;
    }

    return periods.find((period) => {

        if(period.lunchOnly){
            return false;
        }

        const periodStart =
        parseBellTimeToMinutes(period.startTime);

        const periodEnd =
        parseBellTimeToMinutes(period.endTime);

        return rangesOverlap(
            lunchStartMinutes,
            lunchEndMinutes,
            periodStart,
            periodEnd
        );

    }) || null;

}

function addLunchToPeriod(period, lunch){

    const key =
    [
        lunch.group || "",
        lunch.start || "",
        lunch.end || "",
        lunch.rooms || ""
    ].join("|");

    const exists =
    period.lunches.some((existingLunch) => {
        return [
            existingLunch.group || "",
            existingLunch.start || "",
            existingLunch.end || "",
            existingLunch.rooms || ""
        ].join("|") === key;
    });

    if(!exists){
        period.lunches.push(lunch);
    }

}

function renderBellSchedule(scheduleName){

    const container =
    document.getElementById("bell-schedule-container");

    if(!container){
        return;
    }

    const periods =
    (allBellSchedules[scheduleName] || [])
    .filter(period => !period.lunchOnly);

    if(periods.length === 0){

        container.innerHTML = `

        <div class="dashboard-loading">
            No periods found for this schedule.
        </div>

        `;

        return;

    }

    container.innerHTML =
    periods.map(period => {

        return `

        <div class="bell-period-row">

            <div class="bell-period-main">

                <h4>${escapeHTML(period.period)}</h4>

                <p>
                    ${escapeHTML(formatTimeRange(period.startTime, period.endTime))}
                </p>

            </div>

            ${period.notes ? `
            <div class="bell-note">
                ${escapeHTML(period.notes)}
            </div>
            ` : ""}

            ${period.lunches.length > 0 ? `
            <div class="bell-period-lunches">

                ${period.lunches.map(lunch => `

                    <div class="bell-period-lunch-row">
                        <strong>${escapeHTML(lunch.group || "Lunch")}</strong>
                        <span>${escapeHTML(formatTimeRange(lunch.start, lunch.end))}</span>
                        ${lunch.rooms ? `
                        <small>${escapeHTML(lunch.rooms)}</small>
                        ` : ""}
                    </div>

                `).join("")}

            </div>
            ` : ""}

        </div>

        `;

    }).join("");

}

function getDesignatedLunches(scheduleName){

    const periods =
    allBellSchedules[scheduleName] || [];

    const seenLunches =
    new Set();

    return periods.flatMap(period => {

        return period.lunches.map(lunch => {
            return {
                period:period.lunchOnly ? "" : period.period,
                group:lunch.group,
                time:formatTimeRange(lunch.start, lunch.end),
                rooms:lunch.rooms
            };
        });

    })
    .filter(lunch => {

        const key =
        `${lunch.period}|${lunch.group}|${lunch.time}|${lunch.rooms}`;

        if(seenLunches.has(key)){
            return false;
        }

        seenLunches.add(key);

        return lunch.group || lunch.time !== "Time TBD" || lunch.rooms;

    });

}

function renderBellLunchTimes(scheduleName){

    const container =
    document.getElementById("bell-lunch-times-container");

    if(!container){
        return;
    }

    container.innerHTML = "";
    container.hidden = true;

}

function renderDesignatedLunches(scheduleName){

    const container =
    document.getElementById("designated-lunches-container");

    if(!container){
        return;
    }

    const lunches =
    getDesignatedLunches(scheduleName);

    if(lunches.length === 0){

        container.innerHTML = `

        <div class="dashboard-loading">
            No designated lunches listed for this schedule.
        </div>

        `;

        return;

    }

    container.innerHTML =
    lunches.map(lunch => {

        return `

        <div class="designated-lunch-row">

            <div class="designated-lunch-top">
                <strong>${escapeHTML(lunch.group || "Lunch")}</strong>
            </div>

            ${lunch.period ? `
            <p>${escapeHTML(lunch.period)}</p>
            ` : ""}

            ${lunch.rooms ? `
            <small>${escapeHTML(lunch.rooms)}</small>
            ` : ""}

        </div>

        `;

    }).join("");

}

function formatTimeRange(start, end){

    if(start && end){
        return `${start} – ${end}`;
    }

    if(start){
        return start;
    }

    if(end){
        return end;
    }

    return "Time TBD";

}

const bellScheduleSelect =
document.getElementById("bell-schedule-select");

if(bellScheduleSelect){

    bellScheduleSelect.addEventListener("change", () => {

        selectedBellScheduleName =
        bellScheduleSelect.value;

        renderBellSchedule(selectedBellScheduleName);
        renderBellLunchTimes(selectedBellScheduleName);
        renderDesignatedLunches(selectedBellScheduleName);

    });

}

/* =========================
   FAQ
========================= */

async function loadFAQ(){

    const container =
    document.getElementById("faq-container");

    if(!container){
        return;
    }

    try{

        const response =
        await fetch(faqSheetUrl);

        const csv =
        await response.text();

        const rows =
        parseCSV(csv).slice(1);

        const faqs =
        rows
        .filter(row => row[0] && row[1])
        .map(row => {
            return {
                question:row[0] || "",
                answer:row[1] || ""
            };
        });

        if(faqs.length === 0){
            throw new Error("No FAQs found");
        }

        container.innerHTML =
        faqs.slice(0, 6).map((faq, index) => {

            return `

            <div class="faq-item ${index === 0 ? "open" : ""}">

                <button class="faq-question" type="button">

                    ${escapeHTML(faq.question)}

                    <span>⌄</span>

                </button>

                <div class="faq-answer">
                    ${escapeHTML(faq.answer)}
                </div>

            </div>

            `;

        }).join("");

        attachFAQListeners();

    }

    catch(error){

        console.error(error);

        container.innerHTML = `

        <div class="dashboard-loading">
            FAQs could not be loaded.
        </div>

        `;

    }

}

function attachFAQListeners(){

    const faqQuestions =
    document.querySelectorAll(".faq-question");

    faqQuestions.forEach((question) => {

        question.addEventListener("click", () => {

            const item =
            question.closest(".faq-item");

            if(!item){
                return;
            }

            item.classList.toggle("open");

        });

    });

}

/* =========================
   STUDENT GUIDE COURSES
========================= */

const courseList =
document.getElementById("course-list");

const courseDetailPanel =
document.getElementById("course-detail-panel");

const typeFilter =
document.getElementById("course-type-filter");

const departmentFilter =
document.getElementById("course-department-filter");

const gradeFilter =
document.getElementById("course-grade-filter");

const courseSearchInput =
document.getElementById("course-search-input");

const guideTabs =
document.querySelectorAll(".guide-tab");

const guidePanels =
document.querySelectorAll(".guide-panel");

let allCourses = [];
let selectedCourseIndex = 0;

async function loadStudentGuideCourses(){

    if(!courseList || !courseDetailPanel){
        return;
    }

    try{

        const response =
        await fetch(courseSheetUrl);

        const csv =
        await response.text();

        const rows =
        parseCSV(csv).slice(1);

        allCourses = rows
        .filter(row => row.length >= 2 && row[1])
        .map((row, index) => {

            return {
                originalIndex:index,
                type:row[0] || "Other",
                title:row[1] || "Untitled Course",
                description:row[2] || "No description available yet.",
                rating:row[3] || "4.3/5",
                reviews:row[4] || "Student reviews",
                extraInfo:row[5] || "",
                department:row[6] || getDepartmentFromCourse(row[1] || "", row[0] || ""),
                gradeLevel:row[7] || "Not listed",
                prerequisites:row[8] || "None listed",
                credits:row[9] || "Not listed",
                topics:row[10] || ""
            };

        });

        populateGuideFilters();
        renderCourseList();

        if(allCourses.length > 0){
            renderCourseDetails(allCourses[0]);
        }

    }

    catch(error){

        console.error(error);

        courseList.innerHTML = `

        <div class="course-list-card">
            <div class="course-list-main">
                <h3>Unable To Load Courses</h3>
                <p>Please try again later.</p>
            </div>
        </div>

        `;

        courseDetailPanel.innerHTML = `

        <div class="coming-soon-card">
            <h3>Courses Unavailable</h3>
            <p>The course guide could not be loaded.</p>
        </div>

        `;

    }

}

function getDepartmentFromCourse(courseName, type){

    const name =
    courseName.toLowerCase();

    if(name.includes("english") || name.includes("writing") || name.includes("journalism") || name.includes("literature")){
        return "English";
    }

    if(name.includes("algebra") || name.includes("geometry") || name.includes("calculus") || name.includes("statistics") || name.includes("math") || name.includes("trigonometry")){
        return "Math";
    }

    if(name.includes("science") || name.includes("biology") || name.includes("chemistry") || name.includes("marine") || name.includes("anatomy") || name.includes("forensic") || name.includes("earth")){
        return "Science";
    }

    if(name.includes("history") || name.includes("government") || name.includes("economics") || name.includes("psychology") || name.includes("geography") || name.includes("law")){
        return "Social Studies";
    }

    if(name.includes("spanish")){
        return "World Languages";
    }

    if(name.includes("art") || name.includes("band") || name.includes("chorus") || name.includes("orchestra") || name.includes("music") || name.includes("photo") || name.includes("design") || name.includes("video")){
        return "Fine Arts";
    }

    if(name.includes("computer") || name.includes("digital") || name.includes("technology")){
        return "Technology";
    }

    if(name.includes("business") || name.includes("accounting") || name.includes("finance")){
        return "Business";
    }

    if(name.includes("healthcare") || name.includes("patient") || name.includes("medical")){
        return "Medical";
    }

    if(name.includes("hope") || name.includes("sports") || name.includes("training") || name.includes("basketball") || name.includes("tennis") || name.includes("volleyball")){
        return "Physical Education";
    }

    if(type === "NJROTC"){
        return "NJROTC";
    }

    return "Other";

}

function populateGuideFilters(){

    populateSelect(typeFilter, [
        "All",
        ...new Set(allCourses.map(course => course.type))
    ]);

    populateSelect(departmentFilter, [
        "All",
        ...new Set(allCourses.map(course => course.department))
    ]);

    populateSelect(gradeFilter, [
        "All",
        ...new Set(allCourses.map(course => course.gradeLevel))
    ]);

}

function populateSelect(select, options){

    if(!select){
        return;
    }

    select.innerHTML = "";

    options.forEach((optionText) => {

        const option =
        document.createElement("option");

        option.value =
        optionText;

        option.textContent =
        optionText === "All"
        ? select.id.includes("type")
            ? "All Types"
            : select.id.includes("department")
                ? "All Departments"
                : "All Grades"
        : optionText;

        select.appendChild(option);

    });

}

function getFilteredCourses(){

    const searchTerm =
    courseSearchInput
    ? courseSearchInput.value.toLowerCase().trim()
    : "";

    return allCourses.filter((course) => {

        const matchesType =
        typeFilter.value === "All"
        || course.type === typeFilter.value;

        const matchesDepartment =
        departmentFilter.value === "All"
        || course.department === departmentFilter.value;

        const matchesGrade =
        gradeFilter.value === "All"
        || course.gradeLevel === gradeFilter.value;

        const searchableText =
        `
        ${course.type}
        ${course.title}
        ${course.description}
        ${course.rating}
        ${course.reviews}
        ${course.extraInfo}
        ${course.department}
        ${course.gradeLevel}
        ${course.prerequisites}
        ${course.credits}
        ${course.topics}
        `.toLowerCase();

        return searchableText.includes(searchTerm)
        && matchesType
        && matchesDepartment
        && matchesGrade;

    });

}

function renderCourseList(){

    const filteredCourses =
    getFilteredCourses();

    courseList.innerHTML = "";

    if(filteredCourses.length === 0){

        courseList.innerHTML = `

        <div class="course-list-card">
            <div class="course-list-main">
                <h3>No Courses Found</h3>
                <p>Try changing the filters or search term.</p>
            </div>
        </div>

        `;

        courseDetailPanel.innerHTML = `

        <div class="coming-soon-card">
            <h3>No Course Selected</h3>
            <p>Select a course to view more information.</p>
        </div>

        `;

        return;

    }

    filteredCourses.forEach((course) => {

        const card =
        document.createElement("div");

        card.className =
        `course-list-card ${course.originalIndex === selectedCourseIndex ? "active" : ""}`;

        card.innerHTML = `

            <div class="course-icon">
                ${getCourseIcon(course.department)}
            </div>

            <div class="course-list-main">

                <h3>${escapeHTML(course.title)}</h3>

                <div class="course-tags">
                    <span class="course-tag">${escapeHTML(course.type)}</span>
                    <span class="course-tag">${escapeHTML(course.department)}</span>
                </div>

            </div>

            <div class="course-grade">
                Grades: ${escapeHTML(course.gradeLevel)}
            </div>

            <div class="course-rating-small">
                ${escapeHTML(formatRating(course.rating))}${isNumericRating(course.rating) ? " ★" : ""}
                <span>${escapeHTML(course.reviews)}</span>
            </div>

        `;

        card.addEventListener("click", () => {

            selectedCourseIndex =
            course.originalIndex;

            renderCourseList();
            renderCourseDetails(course);

        });

        courseList.appendChild(card);

    });

}

function renderCourseDetails(course){

    const topics =
    course.topics
    ? course.topics.split(",").map(topic => topic.trim()).filter(Boolean)
    : generateTopics(course);

    courseDetailPanel.innerHTML = `

        <div class="detail-top">

            <div class="detail-title-wrap">

                <div class="course-icon">
                    ${getCourseIcon(course.department)}
                </div>

                <div>
                    <h3>${escapeHTML(course.title)}</h3>

                    <div class="course-tags">
                        <span class="course-tag">${escapeHTML(course.type)}</span>
                        <span class="course-tag">${escapeHTML(course.department)}</span>
                    </div>
                </div>

            </div>

            <div class="detail-rating">
                ${escapeHTML(formatRating(course.rating))}${isNumericRating(course.rating) ? " ★" : ""}
                <span>${escapeHTML(course.reviews)}</span>
            </div>

        </div>

        <p class="detail-description">
            ${escapeHTML(course.description)}
        </p>

        <div class="detail-info-grid">

            <div class="detail-info-item">
                <span>📅</span>
                <strong>Grade Level</strong>
                <p>${escapeHTML(course.gradeLevel)}</p>
            </div>

            <div class="detail-info-item">
                <span>📌</span>
                <strong>Prerequisites</strong>
                <p>${escapeHTML(course.prerequisites)}</p>
            </div>

            <div class="detail-info-item">
                <span>📚</span>
                <strong>Credits</strong>
                <p>${escapeHTML(course.credits)}</p>
            </div>

            <div class="detail-info-item">
                <span>🏛️</span>
                <strong>Department</strong>
                <p>${escapeHTML(course.department)}</p>
            </div>

        </div>

        <div class="detail-topics">

            <h4>Topics Covered</h4>

            <div class="topic-list">

                ${topics.map(topic => `
                    <div class="topic-item">${escapeHTML(topic)}</div>
                `).join("")}

            </div>

        </div>

        <div class="rating-breakdown">

            <h4>Student Interest</h4>

            ${generateRatingBars(course.rating)}

        </div>

    `;

}

/* =========================
   STUDENT GUIDE CLUBS
========================= */

const clubList =
document.getElementById("club-list");

const clubDetailPanel =
document.getElementById("club-detail-panel");

const clubTypeFilter =
document.getElementById("club-type-filter");

const clubCategoryFilter =
document.getElementById("club-category-filter");

const clubGradeFilter =
document.getElementById("club-grade-filter");

const clubSearchInput =
document.getElementById("club-search-input");

let allClubs = [];
let selectedClubIndex = 0;

async function loadStudentGuideClubs(){

    if(!clubList || !clubDetailPanel){
        return;
    }

    try{

        const response =
        await fetch(clubsSheetUrl);

        const csv =
        await response.text();

        const rows =
        parseCSV(csv).slice(1);

        allClubs = rows
        .filter(row => row.length >= 2 && row[1])
        .map((row, index) => {

            return {
                originalIndex:index,
                type:row[0] || "Other",
                title:row[1] || "Untitled Club",
                description:row[2] || "No description available yet.",
                rating:row[3] || "Official",
                reviews:row[4] || "Student Group",
                extraInfo:row[5] || "",
                category:row[6] || "General",
                gradeLevel:row[7] || "Not listed",
                meetingTime:row[8] || "Not listed",
                sponsor:row[9] || "Not listed",
                topics:row[10] || ""
            };

        });

        populateClubFilters();
        renderClubList();

        if(allClubs.length > 0){
            renderClubDetails(allClubs[0]);
        }

    }

    catch(error){

        console.error(error);

        clubList.innerHTML = `

        <div class="course-list-card">
            <div class="course-list-main">
                <h3>Unable To Load Clubs</h3>
                <p>Please try again later.</p>
            </div>
        </div>

        `;

        clubDetailPanel.innerHTML = `

        <div class="coming-soon-card">
            <h3>Clubs Unavailable</h3>
            <p>The clubs guide could not be loaded.</p>
        </div>

        `;

    }

}

function populateClubFilters(){

    populateClubSelect(clubTypeFilter, [
        "All",
        ...new Set(allClubs.map(club => club.type))
    ]);

    populateClubSelect(clubCategoryFilter, [
        "All",
        ...new Set(allClubs.map(club => club.category))
    ]);

    populateClubSelect(clubGradeFilter, [
        "All",
        ...new Set(allClubs.map(club => club.gradeLevel))
    ]);

}

function populateClubSelect(select, options){

    if(!select){
        return;
    }

    select.innerHTML = "";

    options.forEach((optionText) => {

        const option =
        document.createElement("option");

        option.value =
        optionText;

        option.textContent =
        optionText === "All"
        ? select.id.includes("type")
            ? "All Types"
            : select.id.includes("category")
                ? "All Categories"
                : "All Grades"
        : optionText;

        select.appendChild(option);

    });

}

function getFilteredClubs(){

    const searchTerm =
    clubSearchInput
    ? clubSearchInput.value.toLowerCase().trim()
    : "";

    return allClubs.filter((club) => {

        const matchesType =
        clubTypeFilter.value === "All"
        || club.type === clubTypeFilter.value;

        const matchesCategory =
        clubCategoryFilter.value === "All"
        || club.category === clubCategoryFilter.value;

        const matchesGrade =
        clubGradeFilter.value === "All"
        || club.gradeLevel === clubGradeFilter.value;

        const searchableText =
        `
        ${club.type}
        ${club.title}
        ${club.description}
        ${club.rating}
        ${club.reviews}
        ${club.extraInfo}
        ${club.category}
        ${club.gradeLevel}
        ${club.meetingTime}
        ${club.sponsor}
        ${club.topics}
        `.toLowerCase();

        return searchableText.includes(searchTerm)
        && matchesType
        && matchesCategory
        && matchesGrade;

    });

}

function renderClubList(){

    const filteredClubs =
    getFilteredClubs();

    clubList.innerHTML = "";

    if(filteredClubs.length === 0){

        clubList.innerHTML = `

        <div class="course-list-card">
            <div class="course-list-main">
                <h3>No Clubs Found</h3>
                <p>Try changing the filters or search term.</p>
            </div>
        </div>

        `;

        clubDetailPanel.innerHTML = `

        <div class="coming-soon-card">
            <h3>No Club Selected</h3>
            <p>Select a club to view more information.</p>
        </div>

        `;

        return;

    }

    filteredClubs.forEach((club) => {

        const card =
        document.createElement("div");

        card.className =
        `course-list-card ${club.originalIndex === selectedClubIndex ? "active" : ""}`;

        card.innerHTML = `

            <div class="course-icon">
                ${getClubIcon(club.category)}
            </div>

            <div class="course-list-main">

                <h3>${escapeHTML(club.title)}</h3>

                <div class="course-tags">
                    <span class="course-tag">${escapeHTML(club.type)}</span>
                    <span class="course-tag">${escapeHTML(club.category)}</span>
                </div>

            </div>

            <div class="course-grade">
                Grades: ${escapeHTML(club.gradeLevel)}
            </div>

            <div class="course-rating-small">
                ${escapeHTML(formatRating(club.rating))}${isNumericRating(club.rating) ? " ★" : ""}
                <span>${escapeHTML(club.reviews)}</span>
            </div>

        `;

        card.addEventListener("click", () => {

            selectedClubIndex =
            club.originalIndex;

            renderClubList();
            renderClubDetails(club);

        });

        clubList.appendChild(card);

    });

}

function renderClubDetails(club){

    const topics =
    club.topics
    ? club.topics.split(",").map(topic => topic.trim()).filter(Boolean)
    : ["Leadership", "Community", "Activities", "Involvement"];

    clubDetailPanel.innerHTML = `

        <div class="detail-top">

            <div class="detail-title-wrap">

                <div class="course-icon">
                    ${getClubIcon(club.category)}
                </div>

                <div>
                    <h3>${escapeHTML(club.title)}</h3>

                    <div class="course-tags">
                        <span class="course-tag">${escapeHTML(club.type)}</span>
                        <span class="course-tag">${escapeHTML(club.category)}</span>
                    </div>
                </div>

            </div>

            <div class="detail-rating">
                ${escapeHTML(formatRating(club.rating))}${isNumericRating(club.rating) ? " ★" : ""}
                <span>${escapeHTML(club.reviews)}</span>
            </div>

        </div>

        <p class="detail-description">
            ${escapeHTML(club.description)}
        </p>

        <div class="detail-info-grid">

            <div class="detail-info-item">
                <span>📅</span>
                <strong>Grade Level</strong>
                <p>${escapeHTML(club.gradeLevel)}</p>
            </div>

            <div class="detail-info-item">
                <span>🕒</span>
                <strong>Meeting Time</strong>
                <p>${escapeHTML(club.meetingTime)}</p>
            </div>

            <div class="detail-info-item">
                <span>👤</span>
                <strong>Sponsor</strong>
                <p>${escapeHTML(club.sponsor)}</p>
            </div>

            <div class="detail-info-item">
                <span>🏷️</span>
                <strong>Category</strong>
                <p>${escapeHTML(club.category)}</p>
            </div>

        </div>

        <div class="detail-topics">

            <h4>Club Focus</h4>

            <div class="topic-list">

                ${topics.map(topic => `
                    <div class="topic-item">${escapeHTML(topic)}</div>
                `).join("")}

            </div>

        </div>

        <div class="rating-breakdown">

            <h4>Student Interest</h4>

            ${generateRatingBars(club.rating)}

        </div>

    `;

}

/* =========================
   STUDENT GUIDE HELPERS
========================= */

function formatRating(rating){

    return String(rating)
    .replace("/5", "")
    .trim();

}

function isNumericRating(rating){

    return !Number.isNaN(parseFloat(formatRating(rating)));

}

function generateRatingBars(rating){

    const numeric =
    parseFloat(formatRating(rating));

    if(Number.isNaN(numeric)){

        return `

        <div class="rating-row">

            <span>Info</span>

            <div class="rating-bar">
                <div class="rating-fill" style="width:100%"></div>
            </div>

            <span>✓</span>

        </div>

        `;

    }

    const five =
    Math.min(85, Math.max(45, Math.round(numeric * 14)));

    const four =
    Math.max(8, Math.round((5 - numeric) * 18));

    const three = 8;
    const two = 3;
    const one = 1;

    const rows = [
        ["5", five],
        ["4", four],
        ["3", three],
        ["2", two],
        ["1", one]
    ];

    return rows.map(row => `

        <div class="rating-row">

            <span>${row[0]} ★</span>

            <div class="rating-bar">
                <div class="rating-fill" style="width:${row[1]}%"></div>
            </div>

            <span>${row[1]}%</span>

        </div>

    `).join("");

}

function generateTopics(course){

    if(course.department === "English"){
        return ["Reading", "Writing", "Analysis", "Communication"];
    }

    if(course.department === "Math"){
        return ["Problem Solving", "Equations", "Functions", "Applications"];
    }

    if(course.department === "Science"){
        return ["Lab Skills", "Scientific Thinking", "Analysis", "Research"];
    }

    if(course.department === "Social Studies"){
        return ["History", "Government", "Culture", "Critical Thinking"];
    }

    if(course.department === "Fine Arts"){
        return ["Creativity", "Performance", "Design", "Technique"];
    }

    if(course.department === "Technology"){
        return ["Digital Skills", "Software", "Problem Solving", "Projects"];
    }

    return ["Course Skills", "Projects", "Participation", "Career Readiness"];

}

function getCourseIcon(department){

    if(department === "English") return "✎";
    if(department === "Math") return "∑";
    if(department === "Science") return "⚗";
    if(department === "Social Studies") return "🌐";
    if(department === "World Languages") return "🗣";
    if(department === "Fine Arts") return "🎨";
    if(department === "Technology") return "</>";
    if(department === "Business") return "$";
    if(department === "Medical") return "+";
    if(department === "Physical Education") return "🏃";
    if(department === "NJROTC") return "⚓";

    return "📘";

}

function getClubIcon(category){

    if(category === "Academic") return "🎓";
    if(category === "Science") return "⚗";
    if(category === "STEM") return "🤖";
    if(category === "Business") return "$";
    if(category === "Service") return "🤝";
    if(category === "Leadership") return "⭐";
    if(category === "Fine Arts") return "🎨";
    if(category === "Performing Arts") return "🎭";
    if(category === "Media") return "📰";
    if(category === "Medical") return "+";
    if(category === "Environment") return "🌱";
    if(category === "Culture") return "🌎";
    if(category === "Interest") return "♟";
    if(category === "Wellness") return "♡";
    if(category === "Civic") return "🏛";
    if(category === "Advocacy") return "📢";
    if(category === "World Languages") return "🗣";
    if(category === "Arts") return "✎";

    return "👥";

}

/* =========================
   STUDENT GUIDE LISTENERS
========================= */

[typeFilter, departmentFilter, gradeFilter].forEach((filter) => {

    if(!filter){
        return;
    }

    filter.addEventListener("change", () => {

        const filteredCourses =
        getFilteredCourses();

        if(filteredCourses.length > 0){
            selectedCourseIndex =
            filteredCourses[0].originalIndex;

            renderCourseDetails(filteredCourses[0]);
        }

        renderCourseList();

    });

});

if(courseSearchInput){

    courseSearchInput.addEventListener("input", () => {

        const filteredCourses =
        getFilteredCourses();

        if(filteredCourses.length > 0){
            selectedCourseIndex =
            filteredCourses[0].originalIndex;

            renderCourseDetails(filteredCourses[0]);
        }

        renderCourseList();

    });

}

[clubTypeFilter, clubCategoryFilter, clubGradeFilter].forEach((filter) => {

    if(!filter){
        return;
    }

    filter.addEventListener("change", () => {

        const filteredClubs =
        getFilteredClubs();

        if(filteredClubs.length > 0){
            selectedClubIndex =
            filteredClubs[0].originalIndex;

            renderClubDetails(filteredClubs[0]);
        }

        renderClubList();

    });

});

if(clubSearchInput){

    clubSearchInput.addEventListener("input", () => {

        const filteredClubs =
        getFilteredClubs();

        if(filteredClubs.length > 0){
            selectedClubIndex =
            filteredClubs[0].originalIndex;

            renderClubDetails(filteredClubs[0]);
        }

        renderClubList();

    });

}

guideTabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        const selectedTab =
        tab.dataset.guideTab;

        guideTabs.forEach((button) => {
            button.classList.remove("active");
        });

        guidePanels.forEach((panel) => {
            panel.classList.remove("active");
        });

        tab.classList.add("active");

        const panel =
        document.getElementById(`${selectedTab}-guide-panel`);

        if(panel){
            panel.classList.add("active");
        }

    });

});

/* =========================
   AP EXAM PREP RESOURCES
========================= */

function normalizeSheetHeader(header){

    return String(header || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

}

function getSheetColumnIndex(headers, names, fallbackIndex){

    const normalizedHeaders =
    headers.map(normalizeSheetHeader);

    const index =
    names
    .map(normalizeSheetHeader)
    .map(name => normalizedHeaders.indexOf(name))
    .find(foundIndex => foundIndex >= 0);

    return typeof index === "number" ? index : fallbackIndex;

}

function getSheetCell(row, index){

    if(index < 0){
        return "";
    }

    return row[index] || "";

}

async function loadExamPrepResources(){

    const container =
    document.getElementById("exam-prep-container");

    if(!container){
        return;
    }

    try{

        const response =
        await fetch(examPrepSheetUrl);

        const csv =
        await response.text();

        const sheetRows =
        parseCSV(csv);

        const headers =
        sheetRows[0] || [];

        const rows =
        sheetRows.slice(1);

        const subjectIndex =
        getSheetColumnIndex(headers, [
            "subject",
            "subjects",
            "course subject",
            "course",
            "class",
            "category"
        ], 0);

        const titleIndex =
        getSheetColumnIndex(headers, [
            "title",
            "resource",
            "resource title",
            "name"
        ], 1);

        const descriptionIndex =
        getSheetColumnIndex(headers, [
            "description",
            "details",
            "notes"
        ], 2);

        const linkIndex =
        getSheetColumnIndex(headers, [
            "link",
            "url",
            "resource link"
        ], 3);

        const iconIndex =
        getSheetColumnIndex(headers, [
            "icon",
            "emoji"
        ], 4);

        const typeIndex =
        getSheetColumnIndex(headers, [
            "type",
            "resource type",
            "format"
        ], 5);

        const resources =
        rows
        .filter(row => (
            getSheetCell(row, subjectIndex)
            && getSheetCell(row, titleIndex)
            && getSheetCell(row, linkIndex)
        ))
        .map(row => {
            return {
                subject:getSheetCell(row, subjectIndex) || "Other",
                title:getSheetCell(row, titleIndex) || "Study Resource",
                description:getSheetCell(row, descriptionIndex) || "",
                link:getSheetCell(row, linkIndex) || "#",
                icon:getSheetCell(row, iconIndex) || "▶️",
                type:getSheetCell(row, typeIndex) || "Resource"
            };
        });

        if(resources.length === 0){
            throw new Error("No exam prep resources found");
        }

        const groupedResources = {};

        resources.forEach((resource) => {

            if(!groupedResources[resource.subject]){
                groupedResources[resource.subject] = [];
            }

            groupedResources[resource.subject].push(resource);

        });

        container.innerHTML =
        Object.keys(groupedResources).map((subject, index) => {

            const subjectClass =
            index % 3 === 0
            ? ""
            : index % 3 === 1
                ? "blue"
                : "green";

            return `

            <div class="exam-prep-group">

                <div class="exam-prep-category exam-prep-subject ${subjectClass}">
                    <span>Subject</span>
                    <strong>${escapeHTML(subject)}</strong>
                </div>

                ${groupedResources[subject].map(resource => {

                    const isExternal =
                    String(resource.link).startsWith("http");

                    return `

                    <a
                    href="${safeUrl(resource.link)}"
                    class="exam-prep-resource"
                    ${isExternal ? `target="_blank" rel="noopener noreferrer"` : ""}>

                        <div class="exam-prep-icon">
                            ${escapeHTML(resource.icon)}
                        </div>

                        <div class="exam-prep-main">
                            <h3>${escapeHTML(resource.title)}</h3>
                            <p>${escapeHTML(resource.description)}</p>
                        </div>

                        <div class="exam-prep-type">
                            ${escapeHTML(resource.type)}
                        </div>

                    </a>

                    `;

                }).join("")}

            </div>

            `;

        }).join("");

    }

    catch(error){

        console.error(error);

        container.innerHTML = `

        <div class="exam-prep-empty">
            Study resources could not be loaded. Make sure your Google Sheet is published as a CSV.
        </div>

        `;

    }

}

/* =========================
   GRADE CALCULATOR
========================= */

const categoriesContainer =
document.getElementById("categories");

const addCategoryBtn =
document.getElementById("add-category");

const finalGrade =
document.getElementById("final-grade");

const nextCategory =
document.getElementById("next-category");

const predictedGrade =
document.getElementById("predicted-grade");

function createCategoryRow(name = "", weight = "", earned = "", total = ""){

    if(!categoriesContainer){
        return;
    }

    const row =
    document.createElement("div");

    row.className =
    "grade-row";

    row.innerHTML = `

        <input
        type="text"
        class="cat-name"
        placeholder="Category Name"
        value="${escapeHTML(name)}">

        <input
        type="number"
        class="cat-weight"
        placeholder="Weight %"
        value="${escapeHTML(weight)}">

        <div class="fraction-group">

            <input
            type="number"
            class="cat-earned"
            placeholder="Points Earned"
            value="${escapeHTML(earned)}">

            <span>/</span>

            <input
            type="number"
            class="cat-total"
            placeholder="Total Points"
            value="${escapeHTML(total)}">

        </div>

    `;

    categoriesContainer.appendChild(row);

    attachGradeListeners();
    updateCategoryDropdown();
    calculateGrade();

}

function attachGradeListeners(){

    const inputs =
    document.querySelectorAll(
        ".cat-name, .cat-weight, .cat-earned, .cat-total"
    );

    inputs.forEach((input) => {

        input.removeEventListener("input", calculateGrade);

        input.addEventListener("input", () => {

            calculateGrade();
            updateCategoryDropdown();

        });

    });

}

function calculateGrade(){

    const rows =
    document.querySelectorAll(".grade-row");

    let weightedTotal = 0;
    let totalWeight = 0;

    rows.forEach((row) => {

        const weight =
        parseFloat(row.querySelector(".cat-weight").value) || 0;

        const earned =
        parseFloat(row.querySelector(".cat-earned").value) || 0;

        const total =
        parseFloat(row.querySelector(".cat-total").value) || 0;

        if(total > 0 && weight > 0){

            const percent =
            (earned / total) * 100;

            weightedTotal +=
            percent * (weight / 100);

            totalWeight +=
            weight;

        }

    });

    let grade = 0;

    if(totalWeight > 0){
        grade =
        (weightedTotal / totalWeight) * 100;
    }

    if(finalGrade){
        finalGrade.textContent =
        `${grade.toFixed(2)}%`;
    }

}

function updateCategoryDropdown(){

    if(!nextCategory){
        return;
    }

    nextCategory.innerHTML = "";

    const names =
    document.querySelectorAll(".cat-name");

    names.forEach((input, index) => {

        const option =
        document.createElement("option");

        option.value =
        index;

        option.textContent =
        input.value || `Category ${index + 1}`;

        nextCategory.appendChild(option);

    });

}

const predictBtn =
document.getElementById("predict-btn");

if(predictBtn){

    predictBtn.addEventListener("click", () => {

        const rows =
        document.querySelectorAll(".grade-row");

        let weightedTotal = 0;
        let totalWeight = 0;

        const selectedIndex =
        parseInt(nextCategory.value);

        const nextEarned =
        parseFloat(document.getElementById("next-earned").value) || 0;

        const nextTotal =
        parseFloat(document.getElementById("next-total").value) || 0;

        rows.forEach((row, index) => {

            const weight =
            parseFloat(row.querySelector(".cat-weight").value) || 0;

            let earned =
            parseFloat(row.querySelector(".cat-earned").value) || 0;

            let total =
            parseFloat(row.querySelector(".cat-total").value) || 0;

            if(index === selectedIndex){
                earned += nextEarned;
                total += nextTotal;
            }

            if(total > 0 && weight > 0){

                const percent =
                (earned / total) * 100;

                weightedTotal +=
                percent * (weight / 100);

                totalWeight +=
                weight;

            }

        });

        let predicted = 0;

        if(totalWeight > 0){
            predicted =
            (weightedTotal / totalWeight) * 100;
        }

        if(predictedGrade){
            predictedGrade.textContent =
            `${predicted.toFixed(2)}%`;
        }

    });

}

if(addCategoryBtn){

    addCategoryBtn.addEventListener("click", () => {

        createCategoryRow();

    });

}

/* =========================
   FEEDBACK POLLS
========================= */

const featuredPollContainer =
document.getElementById("featured-poll-container");

const pollsContainer =
document.getElementById("polls-container");

const feedbackApiUrl =
"https://script.google.com/macros/s/AKfycbxICM-yhAspiDBV_n9dd-9rqGE47qtbcvx_JRH85T6k1AHEdistv1uBVrgNtVIcjmvw/exec";

async function loadFeedbackPolls(){

    if(!featuredPollContainer || !pollsContainer){
        return;
    }

    try{

        const response =
        await fetch(`${feedbackApiUrl}?action=getPolls&voterId=${encodeURIComponent(getVoterId())}`);

        const data =
        await response.json();

        if(!data.success){
            throw new Error("Polls could not be loaded");
        }

        const polls =
        data.polls;

        const featuredPoll =
        polls.find(poll => poll.featured) || polls[0];

        const regularPolls =
        polls.filter(poll => poll.id !== featuredPoll.id);

        featuredPollContainer.innerHTML =
        renderPollCard(featuredPoll, true);

        pollsContainer.innerHTML =
        regularPolls.map(poll => renderPollCard(poll, false)).join("");

        attachPollVoteButtons();

    }

    catch(error){

        console.error(error);

        featuredPollContainer.innerHTML = `

        <div class="featured-poll-card">

            <div>
                <div class="poll-label">Feedback Unavailable</div>
                <h3>Polls could not be loaded</h3>
                <p>Please try again later.</p>
            </div>

        </div>

        `;

    }

}

function renderPollCard(poll, featured){

    const yesPercent =
    Number(poll.yesPercent) || 0;

    const noPercent =
    Number(poll.noPercent) || 0;

        const yesWidth =
        poll.totalVotes > 0 ? yesPercent : 50;

        const noWidth =
        poll.totalVotes > 0 ? noPercent : 50;

        const yesLabel =
        poll.totalVotes > 0 ? `Yes ${yesPercent}%` : "Yes";

        const noLabel =
        poll.totalVotes > 0 ? `No ${noPercent}%` : "No";

    return `

    <div class="${featured ? "featured-poll-card" : "poll-card"}" data-poll-id="${escapeHTML(poll.id)}">

        <div class="poll-info">

            <div class="poll-label">
                ${featured ? "Featured Idea" : "Idea"}
            </div>

            <h3>${escapeHTML(poll.title)}</h3>

            <p>${escapeHTML(poll.description)}</p>

            <div class="poll-meta">

                <span class="poll-pill">
                    🏷 ${escapeHTML(poll.category)}
                </span>

                <span class="poll-pill">
                    🕒 ${escapeHTML(poll.status)}
                </span>

            </div>

        </div>

        <div class="poll-vote-area">

            <div class="poll-results">

               <div class="poll-bar" aria-label="${escapeHTML(`${yesLabel}, ${noLabel}`)}">

                   <div class="poll-yes-fill ${yesPercent > 0 && yesPercent < 10 ? "is-tiny" : ""}" style="width:${yesWidth}%" aria-hidden="true">
                   </div>
               
                   <div class="poll-no-fill ${noPercent > 0 && yesPercent > 0 ? "has-divider" : ""} ${noPercent > 0 && noPercent < 10 ? "is-tiny" : ""}" style="width:${noWidth}%" aria-hidden="true">
                   </div>

                   <span class="poll-bar-label yes">${escapeHTML(yesLabel)}</span>
                   <span class="poll-bar-label no">${escapeHTML(noLabel)}</span>
               
               </div>

                <div class="poll-total">
                    Total Responses: ${escapeHTML(poll.totalVotes)}
                </div>

            </div>

            <div class="poll-actions">

                <button
                class="poll-vote-btn yes ${poll.userVote === "yes" ? "selected" : ""}"
                data-vote="yes"
                data-poll-id="${escapeHTML(poll.id)}"
                ${poll.hasVoted ? "disabled" : ""}>
                    ${poll.userVote === "yes" ? "You voted Yes" : "Yes"}
                </button>
               
                <button
                class="poll-vote-btn no ${poll.userVote === "no" ? "selected" : ""}"
                data-vote="no"
                data-poll-id="${escapeHTML(poll.id)}"
                ${poll.hasVoted ? "disabled" : ""}>
                    ${poll.userVote === "no" ? "You voted No" : "No"}
                </button>

            </div>

            <a href="#requests" class="suggest-change-btn" data-suggest-for="${escapeHTML(poll.id)}">
                💬 Suggest Changes
            </a>

        </div>

    </div>

    `;

}

function attachPollVoteButtons(){

    const voteButtons =
    document.querySelectorAll(".poll-vote-btn");

    voteButtons.forEach((button) => {

        button.addEventListener("click", async () => {

            const pollId =
            button.dataset.pollId;

            const vote =
            button.dataset.vote;

            button.disabled = true;
            button.textContent = "Saving...";

            try{

                const response =
                await fetch(feedbackApiUrl, {
                    method:"POST",
                    body:JSON.stringify({
                        action:"vote",
                        pollId:pollId,
                        vote:vote,
                        voterId:getVoterId()
                    })
                });
               
                const result =
                await response.json();
               
                if(!result.success){
                
                    if(result.alreadyVoted){
                        alert("You already voted on this idea.");
                        await loadFeedbackPolls();
                        return;
                    }
               
                    throw new Error(result.message || "Vote could not be saved");
               
                }

                if(vote === "no"){

                    const suggestButton =
                    document.querySelector(`[data-suggest-for="${pollId}"]`);

                    if(suggestButton){
                        suggestButton.classList.add("show");
                    }

                }

                await loadFeedbackPolls();

                if(vote === "no"){

                    const suggestButton =
                    document.querySelector(`[data-suggest-for="${pollId}"]`);

                    if(suggestButton){
                        suggestButton.classList.add("show");
                    }

                }

            }

            catch(error){

                console.error(error);

                button.disabled = false;

                button.textContent =
                vote === "yes" ? "Yes" : "No";

                alert("Your vote could not be saved. Please try again.");

            }

        });

    });

}

function getVoterId(){

    let voterId =
    localStorage.getItem("jwmhs2028_voter_id");

    if(!voterId){

        if(window.crypto && crypto.randomUUID){
            voterId =
            "voter_" + crypto.randomUUID();
        }

        else{
            voterId =
            "voter_" + Date.now() + "_" + Math.random().toString(36).slice(2);
        }

        localStorage.setItem("jwmhs2028_voter_id", voterId);

    }

    return voterId;

}

/* =========================
   REAL REPEATING SECTION TICKERS
========================= */

const sectionTickerData = {
    council:[
        "Meet The Board",
        "Class Representatives",
        "Sponsors & Advisors",
        "Student Council"
    ],
    dashboard:[
        "Weekly Happenings",
        "Quick Links",
        "Projects",
        "Bell Schedule",
        "Designated Lunches",
        "Student Dashboard"
    ],
    about:[
        "Announcements",
        "Student Voice",
        "Resources",
        "Mitchell Mustangs",
        "Class Hub"
    ],
    events:[
        "Latest Updates",
        "Announcements",
        "Events",
        "Reminders",
        "Class of 2028"
    ],
    feedback:[
        "Student Feedback",
        "Vote Yes Or No",
        "Share Your Voice",
        "Class Ideas"
    ],
    courses:[
        "Student Guide",
        "Courses",
        "Clubs",
        "Resources",
        "School Tools"
    ],
    "student-tools":[
        "Student Toolkit",
        "Student Guide",
        "Exam Prep",
        "Grade Calculator",
        "Quick Access"
    ],
    "exam-prep":[
        "AP Exam Prep",
        "Study Resources",
        "Review Videos",
        "Practice Links",
        "AP Courses",
        "Exam Review"
    ],
    calculator:[
        "Grade Calculator",
        "Student Tools",
        "Plan Ahead",
        "Class Resources"
    ],
    communication:[
        "Follow Us",
        "Instagram",
        "Student Requests",
        "Stay Connected"
    ],
    requests:[
        "Submit Ideas",
        "Student Voice",
        "Requests",
        "Class of 2028"
    ]
};

const tickerStyles = [
    "solid-gold",
    "outline-black",
    "solid-black",
    "outline-gold"
];

function createSectionTickers(){

    Object.keys(sectionTickerData).forEach((sectionId) => {

        const section =
        document.getElementById(sectionId);

        if(!section){
            return;
        }

        if(section.querySelector(".section-ticker")){
            return;
        }

        const ticker =
        document.createElement("div");

        ticker.className =
        "section-ticker";

        const track =
        document.createElement("div");

        track.className =
        "section-ticker-track";

        const groupOne =
        createTickerGroup(sectionTickerData[sectionId]);

        const groupTwo =
        createTickerGroup(sectionTickerData[sectionId]);

        track.appendChild(groupOne);
        track.appendChild(groupTwo);

        ticker.appendChild(track);

        /*
           This puts each section marquee at the top of its own section
           instead of appending it to the bottom.
        */
        section.insertBefore(ticker, section.firstElementChild);

    });

}

function createTickerGroup(items){

    const group =
    document.createElement("div");

    group.className =
    "section-ticker-group";

    const repeatedItems = [
        ...items,
        ...items,
        ...items
    ];

    repeatedItems.forEach((item, index) => {

        const itemWrap =
        document.createElement("div");

        itemWrap.className =
        "section-ticker-item";

        const textSpan =
        document.createElement("span");

        textSpan.className =
        `section-ticker-text ${tickerStyles[index % tickerStyles.length]}`;

        const phraseSpan =
        document.createElement("span");

        phraseSpan.className =
        "ticker-word";

        phraseSpan.textContent =
        item;

        const dotSpan =
        document.createElement("span");

        dotSpan.className =
        "ticker-dot";

        dotSpan.textContent =
        "•";

        textSpan.appendChild(phraseSpan);
        textSpan.appendChild(dotSpan);

        itemWrap.appendChild(textSpan);

        group.appendChild(itemWrap);

    });

    return group;

}

/* =========================
   INITIALIZE SITE
========================= */

applySavedTheme();

loadMakeoverAlertState();

loadViewerCounter();

setActiveNavigation(window.location.hash || "#home");

createSectionTickers();

loadUpdates();

loadHeroCountdown();

loadWeeklyHappenings();
loadQuickLinks();
loadCouncilProjects();
loadBellSchedule();
loadFAQ();

loadExamPrepResources();

loadFeedbackPolls();

loadStudentGuideCourses();
loadStudentGuideClubs();

createCategoryRow();
createCategoryRow();
