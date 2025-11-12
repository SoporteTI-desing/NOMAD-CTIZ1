import { useState } from "react";

export default function LoginOverlay({ children }) {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (
      user === process.env.NEXT_PUBLIC_USER &&
      pass === process.env.NEXT_PUBLIC_PASS
    ) {
      setIsLogged(true);
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  if (!isLogged) {
    return (
      <div className="overlay">
        <div className="login-box">
          <h2>Acceso</h2>
          <input
            type="text"
            placeholder="Usuario"
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPass(e.target.value)}
          />
          <button onClick={handleLogin}>Entrar</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
        <style jsx>{`
          .overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }
          .login-box {
            background: #fff;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
            width: 300px;
          }
          input {
            display: block;
            width: 100%;
            margin: 0.5rem 0;
            padding: 0.5rem;
          }
          button {
            margin-top: 1rem;
            padding: 0.7rem 1.2rem;
            background: #0070f3;
            border: none;
            color: white;
            border-radius: 6px;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return children;
}