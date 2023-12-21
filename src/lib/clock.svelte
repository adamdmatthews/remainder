<script lang="ts">
    import { format } from "date-fns";

    export let date: Date;
    $: formattedTime = format(date, 'HH:mm:ss');
</script>

<h2>Time: {formattedTime}</h2>
