<script lang="ts">
    import { onMount } from "svelte";
    import { addHours, addMilliseconds, addMinutes, differenceInMilliseconds, roundToNearestMinutes } from 'date-fns';
    import Deadlinepicker from "$lib/deadlinepicker.svelte";
    import Clock from "$lib/clock.svelte";
    import Countdown from "$lib/countdown.svelte";
    import Tasklist from "$lib/tasklist.svelte";
    import type { Task } from "$lib/types/task";

    let date = new Date();
    let deadline = roundToNearestMinutes(addHours(new Date(), 1), { nearestTo: 5 });
    let tasks: Task[] = [];
    $: tasksWithDeadline = giveTasksDeadlines(tasks, date, deadline);

    onMount(() => {
        const interval = setInterval(() => {
            date = new Date();
        }, 100);
        return () => clearInterval(interval);
    })

    function addToDeadline(mins: number) {
        deadline = addMinutes(deadline, mins);
    }

    function addTask(task: Task) {
        tasks = [...tasks, task];
    }

    function deleteTask(task: Task) {
        tasks = tasks.filter((t) => t.id !== task.id);
    }

    function giveTasksDeadlines(tasks: Task[], currentTime: Date, deadline: Date) {
        const result = [];

        const millisRemaining = differenceInMilliseconds(deadline, currentTime);
        const millisPerTask = millisRemaining / tasks.length;
        let millis = 0;
        for (var i = 0; i < tasks.length; i++) {
            millis += millisPerTask;
            result.push({ ...tasks[i], deadline: addMilliseconds(currentTime, millis) });
        }

        return result;
    }
</script>

<div class="flex h-screen p-12 gap-12 items-center">
    <div class="shadow-lg basis-80">
        <Tasklist date={date} tasks={tasksWithDeadline} on:createTask={(e) => addTask(e.detail)} on:deleteTask={(e) => deleteTask(e.detail)} />
    </div>
    <div class="grow flex items-center justify-center text-center shadow-lg">
        <div>
            <Clock date={date} />
            <Deadlinepicker deadline={deadline} on:update={(e) => addToDeadline(e.detail)} />
            <h2>Time remaining: <Countdown date={date} deadline={deadline} /></h2>
        </div>
    </div>
</div>
