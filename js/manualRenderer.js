/**
 * manualRenderer.js
 * Dynamically renders the classified manual content from JSON.
 */

import { Logger } from './Logger.js';

const manualFiles = [
    'pdf/json/directives.json',
    'pdf/json/schematics.json',
    'pdf/json/logic.json',
    'pdf/json/maintenance.json',
    'pdf/json/appendices.json'
];

// Mapping module IDs to their respective images from the /pic directory
const imageMap = {
    'operational-overview': ['Bomb img.png', 'Timer.png', 'Serial Number.png'],
    'identification-protocol': ['Indicators.png'],
    'linear-connectors': ['The Wires.png'],
    'multi-state-actuators': ['The Button.png'],
    'hierarchical-symbol-sets': ['Keypad.png', 'Keypads Series Columns.jpg'],
    'pattern-recognition': ['Simon Says.png', 'Simon Says Tables.png'],
    'asymmetrical-wiring': ['Complicated Wires.png', 'Complicated Wires and Diagram.png'],
    'sequential-routing': ['Wire Sequences.png', 'Wiring Sequence Table.jpg'],
    'verbal-relays': ['Whos on first.png', 'Whos on first figures.png'],
    'volatile-memory-access': ['Memory.png'],
    'frequential-deciphering': ['Morse Code.png', 'Morse Code Tables.png'],
    'navigational-algorithms': ['Mazes.png', 'Mazes Images.png'],
    'cryptographic-passphrases': ['Passwords.png', 'Passwords Table.png'],
    'rotary-interfacing': ['LED Config Knobs Tables.png'],
    'reference-a': ['Appendix A.png', 'Indicators.png'],
    'reference-b': ['Appendix B Battery.png', 'Batteries.png'],
    'reference-c': ['Appendix C Ports.jpg']
};

let manualData = [];

async function init() {
    try {
        Logger.log("ManualRenderer", "Initializing...");
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '<p style="text-align:center; padding: 20px;">INITIALIZING SECURE CONNECTION...</p>';

        // Load all JSON files with explicit error handling for each
        const fetches = manualFiles.map(file => 
            fetch(file)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.json();
                })
                .catch(err => {
                    Logger.error("ManualRenderer", `Failed to load ${file}`, err);
                    return null;
                })
        );
        
        const results = await Promise.all(fetches);
        manualData = results.filter(r => r !== null);
        
        if (manualData.length === 0) {
            contentArea.innerHTML = '<p class="warning-text">CRITICAL ERROR: FAILED TO LOAD CLASSIFIED DATA. CHECK SERVER CONNECTION.</p>';
        } else {
            contentArea.innerHTML = '';
            setupNavListeners();
            Logger.log("ManualRenderer", "Data Loaded Successfully", { categories: manualData.length });
        }
    } catch (err) {
        Logger.error("ManualRenderer", "Critical initialization failure", err);
        document.getElementById('content-area').innerHTML = `<p class="warning-text">SYSTEM CRASH: ${err.message}</p>`;
    }
}

function setupNavListeners() {
    document.querySelectorAll('#side-nav a').forEach(link => {
        if (link.classList.contains('logout-btn')) return;
        
        link.onclick = (e) => {
            e.preventDefault();
            const docId = link.dataset.doc;
            if (docId) renderDocument(docId);
        };
    });
}

function renderDocument(id) {
    try {
        const welcome = document.getElementById('welcome-screen');
        const contentArea = document.getElementById('content-area');
        
        if (welcome) welcome.style.display = 'none';
        contentArea.innerHTML = '<p style="text-align:center;">ACCESSING DOCUMENT...</p>';

        // Find the document in our data pool
        let doc = null;
        manualData.forEach(cat => {
            const found = cat.documents.find(d => d.id === id);
            if (found) doc = found;
        });

        if (!doc) {
            throw new Error(`Document ${id} not found in database.`);
        }

        Logger.log("ManualRenderer", `Rendering: ${doc.title}`);

        // Build HTML
        let html = `<h1>${doc.title}</h1>`;
        
        if (doc.flavorText) {
            html += `<p class="flavor-text">${doc.flavorText}</p>`;
        }

        // Include primary images at the top
        if (imageMap[id]) {
            imageMap[id].forEach(img => {
                html += `<img src="pic/${img}" class="center-img" alt="${img}">`;
            });
        }

        // Render Rules/Content
        if (doc.content) {
            doc.content.forEach(item => {
                if (item.type === 'header') html += `<h2>${item.text}</h2>`;
                if (item.type === 'sub-header') html += `<h3>${item.text}</h3>`;
                if (item.type === 'text') html += `<p>${item.text}</p>`;
            });
        }

        if (doc.rules) {
            html += `<ul>${doc.rules.map(r => `<li>${r}</li>`).join('')}</ul>`;
        }

        // Logic-Specific Rendering (Tables etc)
        if (doc.logic) {
            html += renderLogicContent(id, doc.logic);
        }

        contentArea.innerHTML = html;
        window.scrollTo(0, 0);
    } catch (err) {
        Logger.error("ManualRenderer", "Rendering error", err);
        document.getElementById('content-area').innerHTML = `<p class="warning-text">ACCESS DENIED: ${err.message}</p>`;
    }
}

function renderLogicContent(id, logic) {
    let html = "<div class='logic-section'>";
    
    if (id === 'linear-connectors') {
        Object.entries(logic).forEach(([key, val]) => {
            html += `<h3>${key.replace('_', ' ')}</h3><ul>`;
            val.forEach(v => html += `<li>${v}</li>`);
            html += `</ul>`;
        });
    }

    if (id === 'multi-state-actuators') {
        html += `<h3>Perform the first action that applies:</h3><ol>`;
        logic.actions.forEach(a => html += `<li>${a}</li>`);
        html += `</ol><h3>${logic.releasing.title}</h3><p>${logic.releasing.instruction}</p><ul>`;
        logic.releasing.strip_colors.forEach(s => html += `<li>${s}</li>`);
        html += `</ul>`;
    }

    if (id === 'pattern-recognition') {
        html += `<h3>Table 1: Serial Number contains Vowel</h3><table><tr><th>Strikes</th><th>Red</th><th>Blue</th><th>Green</th><th>Yellow</th></tr>`;
        logic.vowel.forEach((row, i) => {
            html += `<tr><td>${i}</td><td>${row.red}</td><td>${row.blue}</td><td>${row.green}</td><td>${row.yellow}</td></tr>`;
        });
        html += `</table><h3>Table 2: No Vowel</h3><table><tr><th>Strikes</th><th>Red</th><th>Blue</th><th>Green</th><th>Yellow</th></tr>`;
        logic.no_vowel.forEach((row, i) => {
            html += `<tr><td>${i}</td><td>${row.red}</td><td>${row.blue}</td><td>${row.green}</td><td>${row.yellow}</td></tr>`;
        });
        html += `</table>`;
    }

    if (id === 'frequential-deciphering') {
        html += `<table><tr><th>Word</th><th>Freq</th></tr>`;
        logic.words.forEach(w => html += `<tr><td>${w.word}</td><td>${w.freq} MHz</td></tr>`);
        html += `</table>`;
    }

    if (id === 'hierarchical-symbol-sets') {
        html += `<h3>Symbol Columns</h3><div class='side-by-side'>`;
        logic.columns.forEach((col, i) => {
            html += `<table style='width: auto;'><tr><th>Col ${i+1}</th></tr>`;
            col.forEach(s => html += `<tr><td>${s}</td></tr>`);
            html += `</table>`;
        });
        html += `</div>`;
    }

    if (id === 'verbal-relays') {
        html += `<h3>Step 1: Display Mapping</h3><table><tr><th>Word</th><th>Pos</th></tr>`;
        Object.entries(logic.step1).forEach(([word, pos]) => {
            html += `<tr><td>${word || "[BLANK]"}</td><td>${pos}</td></tr>`;
        });
        html += `</table><h3>Step 2: Button Lists</h3>`;
        Object.entries(logic.step2).forEach(([word, list]) => {
            html += `<p><strong>${word}:</strong> ${list.join(', ')}</p>`;
        });
    }

    if (id === 'volatile-memory-access') {
        for (let i = 1; i <= 5; i++) {
            html += `<h3>Stage ${i}</h3><ul>`;
            logic[`stage${i}`].forEach(rule => {
                const actionText = rule.action === 'position' ? `button in position ${rule.value || `from stage ${rule.history_stage}`}` : `button labeled "${rule.value || `from stage ${rule.history_stage}`}"`;
                html += `<li>If display is ${rule.display}, press ${actionText}</li>`;
            });
            html += `</ul>`;
        }
    }

    if (id === 'sequential-routing') {
        ['red', 'blue', 'black'].forEach(color => {
            html += `<h3>${color.toUpperCase()} Wire Occurrences</h3><table><tr><th>Occurrence</th><th>Cut if connected to:</th></tr>`;
            logic[color].forEach((rule, i) => {
                html += `<tr><td>${i+1}</td><td>${rule}</td></tr>`;
            });
            html += `</table>`;
        });
    }

    if (id === 'navigational-algorithms') {
        html += `<table><tr><th>Indicators</th><th>ID</th></tr>`;
        logic.mazes.forEach(m => {
            const inds = m.indicators.map(i => `(${i.x}, ${i.y})`).join(' & ');
            html += `<tr><td>${inds}</td><td>Maze ${m.id}</td></tr>`;
        });
        html += `</table>`;
    }

    if (id === 'cryptographic-passphrases') {
        html += `<p>${logic.words.join(', ')}</p>`;
    }

    if (id === 'reference-a') {
        html += `<ul>${logic.common_indicators.map(ind => `<li>${ind}</li>`).join('')}</ul>`;
    }

    if (id === 'reference-b') {
        html += `<table><tr><th>Type</th><th>Visual</th></tr>`;
        logic.battery_types.forEach(b => html += `<tr><td>${b.type}</td><td>${b.visual}</td></tr>`);
        html += `</table>`;
    }

    if (id === 'reference-c') {
        html += `<ul>${logic.ports.map(p => `<li>${p}</li>`).join('')}</ul>`;
    }

    if (id === 'asymmetrical-wiring') {
        html += `<h3>Legend</h3><ul>`;
        Object.entries(logic.legend).forEach(([k, v]) => html += `<li><strong>${k}:</strong> ${v}</li>`);
        html += `</ul><h3>Combinations</h3><table><tr><th>Properties</th><th>Action</th></tr>`;
        Object.entries(logic.combinations).forEach(([k, v]) => html += `<tr><td>${k.replace(/_/g, ' ')}</td><td>${v}</td></tr>`);
        html += `</table>`;
    }

    if (id === 'rotary-interfacing') {
        html += `<table><tr><th>Position</th><th>LED Configuration</th></tr>`;
        Object.entries(logic).forEach(([pos, leds]) => {
            html += `<tr><td>${pos}</td><td>${leds.join('<br>')}</td></tr>`;
        });
        html += `</table>`;
    }

    // For other modules, we'll keep adding specific table rendering as needed
    // or generic key-value tables.
    
    html += "</div>";
    return html;
}

init();
