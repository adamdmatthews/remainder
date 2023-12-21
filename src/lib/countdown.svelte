<script lang="ts">
    import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, hoursToMinutes, hoursToSeconds, minutesToSeconds } from "date-fns";

    export let date: Date;
    export let deadline: Date;

    $: timeRemaining = formatTimeRemaining(date, deadline);
    function formatTimeRemaining(date: Date, deadline: Date) {
        if (date > deadline) {
            return 'Deadline passed';
        }
        if (differenceInDays(deadline, date) > 0) {
            return 'Over a day';
        }
        const hours = differenceInHours(deadline, date, { roundingMethod: 'floor' });
        const minutes = differenceInMinutes(deadline, date, { roundingMethod: 'floor' }) - hoursToMinutes(hours);
        const seconds = differenceInSeconds(deadline, date, { roundingMethod: 'floor' }) - hoursToSeconds(hours) - minutesToSeconds(minutes) + 1;
        return `${hours}h ${minutes}m ${seconds}s`;
    }
</script>

<h2>Time remaining: {timeRemaining}</h2>
