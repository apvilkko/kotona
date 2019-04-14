import styled from "styled-components";
import Box from "./Box";

const BoxRow = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: ${p => (p.top ? "flex-start" : "center")};
  flex-wrap: wrap;
`;

export default BoxRow;
