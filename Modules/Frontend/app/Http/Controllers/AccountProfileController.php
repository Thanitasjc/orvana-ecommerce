<?php

namespace Modules\Frontend\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AccountProfileController extends Controller
{
    public function edit(Request $request): View
    {
        return view('frontend::pages.account-profile', [
            'user' => $request->user(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$request->user()->id],
        ]);

        $user = $request->user();
        $emailChanged = $user->email !== $validated['email'];

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return back()->with('success', 'Profile updated.');
    }
}

