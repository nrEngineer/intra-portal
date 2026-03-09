import { useLoginForm } from "./hooks";

export function LoginContainer() {
  const { email, password, error, setEmail, setPassword, handleSubmit } =
    useLoginForm();

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-card">
        <div className="login-brand">
          <h1>社内ポータル</h1>
          <p>Intra Portal</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="login-field">
          <label htmlFor="email" className="label">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            placeholder="name@company.com"
          />
        </div>

        <div className="login-field">
          <label htmlFor="password" className="label">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="login-submit">
          ログイン
        </button>
      </form>
    </div>
  );
}
