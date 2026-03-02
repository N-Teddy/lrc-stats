import jsPDF from 'jspdf';
import * as autoTableModule from 'jspdf-autotable';
const autoTable = autoTableModule.default || autoTableModule;
import { dataService, getActivityTypeKey } from './dataService';
import { notificationService } from './notificationService';
import i18n from '../i18n/config';

const COLORS = [
    [0, 210, 255],   // Cyan
    [121, 40, 202],  // Purple
    [57, 255, 20],   // Green
    [255, 0, 128],   // Pink
    [255, 170, 0]    // Orange
];

const calculateEngagement = (attendanceCount, activityCount) => {
    if (activityCount === 0) return 'inactive';
    const rate = (attendanceCount / activityCount) * 100;
    if (rate >= 75) return 'very_active';
    if (rate >= 40) return 'active';
    return 'inactive';
};

const t = (key, options) => i18n.t(key, options);

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
            doc.text(t('reports.yearly_title'), 14, 20);
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(t('reports.generated_on', { date: new Date().toLocaleString(), scope: years.join(', ') }), 14, 26);

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
                doc.text(t('reports.audit_cycle', { year }), 14, currentY);

                const columns = [
                    { header: t('reports.asset_name'), dataKey: 'name' },
                    ...filteredActivities.map(a => ({ header: a.date.substring(5, 10), dataKey: a.id })),
                    { header: t('reports.total'), dataKey: 'total' }
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
            notificationService.notify(t('reports.notification_title'), t('reports.notification_msg', { years: years.join(', ') }));
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
            doc.text(t('reports.liste_title'), 14, 22);

            const activePeople = people.filter(p => !p.isArchived && !p.isDeleted);
            const validActivities = activities.filter(a => !a.isDeleted);

            let tableData = activePeople.map(p => {
                const pAttendance = attendance.filter(att => att.personIds.includes(p.id)).length;
                const statusKey = calculateEngagement(pAttendance, validActivities.length);
                const engagement = t(`reports.${statusKey}`);
                const percentage = validActivities.length > 0 ? Math.round((pAttendance / validActivities.length) * 100) : 0;

                return {
                    ...p,
                    engagement: engagement,
                    engagementKey: statusKey,
                    attendanceCount: pAttendance,
                    percentage: `${percentage}%`
                };
            });

            // Sorting
            tableData.sort((a, b) => {
                if (sortBy === 'name') return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                if (sortBy === 'attendance') return order === 'asc' ? a.attendanceCount - b.attendanceCount : b.attendanceCount - a.attendanceCount;
                if (sortBy === 'status') return order === 'asc' ? a.engagementKey.localeCompare(b.engagementKey) : b.engagementKey.localeCompare(a.engagementKey);
                return 0;
            });

            const head = [[t('reports.name'), t('reports.status')]];
            if (fields.status) head[0].push(t('reports.engagement'));
            if (fields.integration) head[0].push(t('reports.joined'));
            if (fields.percentage) head[0].push(t('reports.rate'));

            const body = tableData.map(p => {
                const status = (p.status || 'membre').toLowerCase();
                const row = [p.name, t(`directory.${status}`)];
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
            doc.text(t('reports.personal_title'), 14, 22);

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
                    return { ...a, status: isPresent ? 'PRESENT' : 'ABSENT', statusKey: isPresent ? 'present' : 'absent' };
                });

            // Sorting
            history.sort((a, b) => {
                if (sortBy === 'date') return order === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
                if (sortBy === 'status') return order === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
                return 0;
            });

            autoTable(doc, {
                startY: 45,
                head: [[t('reports.date'), t('reports.activity'), t('reports.type'), t('reports.status')]],
                body: history.map(h => [h.date, h.name, t(`activities.type_${getActivityTypeKey(h.type)}`), t(`reports.${h.statusKey}`)]),
                theme: 'striped',
                headStyles: { fillColor: [0, 0, 0] },
                columnStyles: {
                    3: { fontStyle: 'bold' }
                },
                didParseCell: (data) => {
                    if (data.column.index === 3 && data.cell.raw === t('reports.present')) data.cell.styles.textColor = [0, 150, 0];
                    if (data.column.index === 3 && data.cell.raw === t('reports.absent')) data.cell.styles.textColor = [200, 0, 0];
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
            doc.text(t('reports.activity_attendance_title'), 105, 22, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(100);
            doc.text(`${activity.name} | ${activity.date}`, 105, 30, { align: 'center' });

            autoTable(doc, {
                startY: 40,
                head: [[t('reports.count'), t('reports.name'), t('reports.status'), t('reports.phone')]],
                body: attendees.map((p, i) => [i + 1, p.name, t(`directory.${(p.status || 'membre').toLowerCase()}`), p.phone || '---']),
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
