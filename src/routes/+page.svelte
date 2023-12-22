<script lang="ts">
    import { onMount } from "svelte";
    import { addHours, addMinutes, roundToNearestMinutes } from 'date-fns';
    import Deadlinepicker from "$lib/deadlinepicker.svelte";
    import Clock from "$lib/clock.svelte";
    import Countdown from "$lib/countdown.svelte";

    let date = new Date();
    let deadline = roundToNearestMinutes(addHours(new Date(), 1), { nearestTo: 5 });

    onMount(() => {
        const interval = setInterval(() => {
            date = new Date();
        }, 100);
        return () => clearInterval(interval);
    })

    function addToDeadline(mins: number) {
        deadline = addMinutes(deadline, mins);
    }
</script>

<div class="h-screen flex items-center justify-center text-center">
    <div>
        <Clock date={date} />
        <Deadlinepicker deadline={deadline} on:update={(e) => addToDeadline(e.detail)} />
        <Countdown date={date} deadline={deadline} />
    </div>
</div>
