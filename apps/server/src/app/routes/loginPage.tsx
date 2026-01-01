import type { FC } from "hono/jsx";
import { Layout } from "../../components/Layout";

interface LoginPageProps {
  callbackURL?: string;
  error?: string;
  mode?: "signin" | "signup";
}

export const LoginPage: FC<LoginPageProps> = ({ callbackURL = "/", error, mode = "signin" }) => {
  const isSignUp = mode === "signup";
  const formId = "auth-form";
  const emailInputId = "email-input";
  const passwordInputId = "password-input";
  const nameInputId = "name-input";
  const submitBtnId = "submit-btn";
  const errorMsgId = "error-msg";
  const loadingId = "loading-indicator";

  // Better Auth endpoints
  const signInEndpoint = "/api/auth/sign-in/email";
  const signUpEndpoint = "/api/auth/sign-up/email";
  const googleAuthEndpoint = "/api/auth/sign-in/social";

  return (
    <Layout title={isSignUp ? "Sign Up - Akraft" : "Login - Akraft"}>
      <div class="min-h-screen flex items-center justify-center bg-background">
        <div class="w-full max-w-md p-8">
          <div class="text-center mb-8">
            <a href="/" class="text-2xl font-bold text-foreground hover:opacity-80">
              Akraft
            </a>
            <p class="text-muted-foreground mt-2">
              {isSignUp ? "Create an account" : "Admin Login"}
            </p>
          </div>

          {error && (
            <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div id={errorMsgId} class="hidden mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          </div>

          <div class="bg-card border rounded-lg p-6 shadow-sm">
            <form
              id={formId}
              class="space-y-4"
              onsubmit={`
                event.preventDefault();
                var form = document.getElementById('${formId}');
                var email = document.getElementById('${emailInputId}').value;
                var password = document.getElementById('${passwordInputId}').value;
                var name = document.getElementById('${nameInputId}')?.value || '';
                var submitBtn = document.getElementById('${submitBtnId}');
                var loading = document.getElementById('${loadingId}');
                var errorMsg = document.getElementById('${errorMsgId}');
                var isSignUp = ${isSignUp};

                if (!email || !password) {
                  errorMsg.textContent = 'Please enter email and password';
                  errorMsg.classList.remove('hidden');
                  return;
                }

                if (password.length < 8) {
                  errorMsg.textContent = 'Password must be at least 8 characters';
                  errorMsg.classList.remove('hidden');
                  return;
                }

                errorMsg.classList.add('hidden');
                submitBtn.disabled = true;
                loading.classList.remove('hidden');

                var endpoint = isSignUp ? '${signUpEndpoint}' : '${signInEndpoint}';
                var body = isSignUp
                  ? JSON.stringify({ email: email, password: password, name: name || email.split('@')[0] })
                  : JSON.stringify({ email: email, password: password });

                fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: body
                })
                .then(function(res) { return res.json().then(function(data) { return { ok: res.ok, data: data }; }); })
                .then(function(result) {
                  if (result.ok && result.data.user) {
                    window.location.href = '${callbackURL}';
                  } else {
                    var msg = result.data.message || result.data.error || 'Authentication failed';
                    errorMsg.textContent = msg;
                    errorMsg.classList.remove('hidden');
                    submitBtn.disabled = false;
                    loading.classList.add('hidden');
                  }
                })
                .catch(function(err) {
                  errorMsg.textContent = 'Network error. Please try again.';
                  errorMsg.classList.remove('hidden');
                  submitBtn.disabled = false;
                  loading.classList.add('hidden');
                });
              `}
            >
              {isSignUp && (
                <div class="space-y-2">
                  <label for={nameInputId} class="block text-sm font-medium text-foreground">
                    Name
                  </label>
                  <input
                    id={nameInputId}
                    type="text"
                    placeholder="Your name"
                    class="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div class="space-y-2">
                <label for={emailInputId} class="block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id={emailInputId}
                  type="email"
                  placeholder="you@example.com"
                  required
                  class="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div class="space-y-2">
                <label for={passwordInputId} class="block text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  id={passwordInputId}
                  type="password"
                  placeholder="At least 8 characters"
                  required
                  class="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                id={submitBtnId}
                type="submit"
                class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </button>

              <div id={loadingId} class="hidden flex items-center justify-center gap-2 text-sm text-primary py-2">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Please wait...</span>
              </div>
            </form>

            <div class="my-4 flex items-center gap-4">
              <div class="flex-1 border-t"></div>
              <span class="text-muted-foreground text-sm">OR</span>
              <div class="flex-1 border-t"></div>
            </div>

            <button
              type="button"
              id="google-btn"
              class="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              onclick={`
                var btn = document.getElementById('google-btn');
                btn.disabled = true;
                btn.textContent = 'Redirecting...';

                fetch('${googleAuthEndpoint}', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    provider: 'google',
                    callbackURL: '${callbackURL}'
                  })
                })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                  if (data.url) {
                    window.location.href = data.url;
                  } else {
                    btn.disabled = false;
                    btn.innerHTML = '<svg class=\"mr-2 h-4 w-4\" viewBox=\"0 0 24 24\"><path fill=\"#4285F4\" d=\"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z\"/><path fill=\"#34A853\" d=\"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z\"/><path fill=\"#FBBC05\" d=\"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z\"/><path fill=\"#EA4335\" d=\"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z\"/></svg> Continue with Google';
                    var errorMsg = document.getElementById('${errorMsgId}');
                    errorMsg.textContent = 'Google sign in failed. Please try again.';
                    errorMsg.classList.remove('hidden');
                  }
                })
                .catch(function(err) {
                  btn.disabled = false;
                  btn.innerHTML = '<svg class=\"mr-2 h-4 w-4\" viewBox=\"0 0 24 24\"><path fill=\"#4285F4\" d=\"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z\"/><path fill=\"#34A853\" d=\"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z\"/><path fill=\"#FBBC05\" d=\"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z\"/><path fill=\"#EA4335\" d=\"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z\"/></svg> Continue with Google';
                  var errorMsg = document.getElementById('${errorMsgId}');
                  errorMsg.textContent = 'Network error. Please try again.';
                  errorMsg.classList.remove('hidden');
                });
              `}
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <div class="mt-4 text-center">
            {isSignUp ? (
              <a
                href={`/login?callbackURL=${encodeURIComponent(callbackURL)}`}
                class="text-sm text-primary hover:underline"
              >
                Already have an account? Sign In
              </a>
            ) : (
              <a
                href={`/login?callbackURL=${encodeURIComponent(callbackURL)}&mode=signup`}
                class="text-sm text-primary hover:underline"
              >
                Need an account? Sign Up
              </a>
            )}
          </div>

          <p class="text-center text-xs text-muted-foreground mt-6">
            Only administrators can post as admin
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
