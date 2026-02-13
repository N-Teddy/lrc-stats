const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

// --- PATH DETECTION ---
const APP_IDENTIFIER = "com.lrc.stats";
let APP_DATA_DIR;

if (os.platform() === 'win32') {
    APP_DATA_DIR = path.join(os.homedir(), 'AppData', 'Roaming', APP_IDENTIFIER);
} else if (os.platform() === 'darwin') {
    APP_DATA_DIR = path.join(os.homedir(), 'Library', 'Application Support', APP_IDENTIFIER);
} else {
    APP_DATA_DIR = path.join(os.homedir(), '.local', 'share', APP_IDENTIFIER);
}

const PROJECT_DB_PATH = path.join(__dirname, 'db');
const TAURI_DB_PATH = path.join(APP_DATA_DIR, 'db');

const firstNames = ["Jean-Paul", "Marie", "Thomas", "Sarah", "Lucas", "Sophie", "Alain", "Emilie", "David", "Laura", "Marc", "Camille", "Nicolas", "Julie", "Eric", "Fatou", "Ahmed", "Lucie", "Pierre", "Monique"];
const lastNames = ["Kamga", "Ngo Bakot", "Ebakisse", "Douala", "Muller", "Perrin", "Morin", "Rousseau", "Fontaine", "Guerin", "Dupont", "Durand", "Lefebvre", "Moreau", "Petit", "Roux", "Bernard", "Richard", "Garnier", "Faure"];
const activityTypes = ['REUNION MENSUELLE', 'CONFERENCE', 'SERVICE JRS', 'ACTIVITE LUDIQUE', 'JPO', 'AUTRES'];

// Archetypes IDs to use later for attendance
let pillars = [];
let atRisk = [];
let regulars = [];
let newRecruits = [];

function generatePeople(count) {
    const people = [];
    for (let i = 0; i < count; i++) {
        const id = uuidv4();
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
        const name = `${firstName} ${lastName} ${i > 40 ? '(' + i + ')' : ''}`;

        // Distribution
        const isMembre = i < (count * 0.75); // 75% Membre
        const isJRs = Math.random() > 0.7;
        const hasPhone = i < (count * 0.9);

        // System States
        const isArchived = i >= 110 && i < 115;
        const isDeleted = i >= 115;

        const person = {
            id,
            name: name.trim(),
            phone: hasPhone ? `+237 6${Math.floor(Math.random() * 90000000 + 10000000)}` : '',
            status: isMembre ? 'Membre' : 'Eleve',
            dob: `${1970 + (i % 35)}-01-01`,
            dateIntegration: i < 90 ? '2023-01-01' : '2025-11-15',
            dateDeparture: '',
            isJRs,
            image: '',
            isArchived,
            isDeleted,
            deletedAt: isDeleted ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString()
        };

        people.push(person);

        // Assign Archetypes (ignoring archived/deleted for attendance logic)
        if (!isArchived && !isDeleted) {
            if (i < 40) pillars.push(id);
            else if (i < 55) atRisk.push(id);
            else if (i < 90) regulars.push(id);
            else newRecruits.push(id);
        }
    }
    return people;
}

function generateActivities() {
    const activities = [];
    const years = [2023, 2024, 2025, 2026];
    const today = new Date();

    years.forEach(year => {
        for (let i = 1; i <= 18; i++) {
            const id = uuidv4();
            const month = Math.ceil(i / 1.5); // Spread 18 activities over 12 months
            const day = (i % 2 === 0) ? 10 : 25;
            const dateStr = `${year}-${String(Math.min(month, 12)).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const actDate = new Date(dateStr);
            const type = activityTypes[i % activityTypes.length];

            // Special state logic
            const isFuture = actDate > today;
            const isOverdue = !isFuture && actDate > new Date(today.getTime() - (30 * 86400000)) && i > 15 && year === 2026;

            activities.push({
                id,
                name: `${type} ${year} #${i}`,
                type,
                date: dateStr,
                notes: `Strategic Session for ${year}. Sequence ${i}.`,
                isDeleted: false,
                updatedAt: new Date().toISOString(),
                // Metadata for attendance generator
                _isFuture: isFuture,
                _isOverdue: isOverdue
            });
        }
    });
    return activities;
}

function generateAttendance(people, activities) {
    return activities.filter(act => !act._isFuture).map(act => {
        let attendeeIds = [];

        // 1. Pillars always come (95% chance)
        pillars.forEach(p => { if (Math.random() < 0.95) attendeeIds.push(p); });

        // 2. Regulars (60% chance)
        regulars.forEach(p => { if (Math.random() < 0.6) attendeeIds.push(p); });

        // 3. New Recruits (Only if activity is late 2025/2026)
        const actYear = new Date(act.date).getFullYear();
        if (actYear >= 2025) {
            newRecruits.forEach(p => { if (Math.random() < 0.7) attendeeIds.push(p); });
        }

        // 4. At Risk (They stopped coming in late 2025)
        const actDate = new Date(act.date);
        const cutoff = new Date('2025-08-01');
        if (actDate < cutoff) {
            atRisk.forEach(p => { if (Math.random() < 0.8) attendeeIds.push(p); });
        }

        return {
            id: uuidv4(),
            activityId: act.id,
            activityName: act.name,
            date: act.date,
            personIds: attendeeIds,
            count: attendeeIds.length,
            isLocked: !act._isOverdue, // Testing the "overdue" dashboard alerts
            updatedAt: new Date().toISOString()
        };
    });
}

function generateAuditLogs() {
    return [
        { id: uuidv4(), action: 'LOGIN', entityType: 'SYSTEM', entityName: 'User Session Started', timestamp: new Date().toISOString(), userName: 'Super Admin', deviceId: 'DEV-X1' },
        { id: uuidv4(), action: 'CREATE', entityType: 'PERSON', entityName: pillars[0], timestamp: new Date(Date.now() - 500000).toISOString(), userName: 'Super Admin', deviceId: 'DEV-X1' },
        { id: uuidv4(), action: 'PDF_GEN', entityType: 'REPORT', entityName: 'Audit Annuel 2025', timestamp: new Date(Date.now() - 100000).toISOString(), userName: 'Super Admin', deviceId: 'DEV-X1' }
    ];
}

function seed() {
    console.log(`[SEED] Mode: Tactical High-Fidelity`);
    console.log(`[SEED] AppData Target: ${TAURI_DB_PATH}`);

    if (!fs.existsSync(PROJECT_DB_PATH)) fs.mkdirSync(PROJECT_DB_PATH, { recursive: true });
    if (!fs.existsSync(TAURI_DB_PATH)) fs.mkdirSync(TAURI_DB_PATH, { recursive: true });

    const people = generatePeople(120);
    const activities = generateActivities();
    const attendance = generateAttendance(people, activities);
    const logs = generateAuditLogs();

    const writeData = (targetDir) => {
        fs.writeFileSync(path.join(targetDir, 'people.json'), JSON.stringify(people, null, 2));
        fs.writeFileSync(path.join(targetDir, 'activities.json'), JSON.stringify(activities, null, 2));
        fs.writeFileSync(path.join(targetDir, 'attendance.json'), JSON.stringify(attendance, null, 2));
        fs.writeFileSync(path.join(targetDir, 'audit_logs.json'), JSON.stringify(logs, null, 2));
    };

    writeData(PROJECT_DB_PATH);
    writeData(TAURI_DB_PATH);

    console.log(`[SUCCESS] Generated:`);
    console.log(`- 120 Personnel (inc. Pillars, At-Risk, Archived, Deleted)`);
    console.log(`- 72 Activities (18/year, 2023-2026)`);
    console.log(`- Full Attendance records with Engagement Intelligence`);
    console.log(`- Core Audit Logs`);
}

seed();