<script lang="ts">
    import { onMount } from "svelte";
    import { format } from 'date-fns/format';

    let date = new Date();
    $: formatted_time = format(date, 'HH:mm:ss');

    onMount(() => {
        const interval = setInterval(() => {
            date = new Date();
        }, 100);
        return () => clearInterval(interval);
    })
</script>

<h1>{formatted_time}</h1>
