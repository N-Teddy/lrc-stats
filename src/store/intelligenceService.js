import { dataService } from './dataService';

/**
 * Intelligence Service for Phase 2: Personnel Classification & Ranking
 */
export const intelligenceService = {
    /**
     * Calculates the vitality ranking for all personnel based on attendance
     */
    getVitalityRankings: async () => {
        try {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            // Filter for recent activities (last 10 sessions or last 6 months)
            // For now, let's take the last 10 activities to establish a trend
            const recentActivities = activities
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);

            const recentActivityIds = recentActivities.map(a => a.id);
            const activityCount = recentActivityIds.length;

            if (activityCount === 0) {
                return people.map(p => ({ ...p, vitality: 'Active' })); // Default
            }

            return people.map(person => {
                // Count presence in recent activities - correctly parsing the activity-based personIds array
                const presenceCount = attendance.filter(record =>
                    recentActivityIds.includes(record.activityId) &&
                    Array.isArray(record.personIds) && record.personIds.includes(person.id)
                ).length;

                const attendanceRate = (presenceCount / activityCount) * 100;

                let vitality = 'Inactive';
                let color = 'var(--text-muted)';

                if (attendanceRate >= 80) {
                    vitality = 'Very Active';
                    color = 'var(--accent-green)';
                } else if (attendanceRate >= 40) {
                    vitality = 'Active';
                    color = 'var(--accent-primary)';
                } else {
                    vitality = 'Inactive';
                    color = '#ff4d4d'; // Red for inactivity signals
                }

                // AI-Lite Forecasting: Compare last 3 sessions vs previous 3 sessions
                const latestThree = recentActivityIds.slice(0, 3);
                const previousThree = recentActivityIds.slice(3, 6);

                let forecastStatus = 'Stable';
                if (latestThree.length > 0 && previousThree.length > 0) {
                    const latestCount = attendance.filter(r => latestThree.includes(r.activityId) && r.personIds?.includes(person.id)).length;
                    const previousCount = attendance.filter(r => previousThree.includes(r.activityId) && r.personIds?.includes(person.id)).length;

                    const latestRate = latestCount / latestThree.length;
                    const previousRate = previousCount / previousThree.length;

                    if (latestRate < previousRate && (previousRate - latestRate) > 0.2) {
                        forecastStatus = 'Drop Risk';
                    } else if (latestRate > previousRate && (latestRate - previousRate) > 0.2) {
                        forecastStatus = 'Growing';
                    }
                }

                return {
                    ...person,
                    vitality,
                    vitalityColor: color,
                    attendanceRate: Math.round(attendanceRate),
                    forecastStatus
                };
            });
        } catch (err) {
            console.error('Vitality Calculation Error:', err);
            return [];
        }
    }
};
