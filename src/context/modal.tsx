import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export type ModalOptions = {
  content: React.ReactNode | ((props: Omit<ModalContextType, "open">) => React.ReactNode);
};

type ModalContextState = {
  isOpen: boolean;
};

type ModalContextAction = {
  open: (options: ModalOptions) => void;
  close: () => void;
};

type ModalContextType = ModalContextState & ModalContextAction;

const ModalContext = createContext<ModalContextType | null>(null);

// ================================

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setContent(null);
  }, []);

  const handleOpen = useCallback(
    (props: ModalOptions) => {
      try {
        setIsOpen(true);
        if (props?.content) {
          setContent(
            typeof props.content === "function" ? props.content({ isOpen: true, close: handleClose }) : props.content,
          );
        }
      } catch (error) {
        console.error("Modal open error:", error);
        setIsOpen(false);
      }
    },
    [handleClose],
  );

  const values: ModalContextType = useMemo(
    () => ({
      isOpen,
      open: handleOpen,
      close: handleClose,
    }),
    [isOpen, handleOpen, handleClose],
  );

  const modalContainer = document.getElementById("modal-container");

  return (
    <ModalContext.Provider value={values}>
      {children}
      {modalContainer ? createPortal(<>{isOpen ? content : null}</>, modalContainer) : null}
    </ModalContext.Provider>
  );
};

// ================================

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("Modal Provider 내에서 사용해야 합니다.");
  }

  return context;
};

// ================================
