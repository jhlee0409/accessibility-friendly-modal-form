import { useModal } from "./context/modal";
import { ModalForm, type FormData } from "./ModalForm";
import { useEffect, useRef } from "react";

const ModalFormPage = () => {
  const { open, isOpen } = useModal();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (data: FormData | null) => {
    if (data) {
      alert(`${data.name}님의 정보가 제출되었습니다. ${JSON.stringify(data)}`);
    }
  };

  // isOpen false 시에 button focus
  useEffect(() => {
    if (!isOpen) {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div>
      <button ref={triggerRef} onClick={() => open({ content: <ModalForm onSubmit={handleSubmit} /> })}>
        신청 폼 작성하기
      </button>
    </div>
  );
};

export default ModalFormPage;
