<script>
  import Screen from "./screen.svelte";
  import Content from "../ui/content.svelte";
  import Field from "../ui/field.svelte";
  import Button from "../ui/button.svelte";
  import FormContainer from "../ui/form-container.svelte";

  let {
    player,
    character = $bindable(),
    submit,
    cancel,
  } = $props()
</script>

<Screen>
  {#snippet header()}
    Изменить персонажа {player}
  {/snippet}
  <Content>
    <FormContainer>
      <Field label="Персонаж" bind:value={character} name="character" />
    </FormContainer>
  </Content>
  {#snippet footer()}
    <Button onclick={cancel}>Отменить</Button>
    <Button onclick={submit}>Подтвердить</Button>
  {/snippet}
</Screen>