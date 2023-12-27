<script lang="ts">
    import { onMount } from "svelte";
    import { addHours, addMinutes, differenceInMilliseconds, roundToNearestMinutes, secondsToMilliseconds } from 'date-fns';
    import Deadlinepicker from "$lib/deadlinepicker.svelte";
    import Clock from "$lib/clock.svelte";
    import Countdown from "$lib/countdown.svelte";
    import Tasklist from "$lib/tasklist.svelte";
    import type { Task } from "$lib/types/task";

    let date = new Date();
    let deadline = roundToNearestMinutes(addHours(new Date(), 1), { nearestTo: 5 });
    $: millisecondsToDeadline = differenceInMilliseconds(deadline, date) + secondsToMilliseconds(1);
    let tasks: Task[] = [];
    let selectedTask: number | undefined;

    onMount(() => {
        const interval = setInterval(poll, 100);
        return () => clearInterval(interval);
    })

    function poll() {
        const newDate = new Date();
        const difference = differenceInMilliseconds(newDate, date);
        date = newDate;

        tasks = tasks.map((t) => t.id === selectedTask ? ({ ...t, timeElapsed: t.timeElapsed + difference }) : t);
    }

    function addToDeadline(mins: number) {
        deadline = addMinutes(deadline, mins);
    }

    function addTask(task: Task) {
        tasks = [...tasks, task];
    }

    function deleteTask(task: Task) {
        tasks = tasks.filter((t) => t.id !== task.id);
    }
</script>

<div class="flex h-screen p-12 gap-12 items-center">
    <div class="shadow-lg basis-96">
        <Tasklist selectedTask={selectedTask} millisecondsRemaining={millisecondsToDeadline} tasks={tasks} on:createTask={(e) => addTask(e.detail)} on:deleteTask={(e) => deleteTask(e.detail)} on:startTask={(e) => selectedTask = e.detail} />
    </div>
    <div class="grow flex items-center justify-center text-center shadow-lg">
        <div>
            <Clock date={date} />
            <Deadlinepicker deadline={deadline} on:update={(e) => addToDeadline(e.detail)} />
            <h2>Time remaining: <Countdown milliseconds={millisecondsToDeadline} /></h2>
        </div>
    </div>
</div>
