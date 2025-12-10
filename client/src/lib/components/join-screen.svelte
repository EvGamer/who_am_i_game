<script>
  import Screen from "./screen.svelte";
  import Content from "./content.svelte";
  import Field from "./field.svelte";
  import Button from "./button.svelte";

  let {
    player = $bindable(),
    character = $bindable(),
    submit,
    cancel,
    isEditing,
  } = $props()
</script>

<Screen>
  {#snippet header()}
    Введите ваше имя и персонажа
  {/snippet}
  <Content>
    <div class="form">
      <Field label="Ваше имя" bind:value={player} name="player"/>
      <Field label="Персонаж для других" bind:value={character} name="character" />
    </div>
  </Content>
  {#snippet footer()}
    {#if isEditing}
      <Button onclick={cancel}>Отменить</Button>
    {/if}
    <Button onclick={submit}>Подтвердить</Button>
  {/snippet}
</Screen>

<style>
  .form {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    padding: var(--default-v-margin) 15px;
    gap: var(--default-v-margin);
  }
</style>