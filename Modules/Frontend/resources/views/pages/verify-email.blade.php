@extends('frontend::layouts.app')

@section('title', 'Verify Email - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        <section class="flat-spacing">
            <div class="container" style="max-width: 680px;">
                <h3 class="text-primary mb-3">Verify your email</h3>
                <p class="mb-3">Please check your inbox and click the verification link.</p>
                @if (($showLocalVerifyLink ?? false) && ! empty($localVerifyLink))
                    <div class="alert alert-warning mb-3" role="alert">
                        Current mailer is <strong>{{ $activeMailer ?? 'log' }}</strong>, so emails are not sent to real inbox.
                        Use the button below for local verification.
                    </div>
                    <a href="{{ $localVerifyLink }}" class="tf-btn animate-btn mb-3 d-inline-flex">
                        Verify Email Now (Local)
                    </a>
                @endif
                <form method="POST" action="{{ route('verification.send') }}">
                    @csrf
                    <button type="submit" class="tf-btn animate-btn">Resend verification email</button>
                </form>
            </div>
        </section>
        @include('frontend::components.footer')
    </main>
@endsection

