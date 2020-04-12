import pages from "./pages";
import NavigationContainer from "./NavigationContainer.svelte";

export const BASENAME = "/ui";

export default pages.map(page => ({
  name: BASENAME + page.path,
  component: page.component,
  layout: NavigationContainer
}));
