<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { Task, TaskWithDeadile } from "./types/task";
    import Countdown from "./countdown.svelte";

    type DispatchEvents = {
        createTask: Task,
        deleteTask: Task
    }
    const dispatch = createEventDispatcher<DispatchEvents>();

    export let date: Date;
    export let tasks: TaskWithDeadile[];

    let maxId = tasks.map(t => t.id).reduce((a, b) => Math.max(a, b), 0);

    function addTask() {
        const id = ++maxId;
        dispatch('createTask', {id, title: 'New task ' + id});
    }

    function deleteTask(task: Task) {
        dispatch('deleteTask', task);
    }
</script>

<table class="table">
    <thead>
        <tr>
            <th>Title</th>
            <th>Deadline</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each tasks as task}
            <tr>
                <td>{task.title}</td>
                <td>
                    <Countdown date={date} deadline={task.deadline} />
                </td>
                <td>
                    <button class="btn btn-sm" on:click={() => deleteTask(task)}>x</button>
                </td>
            </tr>
        {/each}
    </tbody>
</table>
<div class="flex justify-center p-3">
    <button class="btn" on:click={addTask}>Add task</button>
</div>
