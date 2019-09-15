import styled from "styled-components";

const Smaller = styled("small")`
  color: ${p => (p.dimmer ? p.theme.colors.dimmer : "inherit")};
`;

export default Smaller;
