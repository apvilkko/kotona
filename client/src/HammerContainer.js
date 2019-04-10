import React, { useRef, useEffect } from "react";
import "hammerjs";

let hammer;

export default ({ className, children, options }) => {
  const el = useRef(null);

  useEffect(() => {
    hammer = new Hammer(el.current); // eslint-disable-line no-undef
    hammer.on("swipe", evt => {
      if (evt.deltaX < 0) {
        if (options.onSwipeLeft) {
          options.onSwipeLeft(evt);
        }
      } else {
        if (options.onSwipeRight) {
          options.onSwipeRight(evt);
        }
      }
    });
  }, []);

  return (
    <div ref={el} className={className}>
      {children}
    </div>
  );
};
