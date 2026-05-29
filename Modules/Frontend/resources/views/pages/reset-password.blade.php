@extends('frontend::layouts.app')

@section('title', 'Reset Password - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        <section class="flat-spacing">
            <div class="container" style="max-width: 640px;">
                <h3 class="text-primary mb-3">Reset Password</h3>
                <form method="POST" action="{{ route('password.update') }}" class="d-grid gap-3">
                    @csrf
                    <input type="hidden" name="token" value="{{ $token }}">
                    <div>
                        <label class="form-label">Email</label>
                        <input type="email" name="email" class="form-control" value="{{ old('email', $email) }}" required>
                    </div>
                    <div>
                        <label class="form-label">New Password</label>
                        <input type="password" name="password" class="form-control" required>
                    </div>
                    <div>
                        <label class="form-label">Confirm Password</label>
                        <input type="password" name="password_confirmation" class="form-control" required>
                    </div>
                    <button type="submit" class="tf-btn animate-btn">Reset Password</button>
                </form>
            </div>
        </section>
        @include('frontend::components.footer')
    </main>
@endsection

