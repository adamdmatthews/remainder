<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { Task } from "./types/task";
    import Countdown from "./countdown.svelte";

    type DispatchEvents = {
        createTask: Task,
        deleteTask: Task,
        startTask: number | undefined
    }
    const dispatch = createEventDispatcher<DispatchEvents>();

    export let selectedTask: number | undefined;
    export let millisecondsRemaining: number;
    export let tasks: Task[];
    $: tasksWithTimeRemining = calculateTimeRemaining(tasks);

    let maxId = tasks.map(t => t.id).reduce((a, b) => Math.max(a, b), 0);

    function addTask() {
        const id = ++maxId;
        dispatch('createTask', {id, title: 'New task ' + id, timeElapsed: 0});
    }

    function deleteTask(task: Task) {
        dispatch('deleteTask', task);
    }

    function startTask(task: DispatchEvents['startTask']) {
        dispatch('startTask', task);
    }

    function calculateTimeRemaining(tasks: Task[]) {
        const maxTimeElapsed = millisecondsRemaining / tasks.length; // give this a better name
        const totalTimeElapsed = tasks.map(t => Math.min(maxTimeElapsed, t.timeElapsed)).reduce((a, b) => a + b, 0);
        const timePerTask = (millisecondsRemaining + totalTimeElapsed) / tasks.length;
        return tasks.map(t => ({...t, millisecondsRemaining: timePerTask - t.timeElapsed}));
    }
</script>

<table class="table">
    <thead>
        <tr>
            <th>Title</th>
            <th>Time left</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each tasksWithTimeRemining as task}
            <tr>
                <td>{task.title}</td>
                <td>
                    <Countdown milliseconds={task.millisecondsRemaining} />
                </td>
                <td>
                    {#if selectedTask === task.id}
                        <button class="btn btn-sm" on:click={() => startTask(undefined)}>Stop</button>
                    {:else}
                        <button class="btn btn-sm" on:click={() => startTask(task.id)}>Start</button>
                    {/if}
                    <button class="btn btn-sm" on:click={() => deleteTask(task)}>x</button>
                </td>
            </tr>
        {/each}
    </tbody>
</table>
<div class="flex justify-center p-3">
    <button class="btn" on:click={addTask}>Add task</button>
</div>
