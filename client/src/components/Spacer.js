import styled from "styled-components";

const Spacer = styled("span")`
  display: ${p => (p.vertical ? "block" : "inline-block")};
  width: ${p => (p.big ? "1.5rem" : "0.5ch")};
  height: ${p => (p.vertical ? "1ch" : "auto")};
`;

export default Spacer;
