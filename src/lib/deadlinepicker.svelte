<script lang=ts>
    import { addMinutes, format, parse } from "date-fns";
    import { createEventDispatcher } from "svelte";

    export let deadline: Date;
    let formattedDeadline = "";
    let editing = false;
    let formatError = false;
    $: {
        if (!editing) {
            formattedDeadline = format(deadline, 'HH:mm:ss')
        }
    }
    const despatch = createEventDispatcher<{update: Date}>();

    function updateDeadline(minutes: number) {
        const newDate = addMinutes(deadline, minutes);
        despatch('update', newDate);
    }

    function beginEditing() {
        if (!editing) {
            editing = true;
            formattedDeadline = format(deadline, 'yyyy/MM/dd HH:mm:ss');
        }
    }

    function completeEditing() {
        const newDate = parse(formattedDeadline, 'yyyy/MM/dd HH:mm:ss', deadline);
        if (!isNaN(newDate.getTime())) {
            formatError = false;
            despatch('update', newDate);
            editing = false;
        } else {
            formatError = true;
        }
    }
</script>

<div class='flex items-center'>
    <button disabled={editing} class="btn m-2" on:click={() => updateDeadline(-5)}>-5</button>
    <h2>Deadline: </h2>
    <input type="text" class="input input-ghost" on:focus={beginEditing} on:focusout={completeEditing} bind:value={formattedDeadline}/>
    <button disabled={editing} class="btn m-2" on:click={() => updateDeadline(5)}>+5</button>
</div>
{#if formatError}
    <div class="label">
        <span class="label-text-alt text-error">Deadline must be yyyy/MM/dd HH:mm:ss</span>
    </div>
{/if}
