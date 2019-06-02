import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo
} from "react";
import RSKeyboard from "react-simple-keyboard";

const fiLayout = {
  default: [
    "1 2 3 4 5 6 7 8 9 0 + {bksp}",
    "{tab} q w e r t y u i o p å",
    "{lock} a s d f g h j k l ö ä {enter}",
    "{shift} z x c v b n m , . - {shift}",
    "@ {space}"
  ],
  shift: [
    '! " # ¤ % & / ( ) = ? {bksp}',
    "{tab} Q W E R T Y U I O P Å",
    "{lock} A S D F G H J K L Ö Ä {enter}",
    "{shift} Z X C V B N M ; : _ {shift}",
    "@ {space}"
  ]
};

const useKeyboard = setter => {
  const ref = useRef(null);
  const [layout, setLayout] = useState("default");
  const [input, setInput] = useState(null);

  useEffect(() => {
    if (ref.current && ref.current.keyboard) {
      ref.current.keyboard.setInput(input);
    }
  }, [input]);

  const handleKeyPress = useCallback(button => {
    console.log("Button pressed", button);
    if (button === "{shift}" || button === "{lock}") {
      setLayout(layout === "default" ? "shift" : "default");
    }
  });

  const handleChange = useCallback(
    input => {
      console.log("Input changed", input);
      setter(input);
    },
    [setter]
  );

  const Keyboard = useMemo(
    () => props => (
      <RSKeyboard
        ref={ref}
        layout={fiLayout}
        layoutName={layout}
        tabCharOnTab={false}
        {...props}
      />
    ),
    [layout, setter]
  );

  return {
    layoutName: layout,
    layout: fiLayout,
    ref,
    setInput,
    handleKeyPress,
    handleChange,
    Keyboard
  };
};

export default useKeyboard;
