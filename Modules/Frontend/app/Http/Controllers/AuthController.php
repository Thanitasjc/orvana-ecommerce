<?php

namespace Modules\Frontend\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rules\Password;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors(['email' => 'Invalid login credentials.'])->withInput();
        }

        $request->session()->regenerate();

        return back()->with('success', 'Logged in successfully.');
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_admin' => false,
        ]);
        event(new Registered($user));

        Auth::login($user);
        $request->session()->regenerate();

        return back()->with('success', 'Account created. Please verify your email.');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('frontend.home');
    }

    public function sendResetLink(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = PasswordBroker::sendResetLink([
            'email' => $validated['email'],
        ]);

        if ($status !== PasswordBroker::RESET_LINK_SENT) {
            return back()->withErrors(['email' => __($status)]);
        }

        return back()->with('success', __($status));
    }

    public function showResetPassword(Request $request): View
    {
        return view('frontend::pages.reset-password', [
            'token' => $request->route('token'),
            'email' => $request->query('email'),
        ]);
    }

    public function resetPassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $status = PasswordBroker::reset(
            $validated,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status !== PasswordBroker::PASSWORD_RESET) {
            return back()->withErrors(['email' => [__($status)]])->withInput();
        }

        return redirect()->route('frontend.home')->with('success', __($status));
    }

    public function verifyNotice(): View|RedirectResponse
    {
        $user = Auth::user();

        if ($user?->hasVerifiedEmail()) {
            return redirect()->route('frontend.home');
        }

        $mailer = (string) Config::get('mail.default', 'log');
        $showLocalVerifyLink = in_array($mailer, ['log', 'array'], true);
        $localVerifyLink = null;

        if ($showLocalVerifyLink && $user) {
            $localVerifyLink = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                [
                    'id' => $user->getKey(),
                    'hash' => sha1($user->getEmailForVerification()),
                ]
            );
        }

        return view('frontend::pages.verify-email', [
            'showLocalVerifyLink' => $showLocalVerifyLink,
            'localVerifyLink' => $localVerifyLink,
            'activeMailer' => $mailer,
        ]);
    }

    public function verifyEmail(EmailVerificationRequest $request): RedirectResponse
    {
        $request->fulfill();

        return redirect()->route('frontend.home')->with('success', 'Email verified.');
    }

    public function resendVerificationEmail(Request $request): RedirectResponse
    {
        if ($request->user()?->hasVerifiedEmail()) {
            return back()->with('success', 'Email is already verified.');
        }

        $request->user()?->sendEmailVerificationNotification();

        return back()->with('success', 'Verification link sent.');
    }
}

