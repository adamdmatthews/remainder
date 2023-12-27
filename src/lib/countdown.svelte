<script lang="ts">
    import { hoursToMilliseconds, hoursToMinutes, hoursToSeconds, millisecondsToHours, millisecondsToMinutes, millisecondsToSeconds, minutesToSeconds, secondsToHours, secondsToMinutes } from "date-fns";

    export let milliseconds: number;

    $: timeRemaining = formatTimeRemaining(milliseconds);
    function formatTimeRemaining(milliseconds: number) {
        if (milliseconds < 0) {
            return 'Deadline passed';
        }
        if (milliseconds > hoursToMilliseconds(24)) {
            return 'Over a day';
        }
        const hours = millisecondsToHours(milliseconds);
        const minutes = millisecondsToMinutes(milliseconds) - hoursToMinutes(hours);
        const seconds = millisecondsToSeconds(milliseconds) - hoursToSeconds(hours) - minutesToSeconds(minutes);
        return `${hours}h ${minutes}m ${seconds}s`;
    }
</script>

{timeRemaining}
