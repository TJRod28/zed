// ==========================
// 1. STATE AND PAGE ELEMENTS
// ==========================
let matches = [];

const form = document.getElementById("add-match-form");
const matchBody = document.getElementById("match-body");
const tableWrapper = document.querySelector(".table-wrapper");
const emptyMessage = document.getElementById("empty-message");
const matchCount = document.getElementById("match-count");
const searchInput = document.getElementById("search-input");
const roleFilter = document.getElementById("role-filter");
const themeToggle = document.getElementById("theme-toggle");
const exportBtn = document.getElementById("export-btn");

// The <option> values are lowercase; this turns them into display names.
const roleNames = {
    vanguard: "Vanguard",
    duelist: "Duelist",
    strategist: "Strategist"
};

// ==========================
// 2. EVENT LISTENERS
// ==========================
form.addEventListener("submit", addMatch);
searchInput.addEventListener("input", searchMatches);
roleFilter.addEventListener("change", searchMatches);
themeToggle.addEventListener("click", toggleTheme);
exportBtn.addEventListener("click", exportCSV);

// ==========================
// 3. ADD A MATCH
// ==========================
function addMatch(event) {
    event.preventDefault();

    const role = document.getElementById("role").value;
    const hero = document.getElementById("hero").value.trim();

    // Form values are strings, so every stat is converted to a number.
    const kills = parseInt(document.getElementById("kills").value);
    const deaths = parseInt(document.getElementById("deaths").value);
    const assists = parseInt(document.getElementById("assists").value);
    const finalHits = parseInt(document.getElementById("final-hits").value);
    const damageDealt = parseInt(document.getElementById("damage-dealt").value);
    const damageTaken = parseInt(document.getElementById("damage-taken").value);
    const healing = parseInt(document.getElementById("healing").value);
    const accuracy = parseFloat(document.getElementById("accuracy").value);

    if (!role) {
        alert("Please choose a role.");
        return;
    }

    // isNaN catches an empty or unreadable box; < 0 catches negative numbers.
    const stats = [kills, deaths, assists, finalHits, damageDealt, damageTaken, healing, accuracy];
    for (let i = 0; i < stats.length; i++) {
        if (isNaN(stats[i]) || stats[i] < 0) {
            alert("Please enter every stat as a number of 0 or more.");
            return;
        }
    }

    if (accuracy > 100) {
        alert("Accuracy cannot be more than 100%.");
        return;
    }

    const newMatch = {
        role: role,
        hero: hero,
        kills: kills,
        deaths: deaths,
        assists: assists,
        finalHits: finalHits,
        damageDealt: damageDealt,
        damageTaken: damageTaken,
        healing: healing,
        accuracy: accuracy,
        dateAdded: new Date().toLocaleDateString()
    };

    // unshift adds to the FRONT of the array, so the newest match is first.
    matches.unshift(newMatch);
    saveMatches();
    form.reset();
    displayMatches();
}

// ==========================
// 4. SAVE AND LOAD (localStorage)
// ==========================
function saveMatches() {
    try {
        localStorage.setItem("zedMatches", JSON.stringify(matches));
    } catch (error) {
        alert("Unable to save your matches. Storage may be disabled.");
    }
}

function loadMatches() {
    try {
        const saved = localStorage.getItem("zedMatches");
        if (saved) {
            matches = JSON.parse(saved);
        } else {
            matches = [];
        }
    } catch (error) {
        // Corrupted saved data: start fresh instead of crashing the page.
        matches = [];
    }
}

// ==========================
// 5. DISPLAY, SEARCH AND FILTER
// ==========================
function displayMatches() {
    searchInput.value = "";     // clear the search box
    roleFilter.value = "all";   // back to All roles
    searchMatches();
}

function searchMatches() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedRole = roleFilter.value;

    const filtered = matches.filter(function(match) {
        const matchesSearch = searchText === "" ||
            match.hero.toLowerCase().includes(searchText);
        const matchesRole = selectedRole === "all" ||
            match.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    // Count display (same pattern as Project 2)
    const isFiltered = searchText !== "" || selectedRole !== "all";
    matchCount.textContent = isFiltered
        ? `Showing ${filtered.length} of ${matches.length} match${matches.length === 1 ? "" : "es"}`
        : `You have ${matches.length} match${matches.length === 1 ? "" : "es"}`;

    // Export is only clickable when there is at least one match to export.
    exportBtn.disabled = matches.length === 0;

    matchBody.innerHTML = "";

    // Empty states: hide the table and say why it is empty.
    if (filtered.length === 0) {
        tableWrapper.hidden = true;
        if (matches.length === 0) {
            emptyMessage.textContent = "No matches yet. Log your first match above.";
        } else {
            emptyMessage.textContent = "No matches fit your search or filter.";
        }
        return;
    }

    tableWrapper.hidden = false;
    emptyMessage.textContent = "";

    filtered.forEach(function(match) {
        const index = matches.indexOf(match);
        matchBody.innerHTML += `
        <tr>
            <td>${match.dateAdded}</td>
            <td><span class="role-badge role-${match.role}">${roleNames[match.role]}</span></td>
            <td>${match.hero || "—"}</td>
            <td>${match.kills}</td>
            <td>${match.deaths}</td>
            <td>${match.assists}</td>
            <td>${match.finalHits}</td>
            <td>${match.damageDealt.toLocaleString()}</td>
            <td>${match.damageTaken.toLocaleString()}</td>
            <td>${match.healing.toLocaleString()}</td>
            <td>${match.accuracy}%</td>
            <td><button type="button" class="btn-danger" onclick="deleteMatch(${index})">Delete</button></td>
        </tr>`;
    });
}

// ==========================
// 6. DELETE AND CLEAR ALL
// ==========================
function deleteMatch(index) {
    const match = matches[index];
    const label = match.hero || roleNames[match.role];
    if (confirm(`Delete the ${label} match from ${match.dateAdded}?`)) {
        matches.splice(index, 1);   // removes 1 item at the index
        saveMatches();
        searchMatches();            // re-render, keeping the current filter
    }
}

function clearAll() {
    if (confirm("Delete ALL matches? This action cannot be undone.")) {
        matches = [];
        saveMatches();
        displayMatches();
    }
}

// ==========================
// 7. THEME (Lab 19 pattern, remembered after a refresh)
// ==========================
function toggleTheme() {
    document.body.classList.toggle("theme-dark");
    const isDark = document.body.classList.contains("theme-dark");
    updateThemeButton(isDark);
    try {
        localStorage.setItem("zedTheme", isDark ? "dark" : "light");
    } catch (error) {
        // If storage is off, the theme still switches; it just won't be remembered.
    }
}

function loadTheme() {
    let saved = null;
    try {
        saved = localStorage.getItem("zedTheme");
    } catch (error) {
        saved = null;
    }
    const isDark = saved === "dark";
    if (isDark) {
        document.body.classList.add("theme-dark");
    }
    updateThemeButton(isDark);
}

function updateThemeButton(isDark) {
    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
}

// ==========================
// 8. EXPORT TO CSV (my new technique)
// Builds a text file from the matches array and downloads it.
// The file opens in Excel or Google Sheets as a spreadsheet.
// ==========================

// Wraps one value in quotes so commas inside it don't split the column.
// A quote inside the value is doubled (" becomes ""), which is the CSV rule.
function csvCell(value) {
    const text = String(value);
    return '"' + text.replaceAll('"', '""') + '"';
}

function exportCSV() {
    if (matches.length === 0) {
        alert("There are no matches to export yet.");
        return;
    }

    // Row 1: the column headers.
    const headers = ["Date", "Role", "Hero", "Kills", "Deaths", "Assists", "Final hits",
                     "Damage dealt", "Damage taken", "Healing", "Accuracy (%)"];
    const rows = [headers.map(csvCell).join(",")];

    // One row per match. Numbers are written plain (no commas like 12,400)
    // so the spreadsheet treats them as numbers it can sort and average.
    matches.forEach(function(match) {
        const cells = [
            match.dateAdded,
            roleNames[match.role],
            match.hero,
            match.kills,
            match.deaths,
            match.assists,
            match.finalHits,
            match.damageDealt,
            match.damageTaken,
            match.healing,
            match.accuracy
        ];
        rows.push(cells.map(csvCell).join(","));
    });

    // Rows are separated by line breaks. \r\n is the line break Excel expects.
    const csvText = rows.join("\r\n");

    try {
        // A Blob is a file that exists only in the browser's memory.
        const file = new Blob([csvText], { type: "text/csv" });

        // createObjectURL gives that in-memory file a temporary address.
        const url = URL.createObjectURL(file);

        // A hidden link with a download attribute saves the file instead of opening it.
        const link = document.createElement("a");
        const today = new Date().toISOString().slice(0, 10);   // e.g. 2026-10-07
        link.href = url;
        link.download = `rivals-matches-${today}.csv`;
        document.body.appendChild(link);
        link.click();

        // Clean up: remove the link and release the temporary address.
        link.remove();
        URL.revokeObjectURL(url);
    } catch (error) {
        alert("Unable to export your matches. Your browser may be blocking downloads.");
    }
}

// ==========================
// 9. START UP
// ==========================
loadTheme();
loadMatches();
displayMatches();