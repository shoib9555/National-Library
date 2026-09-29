import cron from "node-cron";

import {
    updateMembershipStatuses,
} from "../services/membershipService";

import {
    createFeeReminderNotifications,
    createOverdueNotifications,
    createMembershipExpiringNotifications,
} from "../services/notificationService";


export async function runMembershipStatusJob() {
    try {
        const membershipResult =
            await updateMembershipStatuses();

        console.log(
            "Membership status job:",
            membershipResult
        );

        const reminderResult =
            await createFeeReminderNotifications();

        console.log(
            "Fee reminder notification job:",
            reminderResult
        );

        const overdueResult =
            await createOverdueNotifications();

        console.log(
            "Overdue notification job:",
            overdueResult
        );

        const expiringResult =
            await createMembershipExpiringNotifications();

        console.log(
            "Membership expiring notification job:",
            expiringResult
        );

    } catch (error) {
        console.error(
            "Daily membership/notification job failed:",
            error
        );
    }
}

export function startMembershipStatusJob() {
    cron.schedule("0 0 * * *", async () => {
        await runMembershipStatusJob();
    });

    console.log(
        "Membership status and notification job scheduled successfully."
    );
}