<script>
  import { Button, Card, Chip } from 'm3-svelte';
  import { goto } from '$app/navigation';

  let selectedRoom = '';
  let selectedRole = '';

  const rooms = [
    {
      id: 'also-tagozat-foldszin',
      name: 'Also tagozat földszint',
      color: 'primary',
    },
    { id: 'also-tagozat-1-em', name: 'Also tagozat 1. em', color: 'secondary' },
    { id: 'felső-tagozat', name: 'Felső tagozat', color: 'tertiary' },
    { id: 'gimi', name: 'Gimi', color: 'primary' },
  ];

  const roles = [
    { id: 'teacher', name: 'Tanár', variant: 'filled' },
    { id: 'student', name: 'Diák', variant: 'outlined' },
  ];

  function selectRoom(roomId) {
    selectedRoom = roomId;
  }

  function selectRole(roleId) {
    selectedRole = roleId;
  }

  function joinRoom() {
    if (selectedRoom && selectedRole) {
      goto(`/${selectedRole}?roomid=${encodeURIComponent(selectedRoom)}`);
    }
  }
</script>

<div class="container">
  <Card variant="elevated" class="main-card">
    <div class="card-content">
      <h1 class="m3-font-display-large">Linker</h1>

      <div class="selection-section">
        <div class="room-selection">
          <h3 class="m3-font-title-medium">Válassz szobát:</h3>
          <div class="chip-group">
            {#each rooms as room}
              <Chip
                variant="general"
                selected={selectedRoom === room.id}
                onclick={() => selectRoom(room.id)}
              >
                {room.name}
              </Chip>
            {/each}
          </div>
        </div>

        <div class="role-selection">
          <h3 class="m3-font-title-medium">Válaszd ki a szereped:</h3>
          <div class="chip-group">
            {#each roles as role}
              <Chip
                variant="general"
                selected={selectedRole === role.id}
                onclick={() => selectRole(role.id)}
              >
                {role.name}
              </Chip>
            {/each}
          </div>
        </div>

        <Button
          variant="filled"
          onclick={joinRoom}
          disabled={!selectedRoom || !selectedRole}
        >
          Csatlakozás a szobához
        </Button>
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

  :global(.main-card) {
    width: 100%;
    max-width: 600px;
  }

  .card-content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }


  .selection-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .room-selection,
  .role-selection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .chip-group {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  
</style>
