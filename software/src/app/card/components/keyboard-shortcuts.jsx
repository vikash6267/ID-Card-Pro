import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from 'sonner';

export default function useKeyboardShortcuts({
  selectedElements,
  setSelectedElements,
  template,
  setTemplate,
  currentSide,
  onTemplateChange,
  zoomLevel,
  recordChange,
}) {
  const [showHelp, setShowHelp] = useState(false);
  const [copiedElements, setCopiedElements] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }


      // COPY: Ctrl+C
      else if (ctrl && e.key.toLowerCase() === "c") {
        e.preventDefault();
        if (selectedElements.length > 0) {
          setCopiedElements(selectedElements);
          toast.success("Copied elements to clipboard");
        }
      }

      // PASTE: Ctrl+V
      else if (ctrl && e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (copiedElements.length > 0) {
          const clones = copiedElements.map((el) => ({
            ...structuredClone(el),
            id: uuidv4(),
            position: {
              x: el.position.x + 10,
              y: el.position.y + 10,
            },
          }));

          const updated = {
            ...template,
            [currentSide]: {
              ...template[currentSide],
              elements: [...template[currentSide].elements, ...clones],
            },
          };

          recordChange(updated);
          setTemplate(updated);
          onTemplateChange(updated);
          setSelectedElements(clones);
          toast.success("Pasted elements");
        }
      }

      // Toggle help with Shift + /
      if (e.shiftKey && e.key === "/") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // TEXT: Shift + T
      if (!ctrl && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        const newText = {
          id: uuidv4(),
          type: "text",
          content: "New Text",
          position: { x: 100, y: 100 },
          size: defaultSize,
          rotation: 0,
          style: {
            fontSize: 16,
            isBold: false,
            isItalic: false,
            isUnderlined: false,
            color: "#000000",
          },
        };

        const updated = {
          ...template,
          [currentSide]: {
            ...template[currentSide],
            elements: [...template[currentSide].elements, newText],
          },
        };
        recordChange(updated);
        setTemplate(updated);
        onTemplateChange(updated);
        setSelectedElements([newText]);
      }

      // IMAGE: Ctrl+M
      else if (ctrl && e.key.toLowerCase() === "m") {
        e.preventDefault();
        const newImage = {
          id: uuidv4(),
          type: "image",
          content: "",
          position: { x: 100, y: 100 },
          size: { width: 100, height: 100 },
          rotation: 0,
          style: {
            strokeWidth: 0,
            strokeColor: "#000000",
          },
        };

        const updated = {
          ...template,
          [currentSide]: {
            ...template[currentSide],
            elements: [...template[currentSide].elements, newImage],
          },
        };
        recordChange(updated);
        setTemplate(updated);
        onTemplateChange(updated);
        setSelectedElements([newImage]);
      }

      else if (ctrl && e.key.toLowerCase() === "b") {
        e.preventDefault();
        applyStyleToSelected("isBold", (val) => !val);
      }

      else if (ctrl && e.key.toLowerCase() === "i") {
        e.preventDefault();
        applyStyleToSelected("isItalic", (val) => !val);
      }

      else if (ctrl && e.key.toLowerCase() === "u") {
        e.preventDefault();
        applyStyleToSelected("isUnderlined", (val) => !val);
      }

      else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        const updated = {
          ...template,
          [currentSide]: {
            ...template[currentSide],
            elements: template[currentSide].elements.filter(
              (el) => !selectedElements.some((sel) => sel.id === el.id)
            ),
          },
        };
        recordChange(updated);
        setTemplate(updated);
        onTemplateChange(updated);
        setSelectedElements([]);
      }

      else if (ctrl && e.key.toLowerCase() === "d") {
        e.preventDefault();
        const clones = selectedElements.map((el) => ({
          ...structuredClone(el),
          id: uuidv4(),
          position: {
            x: el.position.x + 10,
            y: el.position.y + 10,
          },
        }));

        const updated = {
          ...template,
          [currentSide]: {
            ...template[currentSide],
            elements: [...template[currentSide].elements, ...clones],
          },
        };

        recordChange(updated);
        setTemplate(updated);
        onTemplateChange(updated);
        setSelectedElements(clones);
      }

      else if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        const moveBy = 1 * (e.shiftKey ? 10 : 1);

        const updatedElements = template[currentSide].elements.map((el) => {
          if (selectedElements.some((sel) => sel.id === el.id)) {
            const dx = e.key === "ArrowLeft" ? -moveBy : e.key === "ArrowRight" ? moveBy : 0;
            const dy = e.key === "ArrowUp" ? -moveBy : e.key === "ArrowDown" ? moveBy : 0;
            return {
              ...el,
              position: {
                x: el.position.x + dx,
                y: el.position.y + dy,
              },
            };
          }
          return el;
        });

        const updated = {
          ...template,
          [currentSide]: {
            ...template[currentSide],
            elements: updatedElements,
          },
        };

        recordChange(updated);
        setTemplate(updated);
        onTemplateChange(updated);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElements, template, currentSide, zoomLevel, copiedElements]);

  const applyStyleToSelected = (styleKey, toggleFn) => {
    const updatedElements = template[currentSide].elements.map((el) => {
      if (selectedElements.some((sel) => sel.id === el.id)) {
        return {
          ...el,
          style: {
            ...el.style,
            [styleKey]: toggleFn(el.style?.[styleKey]),
          },
        };
      }
      return el;
    });

    const updated = {
      ...template,
      [currentSide]: {
        ...template[currentSide],
        elements: updatedElements,
      },
    };

    recordChange(updated);
    setTemplate(updated);
    onTemplateChange(updated);
  };

  useKeyboardShortcuts.shortcutGuide = [
    { keys: "Ctrl + C", action: "Copy selected elements" },
    { keys: "Ctrl + V", action: "Paste copied elements" },
    { keys: "Shift + T", action: "Add Text" },
    { keys: "Ctrl + M", action: "Add Image Box" },
    { keys: "Ctrl + B", action: "Toggle Bold" },
    { keys: "Ctrl + I", action: "Toggle Italic" },
    { keys: "Ctrl + U", action: "Toggle Underline" },
    { keys: "Ctrl + D", action: "Duplicate Element" },
    { keys: "Delete ", action: "Delete Element" },
    { keys: "Arrow Keys", action: "Move Element (Shift for faster)" },
    { keys: "Ctrl + Z", action: "Undo" },
    { keys: "Ctrl + Y ", action: "Redo" },
  ];

  useKeyboardShortcuts.ShortcutHelpPanel = () => {
    const [isMinimized, setIsMinimized] = useState(true); // Start minimized by default
  
    return (
      <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg text-sm z-50 border w-[300px]">
        <div className="flex items-center justify-between border-b px-4 py-2 font-semibold">
          <span>Keyboard Shortcuts</span>
          <button
            className="text-xs text-blue-600 hover:underline"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? "Expand" : "Minimize"}
          </button>
        </div>
        {!isMinimized && (
          <ul className="space-y-1 text-xs p-3">
            {useKeyboardShortcuts.shortcutGuide.map((s, idx) => (
              <li key={idx} className="flex justify-between">
                <span className="text-muted-foreground">{s.action}</span>
                <span className="font-mono">{s.keys}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
}