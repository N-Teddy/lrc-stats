const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db');

const firstNames = ["Jean", "Pierre", "Marie", "Lucie", "Ahmed", "Fatou", "Paul", "Julie", "Marc", "Sophie", "Thomas", "Camille", "Eric", "Sarah", "Alain", "Monique", "Nicolas", "Emilie", "David", "Laura"];
const lastNames = ["Dupont", "Durand", "Lefebvre", "Moreau", "Petit", "Roux", "Bernard", "Thomas", "Richard", "Garnier", "Faure", "Martinez", "Legrand", "Gauthier", "Muller", "Perrin", "Morin", "Rousseau", "Fontaine", "Guerin"];
const activityTypes = [
    'REUNION MENSUELLE',
    'CONFERENCE',
    'SERVICE JRS',
    'ACTIVITE LUDIQUE',
    'AUTRES',
    'JPO'
];

function generatePeople(count) {
    const people = [];
    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const dateId = Date.now();
        people.push({
            id: `p-${dateId}-${i}`,
            name: `${firstName} ${lastName}`,
            phone: `+237 6${Math.floor(Math.random() * 90000000 + 10000000)}`,
            status: Math.random() > 0.8 ? 'Eleve' : 'Membre',
            dob: `19${Math.floor(Math.random() * 40 + 50)}-${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}`,
            dateIntegration: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}`,
            dateDeparture: '',
            isJRs: Math.random() > 0.7,
            image: '',
            isArchived: false
        });
    }
    return people;
}

function generateActivities() {
    const activities = [];
    const years = [2024, 2025, 2026];
    for (const year of years) {
        for (let i = 0; i < 20; i++) {
            const month = Math.floor(i / 2) + 1; // Roughly spread over months
            const day = (i % 2 === 0) ? 10 : 25;
            const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            activities.push({
                id: `act-${year}-${i}`,
                name: `${type} - ${year} #${i + 1}`,
                date: date,
                type: type,
                notes: `Automated seed data for ${year}`
            });
        }
    }
    return activities;
}

function generateAttendance(people, activities) {
    const attendance = [];
    for (const activity of activities) {
        // Random attendance count between 40% and 90% of total people
        const attendeesCount = Math.floor(people.length * (0.4 + Math.random() * 0.5));
        const shuffled = [...people].sort(() => 0.5 - Math.random());
        const attendeeIds = shuffled.slice(0, attendeesCount).map(p => p.id);

        attendance.push({
            activityId: activity.id,
            activityName: activity.name,
            date: activity.date,
            personIds: attendeeIds,
            count: attendeeIds.length
        });
    }
    return attendance;
}

function seed() {
    console.log("Starting seeder...");

    if (!fs.existsSync(DB_PATH)) {
        fs.mkdirSync(DB_PATH);
    }

    const people = generatePeople(100);
    const activities = generateActivities();
    const attendance = generateAttendance(people, activities);

    fs.writeFileSync(path.join(DB_PATH, 'people.json'), JSON.stringify(people, null, 2));
    fs.writeFileSync(path.join(DB_PATH, 'activities.json'), JSON.stringify(activities, null, 2));
    fs.writeFileSync(path.join(DB_PATH, 'attendance.json'), JSON.stringify(attendance, null, 2));

    console.log("Seeding complete!");
    console.log(`- Generated ${people.length} people`);
    console.log(`- Generated ${activities.length} activities`);
    console.log(`- Generated ${attendance.length} attendance records`);
}

seed();
