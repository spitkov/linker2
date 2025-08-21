<script>
  import { page } from '$app/stores';
  import { Card, LoadingIndicator } from 'm3-svelte';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  let roomId = '';
  let statusMessage = 'Csatlakozás...';
  let isConnected = false;
  let eventSource = null;

  onMount(() => {
    roomId = $page.url.searchParams.get('roomid') || '';
    if (!roomId) {
      statusMessage =
        'Nincs szoba azonosító megadva. Kérlek add hozzá a ?roomid=szobád paramétert az URL-hez.';
      return;
    }

    connectToRoom();
  });

  onDestroy(() => {
    if (eventSource) {
      eventSource.close();
    }
  });

  function connectToRoom() {
    if (!browser) return;

    statusMessage = `Csatlakozás a szobához: ${roomId}...`;

    eventSource = new EventSource(`/api/listen?roomid=${roomId}`);

    eventSource.onopen = () => {
      isConnected = true;
      statusMessage = `Csatlakozva a szobához: ${roomId}. Várakozás a tanárra...`;
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'redirect' && data.url) {
          statusMessage = `Átirányítás ide: ${data.url}`;
          setTimeout(() => {
            window.location.href = data.url;
          }, 1000);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    eventSource.onerror = () => {
      isConnected = false;
      statusMessage = 'Kapcsolat megszakadt. Újracsatlakozás...';
      setTimeout(() => {
        if (eventSource) {
          eventSource.close();
        }
        connectToRoom();
      }, 3000);
    };
  }
</script>

<div class="container">
  <Card variant="elevated" class="student-card">
    <div class="card-content">
      <div class="status-section">
        {#if roomId}
          <p class="m3-font-body-large room-info">
            Szoba azonosító: <strong>{roomId}</strong>
          </p>
        {/if}
        {#if isConnected}
          <LoadingIndicator container />
        {/if}
        <p class="m3-font-body-medium status-text">{statusMessage}</p>
      </div>
    </div>
  </Card>
</div>

<style>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 1rem;
    background: rgb(var(--m3-scheme-background));
  }

  :global(.student-card) {
    width: 100%;
    max-width: 500px;
  }

  .card-content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .room-info {
    color: rgb(var(--m3-scheme-primary));
  }

  .status-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: var(--m3-util-rounding-medium);
    background: rgb(var(--m3-scheme-surface-container));
  }

  .status-text {
    color: rgb(var(--m3-scheme-on-surface-variant));
  }

</style>
