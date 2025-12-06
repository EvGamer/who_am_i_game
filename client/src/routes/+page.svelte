<script>
  import { PUBLIC_HOST } from "$env/static/public";

  let message = $state("standing by");

  $effect(() => {
    const hostname = window.location.hostname;
    const socket = new WebSocket(`http://${hostname}/api/`, ["ws"]);

    socket.addEventListener("message", (event) => {
      message = event.data;
    });
  })
</script>

<div>{message}</div>