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
      {modalContainer
        ? createPortal(
            <>
              {isOpen ? (
                <ModalWrapper isOpen={isOpen} close={handleClose}>
                  {content}
                </ModalWrapper>
              ) : null}
            </>,
            modalContainer,
          )
        : null}
    </ModalContext.Provider>
  );
};

// ================================

const zIndexOrder = {
  dimmed: 999,
  modal: 1000,
};

const dimmedStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: zIndexOrder.dimmed,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as React.CSSProperties;

const modalWrapperStyle = {
  zIndex: zIndexOrder.modal,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
} as React.CSSProperties;

const ModalWrapper = ({
  children,
  isOpen,
  close,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  close: () => void;
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    // 실제 클릭 대상과 이벤트 리스너가 적용된 대상이 같을 때만 닫히도록 함
    // 즉 dimmed 영역 클릭 === dimmed에 이벤트 리스너가 적용된 것
    if (e.target === e.currentTarget) {
      close();
    }
  };

  if (!isOpen) return null;

  // ESC 키 입력 시 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, close]);

  // 모달이 닫혀있으면 렌더링하지 않음 aria-modal에 true 속성 적용
  // 모달 열리면 스크롤 바 숨기기
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={dimmedStyle} onClick={handleOverlayClick}>
      <div style={modalWrapperStyle}>{children}</div>
    </div>
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
