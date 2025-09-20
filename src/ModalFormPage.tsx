import { useState } from "react";
import { useModal } from "./context/modal";

const ModalFormPage = () => {
  const { isOpen, open, close } = useModal();
  return (
    <div>
      <button onClick={() => open({ content: <div>신청 폼</div> })}>신청 폼 작성하기</button>
      {isOpen && (
        <div>
          <h2>신청 폼</h2>
          <button onClick={close}>닫기</button>
        </div>
      )}
    </div>
  );
};

export default ModalFormPage;
