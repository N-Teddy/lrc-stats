/**
 * Service for handling in-app tactical notifications and confirmations
 */
export const notificationService = {
    /**
     * Sends an in-app tactical notification
     */
    notify: (title, body, type = 'info') => {
        const event = new CustomEvent('lrc-notify', {
            detail: { title, body, type }
        });
        window.dispatchEvent(event);
    },

    /**
     * Triggers a tactical confirmation modal
     * Returns a Promise that resolves to true (Confirm) or false (Cancel)
     */
    confirm: (title, body, confirmText = 'Confirm', cancelText = 'Cancel') => {
        return new Promise((resolve) => {
            const event = new CustomEvent('lrc-confirm', {
                detail: { title, body, confirmText, cancelText, resolve }
            });
            window.dispatchEvent(event);
        });
    },

    /**
     * Triggers a tactical input prompt modal
     * Returns a Promise that resolves to the input value (string) or null (Cancel)
     */
    prompt: (title, body, placeholder = '', defaultValue = '', inputType = 'text') => {
        return new Promise((resolve) => {
            const event = new CustomEvent('lrc-prompt', {
                detail: { title, body, placeholder, defaultValue, inputType, resolve }
            });
            window.dispatchEvent(event);
        });
    },

    /**
     * Initialization (Legacy - check for permissions if needed, but not for in-app)
     */
    init: async () => {
        return true;
    },

    /**
     * Checks for birthdays today and notifies if any
     */
    checkBirthdays: async (people) => {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();

        const birthdayPeeps = people.filter(p => {
            if (!p.dob) return false;
            const dob = new Date(p.dob);
            return dob.getMonth() === todayMonth && dob.getDate() === todayDate;
        });

        if (birthdayPeeps.length > 0) {
            const names = birthdayPeeps.map(p => p.name).join(', ');
            notificationService.notify(
                '🎂 Birthday Celebration!',
                `Today is the birthday of: ${names}. Don't forget to celebrate!`
            );
        }
    },

    /**
     * Checks for unlocked past activities and notifies
     */
    checkUnlockedActivities: async (activities, attendance) => {
        const today = new Date();
        const pending = activities.filter(a => {
            if (a.isDeleted) return false;
            const actDate = new Date(a.date);
            const isPast = actDate < today;
            const isLocked = attendance.some(att => att.activityId === a.id && att.isLocked);
            return isPast && !isLocked;
        });

        if (pending.length > 0) {
            notificationService.notify(
                '🔒 Attendance Audit Required',
                `There are ${pending.length} past ${pending.length === 1 ? 'activity' : 'activities'} with unlocked attendance. Please finalize them.`
            );
        }
    }
};
