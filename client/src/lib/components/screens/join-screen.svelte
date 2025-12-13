<script>
  import Screen from "./screen.svelte";
  import Content from "../ui/content.svelte";
  import Field from "../ui/field.svelte";
  import Button from "../ui/button.svelte";
    import FormContainer from "../ui/form-container.svelte";

  let {
    player = $bindable(),
    character = $bindable(),
    submit,
    cancel,
    isEditing,
    isGameStarted,
    isInGame
  } = $props()
</script>

<Screen>
  {#snippet header()}
    Введите ваше имя и персонажа
  {/snippet}
  <Content>
    <FormContainer>
      {#if !isGameStarted || !isInGame}
        <Field label="Ваше имя" bind:value={player} name="player"/>
      {/if}
      {#if !isGameStarted || isInGame}
        <Field label="Персонаж для других" bind:value={character} name="character" />
      {/if}
    </FormContainer>
  </Content>
  {#snippet footer()}
    {#if isEditing}
      <Button onclick={cancel}>Отменить</Button>
    {/if}
    <Button onclick={submit}>Подтвердить</Button>
  {/snippet}
</Screen>