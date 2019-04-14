import styled from "styled-components";

const Spacer = styled("span")`
  display: ${p => (p.vertical ? "block" : "inline-block")};
  width: 0.5ch;
  height: ${p => (p.vertical ? "1ch" : "auto")};
`;

export default Spacer;
