import pages from "./pages";

export const BASENAME = "/ui";

export default pages.map(page => ({
  name: BASENAME + page.path,
  component: page.component
}));
