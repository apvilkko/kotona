import React, { useState } from "react";
import styled from "styled-components";
import Closer from "../../components/Closer";
import ClickOutside from "../../components/ClickOutside";

const Color = styled("button")`
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 1.25rem;
  display: inline-block;
  border-color: transparent;
`;

const Modal = styled("div")`
  position: absolute;
  padding: 1em;
  top: 2rem;
  left: 2rem;
  width: 14em;
  height: 80vh;
  background: ${p => p.theme.modal.bg};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 100;
`;

const ColorSelect = styled("div")`
  & > * {
    margin-right: 0.2rem;
    margin-bottom: 0.2rem;
  }
`;

const getStyle = (color, current) => {
  const style = { background: `#${color}` };
  if (color === current) {
    style.border = "0.5em solid #333";
  }
  return style;
};

export default ({ colors, value, handleChange }) => {
  const [modalOpen, setModalOpen] = useState(false);

  if (!colors) {
    return null;
  }

  return (
    <>
      <button
        className="color-modal-toggle"
        type="button"
        onClick={() => setModalOpen(!modalOpen)}
        style={{ background: `#${value}` }}
      />
      {modalOpen ? (
        <ClickOutside onClick={() => setModalOpen(false)}>
          <Modal>
            <ColorSelect>
              {colors.map(color => (
                <Color
                  key={color}
                  type="button"
                  onClick={() => handleChange(color)}
                  style={getStyle(color, value)}
                />
              ))}
            </ColorSelect>
            <Closer handleClick={() => setModalOpen(close)} />
          </Modal>
        </ClickOutside>
      ) : null}
    </>
  );
};
