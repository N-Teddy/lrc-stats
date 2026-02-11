import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { dataService } from './dataService';

/**
 * Service for generating PDF reports for LRC Stats
 */
export const reportService = {
    /**
     * Generates a comprehensive yearly attendance report
     */
    generateYearlyReport: async (year = new Date().getFullYear()) => {
        const [people, activities, attendance] = await Promise.all([
            dataService.getPeople(),
            dataService.getActivities(),
            dataService.getAttendance()
        ]);

        const doc = new jsPDF();
        const activePeople = people.filter(p => !p.isArchived).sort((a, b) => a.name.localeCompare(b.name));
        const filteredActivities = activities
            .filter(a => new Date(a.date).getFullYear() === year)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Header
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.text('LRC MISSION - YEARLY ATTENDANCE AUDIT', 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Report Period: January ${year} - December ${year}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

        // Stats Summary
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 42, 196, 42);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Personnel: ${activePeople.length}`, 14, 50);
        doc.text(`Total Activities: ${filteredActivities.length}`, 14, 56);
        doc.text(`Avg. Presence: ${attendance.length > 0 ? Math.round(attendance.reduce((s, a) => s + a.count, 0) / attendance.length) : 0}`, 70, 50);

        // Detailed Table
        // Headers: Name | [Dates of Activities...] | Total
        const tableHeaders = [['Person Name', ...filteredActivities.map(a => a.name.substring(0, 5) + '.'), 'Total']];
        const tableData = activePeople.map(person => {
            let row = [person.name];
            let personTotal = 0;

            filteredActivities.forEach(act => {
                const actAttendance = attendance.find(attr => attr.activityId === act.id);
                const isPresent = actAttendance && actAttendance.personIds.includes(person.id);
                row.push(isPresent ? 'X' : '-');
                if (isPresent) personTotal++;
            });

            row.push(personTotal.toString());
            return row;
        });

        doc.autoTable({
            startY: 65,
            head: tableHeaders,
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 8 },
            styles: { fontSize: 7, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', fontSize: 8 } },
            margin: { top: 65 }
        });

        // Add Totals for Activities at the bottom
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text('Activity Presence Summary:', 14, finalY);

        const summaryData = filteredActivities.map(a => {
            const attr = attendance.find(at => at.activityId === a.id);
            return [`${a.date} - ${a.name}`, (attr?.count || 0).toString()];
        });

        doc.autoTable({
            startY: finalY + 5,
            head: [['Activity', 'Attendees']],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [50, 50, 50] },
            margin: { left: 14, right: 100 }
        });

        // Save
        doc.save(`LRC_Yearly_Audit_${year}.pdf`);
        return true;
    }
};
