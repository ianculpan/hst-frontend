import { useState } from 'react';
import { useAuth } from '../AuthContext.js';
import TwoFactorChallenge from './TwoFactor.jsx';

export default function Login() {
  const { login, needsTwoFactor, needsTwoFactorSetup, verifyTwoFactor } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (needsTwoFactor || needsTwoFactorSetup) {
        await verifyTwoFactor(twoFactorCode);
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="w-1/2 mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        <div className="flex flex-col gap-2 border-2 border-brand-400 rounded-md p-4">
          {!needsTwoFactor && !needsTwoFactorSetup && (
            <>
              <div className="flex items-center gap-2">
                <label htmlFor="email" className="text-sm font-medium text-brand-400 w-20">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 border-2 border-brand-400 rounded-md p-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="password" className="text-sm font-medium text-brand-400 w-20">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 border-2 border-brand-400 rounded-md p-2"
                />
              </div>
            </>
          )}
          {(needsTwoFactor || needsTwoFactorSetup) && (
            <TwoFactorChallenge code={twoFactorCode} onCodeChange={setTwoFactorCode} />
          )}

          <button type="submit" className="bg-theme-500 text-brand-100 p-2 rounded-md mx-24">
            {needsTwoFactor || needsTwoFactorSetup ? 'Verify 2FA Code' : 'Login'}
          </button>
        </div>
      </div>
    </form>
  );
}
