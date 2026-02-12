import jsPDF from 'jspdf';
import * as autoTableModule from 'jspdf-autotable';
const autoTable = autoTableModule.default || autoTableModule;
import { dataService } from './dataService';
import { notificationService } from './notificationService';

/**
 * Service for generating base PDF reports for LRC Stats
 * (Phase 3 Dynamic Enterprise features removed per directive)
 */
export const reportService = {
    /**
     * Generates a basic yearly attendance grid
     */
    generateYearlyReport: async (year = new Date().getFullYear()) => {
        try {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const activePeople = people.filter(p => !p.isArchived).sort((a, b) => a.name.localeCompare(b.name));
            const filteredActivities = activities
                .filter(a => new Date(a.date).getFullYear() === year)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            if (filteredActivities.length === 0) {
                alert(`No activities found for year ${year}.`);
                return false;
            }

            // Simple Header
            doc.setFontSize(22);
            doc.text(`LRC MISSION - ${year} ATTENDANCE LOG`, 14, 22);
            doc.setFontSize(10);
            doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 14, 28);

            const columns = [
                { header: 'ASSET NAME', dataKey: 'name' },
                ...filteredActivities.map(a => ({ header: a.date.substring(5, 10), dataKey: a.id })),
                { header: 'TOTAL', dataKey: 'total' }
            ];

            const tableData = activePeople.map(person => {
                let row = { name: person.name };
                let total = 0;
                filteredActivities.forEach(act => {
                    const actAttendance = attendance.find(attr => attr.activityId === act.id);
                    const isPresent = actAttendance && actAttendance.personIds.includes(person.id);
                    row[act.id] = isPresent ? 'X' : '-';
                    if (isPresent) total++;
                });
                row.total = total.toString();
                return row;
            });

            autoTable(doc, {
                startY: 40,
                columns: columns,
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 6 },
                styles: { fontSize: 6, cellPadding: 1.5 },
                columnStyles: { name: { fontStyle: 'bold', fontSize: 7, cellWidth: 'wrap' } },
                margin: { top: 40 }
            });

            doc.save(`LRC_Yearly_Attendance_${year}.pdf`);
            notificationService.notify('Report Exported', `Attendance log for ${year} generated.`);
            return true;
        } catch (err) {
            console.error('PDF Error:', err);
            return false;
        }
    },

    /**
     * Generates a basic personnel directory
     */
    generateDirectoryReport: async (people) => {
        try {
            const doc = new jsPDF({
                unit: 'mm',
                format: 'a4'
            });

            doc.setFontSize(22);
            doc.text('LRC MISSION - PERSONNEL DIRECTORY', 14, 22);

            const tableHeaders = [['Name', 'Status', 'Phone', 'Integration']];
            const tableData = people
                .filter(p => !p.isArchived)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(p => [
                    p.name,
                    p.status || 'Membre',
                    p.phone || '---',
                    p.dateIntegration || '---'
                ]);

            autoTable(doc, {
                startY: 35,
                head: tableHeaders,
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
                styles: { fontSize: 9 }
            });

            doc.save('LRC_Personnel_Directory.pdf');
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    },

    /**
     * Generates a high-precision individual attendance report
     * Matches the design specification from Pasted image.png
     */
    generatePersonReport: async (person, history, stats) => {
        try {
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });

            // 1. Header Section
            doc.setFontSize(24);
            doc.setTextColor(0, 0, 0);
            doc.text('PERSONNEL PERFORMANCE AUDIT', 14, 25);

            // Title Cyan Accent Line
            doc.setDrawColor(0, 210, 255);
            doc.setLineWidth(1);
            doc.line(14, 30, 70, 30);

            // 2. Member Identity (Left)
            doc.setFontSize(18);
            doc.setTextColor(40, 40, 40);
            doc.text(person.name.toUpperCase(), 14, 45);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`STATUS: ${person.status || 'Membre'}`, 14, 52);
            doc.text(`INTEGRATION: ${person.dateIntegration || '---'}`, 14, 57);
            doc.text(`PHONE: ${person.phone || '---'}`, 14, 62);

            // 3. Engagement Rate Box (Right)
            doc.setFillColor(245, 245, 245);
            doc.rect(140, 35, 56, 30, 'F');

            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('ENGAGEMENT RATE', 145, 45);

            doc.setFontSize(18);
            doc.setTextColor(0, 210, 255);
            doc.text(`${stats.rate}%`, 145, 55);

            // 4. History Table
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('OPERATIONAL PARTICIPATION HISTORY', 14, 85);

            const tableHeaders = [['Date', 'Activity Name', 'Status']];
            const tableData = history.map(h => [h.date, h.name, 'PRESENT']);

            autoTable(doc, {
                startY: 90,
                head: tableHeaders,
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 10 },
                styles: { fontSize: 9, cellPadding: 4 },
                columnStyles: {
                    2: { fontStyle: 'bold', textColor: [0, 150, 0] } // Green PRESENT
                }
            });

            doc.save(`Personnel_Audit_${person.name.replace(/\s+/g, '_')}.pdf`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    },

    /**
     * Generates a basic session attendance token
     */
    generateActivityToken: async (activity, attendees) => {
        try {
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            doc.setFontSize(22);
            doc.text('SESSION ATTENDANCE TOKEN', 105, 22, { align: 'center' });

            doc.setFontSize(14);
            doc.text(activity.name, 105, 32, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Date: ${activity.date} | Total: ${attendees.length}`, 105, 38, { align: 'center' });

            const tableHeaders = [['#', 'Name', 'Status']];
            const tableData = attendees.map((p, i) => [i + 1, p.name, p.status || 'Membre']);

            autoTable(doc, {
                startY: 45,
                head: tableHeaders,
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [0, 50, 100] }
            });

            doc.save(`Token_${activity.name.replace(/\s+/g, '_')}.pdf`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    },

    /**
     * Generates a simplified global activity log
     */
    generateAllActivitiesReport: async () => {
        try {
            const activities = await dataService.getActivities();
            const attendance = await dataService.getAttendance();
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });

            doc.setFontSize(22);
            doc.text('GLOBAL OPERATIONAL MASTER LOG', 14, 22);

            const tableHeaders = [['Date', 'Name', 'Type', 'Attendees']];
            const tableData = activities
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(a => {
                    const rec = attendance.find(at => at.activityId === a.id);
                    return [a.date, a.name, a.type, rec ? rec.count : 0];
                });

            autoTable(doc, {
                startY: 35,
                head: tableHeaders,
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [0, 112, 243] }
            });

            doc.save('LRC_Global_Activity_Log.pdf');
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
};
