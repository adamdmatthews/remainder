<script lang=ts>
    import { format } from "date-fns";
    import { createEventDispatcher } from "svelte";

    export let deadline: Date;
    const despatch = createEventDispatcher<{update: number}>();

    function updateDeadline(mins: number) {
        despatch('update', mins);
    }
</script>

<div class='flex items-center'>
    <button class="btn m-2" on:click={() => updateDeadline(-5)}>-5</button>
    <h2>Deadline: {format(deadline, 'HH:mm:ss')}</h2>
    <button class="btn m-2" on:click={() => updateDeadline(5)}>+5</button>
</div>
