<script>
  import getIcon from "./getIcon";

  export let icon;
  export let size = "md";
</script>

<span class={`icon icon-${size}`}>
  {@html getIcon(icon)}
</span>
