import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { dataService } from './dataService';
import { notificationService } from './notificationService';

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

            doc.autoTable({
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
            notificationService.notify('Report Exported', `Yearly Audit for ${year} has been generated.`);
            console.log('PDF generated successfully');
            return true;
        } catch (err) {
            console.error('PDF Generation Error:', err);
            alert(`Failed to generate PDF: ${err.message}`);
            return false;
        }
    },

    /**
     * Generates an individual member's attendance deep-dive
     */
    generatePersonReport: async (person, history, stats) => {
        try {
            const doc = new jsPDF({
                unit: 'mm',
                format: 'a4'
            });

            // Technical Header
            doc.setFontSize(24);
            doc.setTextColor(0, 0, 0);
            doc.text('PERSONNEL PERFORMANCE AUDIT', 14, 25);

            doc.setDrawColor(0, 210, 255);
            doc.setLineWidth(1);
            doc.line(14, 30, 60, 30);

            // Member Info Card
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text(person.name.toUpperCase(), 14, 45);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`STATUS: ${person.status || 'Membre'}`, 14, 52);
            doc.text(`INTEGRATION: ${person.dateIntegration || '---'}`, 14, 57);
            doc.text(`PHONE: ${person.phone || 'N/A'}`, 14, 62);

            // High-Precision Stats
            doc.setFillColor(245, 245, 245);
            doc.rect(130, 40, 65, 30, 'F');
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('ENGAGEMENT RATE', 135, 48);
            doc.setFontSize(18);
            doc.setTextColor(0, 210, 255);
            doc.text(`${stats.rate}%`, 135, 58);

            // Timeline Header
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('OPERATIONAL PARTICIPATION HISTORY', 14, 80);

            const tableHeaders = [['Date', 'Activity Name', 'Status']];
            const tableData = history.map(h => [h.date, h.name, 'PRESENT']);

            doc.autoTable({
                startY: 85,
                head: tableHeaders,
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 9 },
                styles: { fontSize: 9, cellPadding: 4 },
                columnStyles: { 2: { fontStyle: 'bold', textColor: [0, 150, 0] } }
            });

            doc.save(`Personnel_Audit_${person.name.replace(/\s+/g, '_')}.pdf`);
            notificationService.notify('Audit Exported', `Individual report for ${person.name} is ready.`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    },

    /**
     * Generates a session attendance token for official records
     */
    generateActivityToken: async (activity, attendees) => {
        try {
            const doc = new jsPDF({
                unit: 'mm',
                format: 'a4'
            });

            // Design Borders
            doc.setDrawColor(200, 200, 200);
            doc.rect(5, 5, 200, 287);

            // Header
            doc.setFontSize(26);
            doc.setTextColor(0, 0, 0);
            doc.text('SESSION ATTENDANCE TOKEN', 105, 30, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('OFFICIAL OPERATIONAL RECORD', 105, 38, { align: 'center' });

            // Activity Info Box
            doc.setFillColor(240, 250, 255);
            doc.rect(20, 50, 170, 35, 'F');

            doc.setFontSize(16);
            doc.setTextColor(0, 50, 100);
            doc.text(activity.name, 25, 62);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`DATE: ${activity.date}`, 25, 72);
            doc.text(`TYPE: ${activity.type}`, 25, 78);

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(`Total Count: ${attendees.length}`, 185, 70, { align: 'right' });

            // Attendee List
            const tableHeaders = [['#', 'Name', 'Status', 'Signature']];
            const tableData = attendees.map((p, i) => [i + 1, p.name, p.status || 'Membre', '_________________']);

            doc.autoTable({
                startY: 95,
                head: tableHeaders,
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [0, 50, 100], textColor: [255, 255, 255] },
                styles: { fontSize: 10, cellPadding: 5 }
            });

            doc.save(`Activity_Token_${activity.name.replace(/\s+/g, '_')}.pdf`);
            notificationService.notify('Token Generated', `Attendance token for ${activity.name} has been created.`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    },

    /**
     * Generates a full personnel directory export
     */
    generateDirectoryReport: async (people) => {
        try {
            const doc = new jsPDF({
                unit: 'mm',
                format: 'a4'
            });

            // Branding Header
            doc.setFontSize(22);
            doc.setTextColor(0, 0, 0);
            doc.text('LRC MISSION - GLOBAL PERSONNEL DIRECTORY', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Official Export: ${new Date().toLocaleDateString()}`, 14, 28);
            doc.text(`Total Active Network: ${people.filter(p => !p.isArchived).length}`, 14, 34);

            const tableHeaders = [['Name', 'Status', 'Segment', 'Phone', 'Integration']];
            const tableData = people
                .filter(p => !p.isArchived)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(p => [
                    p.name,
                    p.status || 'Membre',
                    p.isJRs ? 'JRs' : 'Adult',
                    p.phone || '---',
                    p.dateIntegration || '---'
                ]);

            doc.autoTable({
                startY: 45,
                head: tableHeaders,
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 9 },
                styles: { fontSize: 8, cellPadding: 3 }
            });

            doc.save('LRC_Personnel_Directory.pdf');
            notificationService.notify('Directory Exported', 'The global personnel directory has been saved.');
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    },

    /**
     * Generates a custom report for selected people and date range
     */
    generateCustomReport: async (selectedPeople, startDate, endDate) => {
        try {
            const [activities, attendance] = await Promise.all([
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Filter activities by date range
            const filteredActivities = activities
                .filter(a => {
                    const activityDate = new Date(a.date);
                    return activityDate >= new Date(startDate) && activityDate <= new Date(endDate);
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            if (filteredActivities.length === 0) {
                alert('No activities found in the selected date range.');
                return false;
            }

            // Header
            doc.setFontSize(22);
            doc.text('LRC - CUSTOM OPERATIONAL AUDIT', 14, 22);
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
            doc.text(`Personnel Assets: ${selectedPeople.length}`, 14, 35);

            // Table
            const tableHeaders = [['Asset Name', ...filteredActivities.map(a => a.name.substring(0, 10)), 'Count']];
            const tableData = selectedPeople.map(person => {
                let row = [person.name];
                let count = 0;
                filteredActivities.forEach(act => {
                    const actAttendance = attendance.find(attr => attr.activityId === act.id);
                    const isPresent = actAttendance && actAttendance.personIds.includes(person.id);
                    row.push(isPresent ? 'X' : '-');
                    if (isPresent) count++;
                });
                row.push(count.toString());
                return row;
            });

            doc.autoTable({
                startY: 45,
                head: tableHeaders,
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 7 },
                styles: { fontSize: 7, cellPadding: 2 },
                margin: { top: 45 }
            });

            doc.save(`LRC_Custom_Audit_${Date.now()}.pdf`);
            notificationService.notify('Custom Report Exported', 'The requested operational audit has been generated.');
            return true;
        } catch (err) {
            console.error('Custom PDF Error:', err);
            return false;
        }
    }
};
