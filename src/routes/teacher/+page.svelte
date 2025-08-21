<script>
  import { page } from '$app/stores';
  import { TextFieldOutlined, Button, Card } from 'm3-svelte';
  import { onMount } from 'svelte';

  let roomId = '';
  let linkUrl = '';
  let isConnected = false;
  let statusMessage = '';

  onMount(() => {
    roomId = $page.url.searchParams.get('roomid') || '';
    if (!roomId) {
      statusMessage =
        'Nincs szoba azonosító megadva. Kérlek add hozzá a ?roomid=szobád paramétert az URL-hez.';
      return;
    }
    statusMessage = `Csatlakozva a szobához: ${roomId}`;
    isConnected = true;
  });

  async function sendLink() {
    if (!linkUrl.trim()) {
      statusMessage = 'Kérlek adj meg egy érvényes URL-t';
      return;
    }

    try {
      const response = await fetch('/api/send-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          url: linkUrl.trim(),
        }),
      });

      if (response.ok) {
        statusMessage = `Link elküldve minden diáknak a ${roomId} szobában`;
        linkUrl = '';
      } else {
        statusMessage = 'Nem sikerült elküldeni a linket. Kérlek próbáld újra.';
      }
    } catch (error) {
      statusMessage = 'Hiba történt a link küldése során. Kérlek próbáld újra.';
    }
  }
</script>

<div class="container">
  <Card variant="elevated" class="teacher-card">
    <div class="card-content">
      <h1 class="m3-font-display-medium center">Link küldése</h1>

      {#if roomId}
        <p class="m3-font-body-large room-info">
          Szoba azonosító: <strong>{roomId}</strong>
        </p>
      {/if}

      <div class="form-section">
        <TextFieldOutlined
          label="Add meg az URL-t amit elküldesz a diákoknak"
          bind:value={linkUrl}
          disabled={!isConnected}
          placeholder="https://pelda.hu"
        />

        <Button
          variant="filled"
          onclick={sendLink}
          disabled={!isConnected || !linkUrl.trim()}
        >
          Link küldése a diákoknak
        </Button>
      </div>

      {#if statusMessage}
        <div class="status-message">
          <p class="m3-font-body-medium">{statusMessage}</p>
        </div>
      {/if}
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

  :global(.teacher-card) {
    width: 100%;
    max-width: 500px;
  }

  .card-content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card-content h1 {
    text-align: center;
    margin: 0 auto;
  }

  .room-info {
    text-align: center;
    color: rgb(var(--m3-scheme-primary));
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .status-message {
    padding: 1rem;
    border-radius: var(--m3-util-rounding-medium);
    background: rgb(var(--m3-scheme-surface-container));
    text-align: center;
  }
</style>
