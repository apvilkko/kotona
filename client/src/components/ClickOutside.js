import React, { Component, useEffect } from "react";

export default ({ children, onClick }) => {
  const refs = React.Children.map(children, () => React.createRef());
  const handleClick = e => {
    const isOutside = refs.every(ref => {
      return !ref.current.contains(e.target);
    });
    if (isOutside) {
      onClick();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return function() {
      document.removeEventListener("click", handleClick);
    };
  });

  return React.Children.map(children, (element, i) =>
    React.cloneElement(element, { ref: refs[i] })
  );
};
