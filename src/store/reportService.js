import jsPDF from 'jspdf';
import * as autoTableModule from 'jspdf-autotable';
const autoTable = autoTableModule.default || autoTableModule;
import { dataService } from './dataService';
import { notificationService } from './notificationService';

const COLORS = [
    [0, 210, 255],   // Cyan
    [121, 40, 202],  // Purple
    [57, 255, 20],   // Green
    [255, 0, 128],   // Pink
    [255, 170, 0]    // Orange
];

const calculateEngagement = (attendanceCount, activityCount) => {
    if (activityCount === 0) return 'Inactive';
    const rate = (attendanceCount / activityCount) * 100;
    if (rate >= 75) return 'Very Active';
    if (rate >= 40) return 'Active';
    return 'Inactive';
};

export const reportService = {
    /**
     * Master Yearly Attendance Audit
     */
    generateYearlyReport: async (config) => {
        const { years, sortBy, order } = config;
        try {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            doc.setFontSize(20);
            doc.text('LRC DOUALA - JRs YEARLY ATTENDANCE REPORT', 14, 20);
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()} | Scope: ${years.join(', ')}`, 14, 26);

            let currentY = 35;

            for (let i = 0; i < years.length; i++) {
                const year = years[i];
                const color = COLORS[i % COLORS.length];

                const filteredActivities = activities
                    .filter(a => !a.isDeleted && new Date(a.date).getFullYear().toString() === year.toString())
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                if (filteredActivities.length === 0) continue;

                const activePeople = people.filter(p => !p.isArchived && !p.isDeleted);

                let tableData = activePeople.map(person => {
                    let row = { name: person.name };
                    let total = 0;
                    filteredActivities.forEach(act => {
                        const actAttendance = attendance.find(attr => attr.activityId === act.id);
                        const isPresent = actAttendance && actAttendance.personIds.includes(person.id);
                        row[act.id] = isPresent ? 'X' : '-';
                        if (isPresent) total++;
                    });
                    row.total = total;
                    return row;
                });

                // Sorting
                tableData.sort((a, b) => {
                    if (sortBy === 'name') {
                        return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                    } else {
                        return order === 'asc' ? a.total - b.total : b.total - a.total;
                    }
                });

                doc.setFontSize(14);
                doc.setTextColor(color[0], color[1], color[2]);
                doc.text(`AUDIT CYCLE: ${year}`, 14, currentY);

                const columns = [
                    { header: 'ASSET NAME', dataKey: 'name' },
                    ...filteredActivities.map(a => ({ header: a.date.substring(5, 10), dataKey: a.id })),
                    { header: 'TOTAL', dataKey: 'total' }
                ];

                autoTable(doc, {
                    startY: currentY + 5,
                    columns: columns,
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: color, textColor: [255, 255, 255], fontSize: 7 },
                    styles: { fontSize: 7, cellPadding: 2 },
                    margin: { bottom: 20 },
                    didDrawPage: (data) => { currentY = data.cursor.y + 15; }
                });

                if (currentY > 170 && i < years.length - 1) {
                    doc.addPage();
                    currentY = 20;
                }
            }

            doc.save(`LRC_Yearly_Audit_${years.join('_')}.pdf`);
            notificationService.notify('Audit Exported', `Yearly report for ${years.join(', ')} generated.`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    },

    /**
     * Personnel Directory Audit (Liste Report)
     */
    generateDirectoryReport: async (config) => {
        const { sortBy, order, fields } = config;
        try {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            doc.setFontSize(22);
            doc.text('LRC DOUALA - JRs LISTE REPORT', 14, 22);

            const activePeople = people.filter(p => !p.isArchived && !p.isDeleted);
            const validActivities = activities.filter(a => !a.isDeleted);

            let tableData = activePeople.map(p => {
                const pAttendance = attendance.filter(att => att.personIds.includes(p.id)).length;
                const status = calculateEngagement(pAttendance, validActivities.length);
                const percentage = validActivities.length > 0 ? Math.round((pAttendance / validActivities.length) * 100) : 0;

                return {
                    ...p,
                    engagement: status,
                    attendanceCount: pAttendance,
                    percentage: `${percentage}%`
                };
            });

            // Sorting
            tableData.sort((a, b) => {
                if (sortBy === 'name') return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                if (sortBy === 'attendance') return order === 'asc' ? a.attendanceCount - b.attendanceCount : b.attendanceCount - a.attendanceCount;
                if (sortBy === 'status') return order === 'asc' ? a.engagement.localeCompare(b.engagement) : b.engagement.localeCompare(a.engagement);
                return 0;
            });

            const head = [['Name', 'Status']];
            if (fields.status) head[0].push('Engagement');
            if (fields.integration) head[0].push('Joined');
            if (fields.percentage) head[0].push('Rate %');

            const body = tableData.map(p => {
                const row = [p.name, p.status || 'Membre'];
                if (fields.status) row.push(p.engagement);
                if (fields.integration) row.push(p.dateIntegration || '---');
                if (fields.percentage) row.push(p.percentage);
                return row;
            });

            autoTable(doc, {
                startY: 35,
                head: head,
                body: body,
                theme: 'striped',
                headStyles: { fillColor: [0, 0, 0] },
                styles: { fontSize: 9 }
            });

            doc.save('LRC_Personnel_Liste.pdf');
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    },

    /**
     * Individual Performance Audit (Personal Report)
     */
    generatePersonReport: async (person, config) => {
        const { years, includeTypes, sortBy, order, fields } = config;
        try {
            const [activities, attendance] = await Promise.all([
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            doc.setFontSize(22);
            doc.text('LRC DOUALA - JRs PERSONAL REPORT', 14, 22);

            doc.setFontSize(16);
            doc.setTextColor(0, 210, 255);
            doc.text(person.name.toUpperCase(), 14, 32);

            let history = activities
                .filter(a => {
                    const year = new Date(a.date).getFullYear().toString();
                    const isYearMatch = years.length === 0 || years.includes(year);
                    const isTypeMatch = includeTypes.includes(a.type);
                    return isYearMatch && isTypeMatch && !a.isDeleted;
                })
                .map(a => {
                    const isPresent = attendance.find(att => att.activityId === a.id)?.personIds.includes(person.id);
                    return { ...a, status: isPresent ? 'PRESENT' : 'ABSENT' };
                });

            // Sorting
            history.sort((a, b) => {
                if (sortBy === 'date') return order === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
                if (sortBy === 'status') return order === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
                return 0;
            });

            autoTable(doc, {
                startY: 45,
                head: [['Date', 'Activity', 'Type', 'Status']],
                body: history.map(h => [h.date, h.name, h.type, h.status]),
                theme: 'striped',
                headStyles: { fillColor: [0, 0, 0] },
                columnStyles: {
                    3: { fontStyle: 'bold' }
                },
                didParseCell: (data) => {
                    if (data.column.index === 3 && data.cell.raw === 'PRESENT') data.cell.styles.textColor = [0, 150, 0];
                    if (data.column.index === 3 && data.cell.raw === 'ABSENT') data.cell.styles.textColor = [200, 0, 0];
                }
            });

            doc.save(`Personal_Audit_${person.name.replace(/\s+/g, '_')}.pdf`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    },

    /**
     * Mission Session Documentation
     */
    generateActivityToken: async (activity, attendees) => {
        try {
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            doc.setFontSize(20);
            doc.text('LRC DOUALA - JRs ACTIVITY ATTENDANCE REPORT', 105, 22, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(100);
            doc.text(`${activity.name} | ${activity.date}`, 105, 30, { align: 'center' });

            autoTable(doc, {
                startY: 40,
                head: [['#', 'Name', 'Status', 'Phone']],
                body: attendees.map((p, i) => [i + 1, p.name, p.status || 'Membre', p.phone || '---']),
                theme: 'grid',
                headStyles: { fillColor: [0, 112, 243] }
            });

            doc.save(`Activity_Log_${activity.name.replace(/\s+/g, '_')}.pdf`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
};
