import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

/**
 * Service for handling system-level push notifications
 */
export const notificationService = {
    /**
     * Checks and requests permission for notifications
     */
    init: async () => {
        try {
            let permissionGranted = await isPermissionGranted();
            if (!permissionGranted) {
                const permission = await requestPermission();
                permissionGranted = permission === 'granted';
            }
            return permissionGranted;
        } catch (err) {
            console.error('Notification Init Error:', err);
            return false;
        }
    },

    /**
     * Sends a persistent notification
     */
    notify: async (title, body) => {
        try {
            const hasPermission = await isPermissionGranted();
            if (hasPermission) {
                // Using a unique ID and sound helps persistence on some Linux/Windows environments
                sendNotification({
                    id: Math.floor(Date.now() / 1000) % 2147483647, // Ensure it is a valid i32
                    title,
                    body,
                    sound: 'default'
                });
            } else {
                console.warn('Notification permission not granted.');
            }
        } catch (err) {
            console.error('Notification Send Error:', err);
        }
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
    }
};
