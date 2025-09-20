import { useCallback, useEffect, useRef, useState } from "react";
import { useModal } from "./context/modal";

import "./ModalForm.css";

export type FormData = {
  name: string;
  email: string;
  career: string;
  github: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  career?: string;
  github?: string;
};

const validateField = (name: string, value: string): string | undefined => {
  switch (name) {
    case "name":
      if (!value.trim()) return "이름을 입력해주세요.";
      if (value.trim().length < 2) return "이름은 2자 이상이어야 합니다.";
      break;
    case "email":
      if (!value.trim()) return "이메일을 입력해주세요.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "올바른 이메일 형식이 아닙니다.";
      break;
    case "career":
      if (!value.trim()) return "경력을 선택해주세요.";
      break;
  }
  return undefined;
};

// ================================

type Props = {
  onSubmit: (data: FormData | null) => void;
};

export const ModalForm = ({ onSubmit }: Props) => {
  const { isOpen, close } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    career: "",
    github: "",
  });

  useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData) as FormData;

    Object.entries(data).forEach(([key, value]) => {
      const error = validateField(key, value as string);
      if (error) newErrors[key as keyof FormErrors] = error;
    });

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((error) => error);
    if (hasError) return;
    onSubmit(data);
  }, []);

  return (
    <div
      className="modal-content"
      ref={modalRef}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-form-title"
      aria-describedby="modal-form-description"
    >
      <h2 ref={titleRef} tabIndex={-1}>
        신청 폼
      </h2>
      <p id="modal-form-description">이메일과 FE 경력 연차 등 간단한 정보를 입력해 주세요.</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">이름/닉네임</label>
          <input
            type="text"
            id="name"
            name="name"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <span id="name-error" className="error" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <span id="email-error" className="error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="message">FE 경력 연차</label>
          <select
            id="career"
            name="career"
            aria-required="true"
            aria-invalid={!!errors.career}
            aria-describedby={errors.career ? "career-error" : undefined}
          >
            <option value="">선택해주세요</option>
            <option value="1">0-3년</option>
            <option value="2">4-7년</option>
            <option value="3">8년 이상</option>
          </select>

          {errors.career && (
            <span id="career-error" className="error" role="alert">
              {errors.career}
            </span>
          )}
        </div>

        <label htmlFor="email">Github 링크 (선택)</label>
        <input
          type="text"
          id="github"
          name="github"
          placeholder="https://github.com/username"
          aria-required="false"
          aria-invalid={!!errors.github}
          aria-describedby={errors.github ? "github-error" : undefined}
        />
        {errors.github && (
          <span id="github-error" className="error" role="alert">
            {errors.github}
          </span>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              close();
              onSubmit(null);
            }}
          >
            취소
          </button>
          <button type="submit" className="btn btn-primary">
            제출하기
          </button>
        </div>
      </form>
    </div>
  );
};
