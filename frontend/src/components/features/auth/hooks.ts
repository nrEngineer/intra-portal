import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export interface LoginFormState {
  email: string;
  password: string;
  error: string;
}

export interface LoginFormHandlers {
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useLoginForm(): LoginFormState & LoginFormHandlers {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    }
  };

  return { email, password, error, setEmail, setPassword, handleSubmit };
}
