<script>
  let { value = $bindable(), name, label } = $props();
</script>

<div class="field">
  <label for={name}>{label}</label>
  <input name={name} bind:value={value} />
</div>

<style>
  .field {
    width: 100%;
  }

  .field > label {
    margin-bottom: 4px;
    display: block;
  }

  .field > input {
    width: 100%;
    background-color: var(--input-bg-color);
    border-radius: 0;
    color: var(--text-color);
    border: none;
    border-radius: 0;
    padding: 8px 16px;
    font-size: 16px;
    box-sizing: border-box;
    font-family: var(--font-family);

  }

  .field > input:focus {
    border: none;
    outline: none;
    background-color: var(--focused-input-bg-color);
  }
</style>