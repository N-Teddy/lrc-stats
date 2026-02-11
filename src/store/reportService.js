import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dataService } from './dataService';

/**
 * Service for generating PDF reports for LRC Stats
 */
export const reportService = {
    /**
     * Generates a comprehensive yearly attendance report
     */
    generateYearlyReport: async (year = new Date().getFullYear()) => {
        try {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            // Optimization: If there are too many activities, we might want landscape
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

            // Header
            doc.setFontSize(22);
            doc.setTextColor(0, 0, 0);
            doc.text('LRC MISSION - YEARLY ATTENDANCE AUDIT', 14, 22);

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Report Period: January ${year} - December ${year}`, 14, 30);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

            // Detailed Table
            const tableHeaders = [['Person Name', ...filteredActivities.map(a => a.date.substring(5, 10)), 'Total']];
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

            autoTable(doc, {
                startY: 45,
                head: tableHeaders,
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 6 },
                styles: { fontSize: 6, cellPadding: 1 },
                columnStyles: { 0: { fontStyle: 'bold', fontSize: 7, cellWidth: 'wrap' } },
                margin: { top: 45 }
            });

            const finalY = (doc.lastAutoTable?.finalY || 50) + 10;

            // Success! Save the file.
            // In some Tauri versions, doc.save() triggers a download,
            // but we can also use writeFile to AppData if preferred.
            doc.save(`LRC_Yearly_Audit_${year}.pdf`);
            console.log('PDF generated successfully');
            return true;
        } catch (err) {
            console.error('PDF Generation Error:', err);
            alert(`Failed to generate PDF: ${err.message}`);
            return false;
        }
    }
};
