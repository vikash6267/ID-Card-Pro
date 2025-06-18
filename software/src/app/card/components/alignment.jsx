import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export function Alignment({ elements = [], onUpdate, isCardAlignment = false }) {
  const [alignment, setAlignment] = useState("left");
  const [verticalAlignment, setVerticalAlignment] = useState("top");

  useEffect(() => {
    if (elements.length > 0) {
      setAlignment(elements[0].style?.alignment || "left");
      setVerticalAlignment(elements[0].style?.verticalAlignment || "top");
    }
  }, [elements]);

// Update the handleAlignmentChange in Alignment.jsx
const handleAlignmentChange = (h, v) => {
  setAlignment(h);
  setVerticalAlignment(v);

  const updatedElements = elements.map((el) => ({
    ...el,
    style: {
      ...el.style, // Preserve all other styles
      alignment: h,
      verticalAlignment: v,
    },
  }));

  onUpdate(updatedElements);
};

  const positions = [
    [{ h: "left", v: "top" }, { h: "center", v: "top" }, { h: "right", v: "top" }],
    [{ h: "left", v: "middle" }, { h: "center", v: "middle" }, { h: "right", v: "middle" }],
    [{ h: "left", v: "bottom" }, { h: "center", v: "bottom" }, { h: "right", v: "bottom" }],
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">
        {isCardAlignment ? "Align in Card" : ""}
      </h3>

      <div className="grid grid-cols-3 gap-[4px]">
        {positions.flat().map(({ h, v }) => {
          const isActive = alignment === h && verticalAlignment === v;
          return (
            <Button
              key={`${h}-${v}`}
              size="xs"
              className={`p-2 rounded text-sm 
                ${isActive ? "bg-blue-500 text-white" : "bg-white text-black border"}
                hover:bg-blue-200 transition-all`}
              onClick={() => handleAlignmentChange(h, v)}
            >
              ⬜
            </Button>
          );
        })}
      </div>
    </div>
  );
}
