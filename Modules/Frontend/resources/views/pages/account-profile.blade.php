@extends('frontend::layouts.app')

@section('title', 'My Profile - Orvana')

@section('content')
    <main id="wrapper">
        @include('frontend::components.top-bar')
        @include('frontend::components.header-product')
        <section class="flat-spacing">
            <div class="container" style="max-width: 760px;">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3 class="text-primary mb-0">My Profile</h3>
                    <a href="{{ route('frontend.account.orders') }}" class="link-underline text-primary">My Orders</a>
                </div>

                <form method="POST" action="{{ route('frontend.account.profile.update') }}" class="d-grid gap-3">
                    @csrf
                    <div>
                        <label class="form-label">Name</label>
                        <input type="text" name="name" class="form-control" value="{{ old('name', $user->name) }}" required>
                    </div>
                    <div>
                        <label class="form-label">Email</label>
                        <input type="email" name="email" class="form-control" value="{{ old('email', $user->email) }}" required>
                        @if (! $user->hasVerifiedEmail())
                            <small class="text-danger d-block mt-1">Email is not verified yet.</small>
                        @endif
                    </div>
                    <button type="submit" class="tf-btn animate-btn">Save Profile</button>
                </form>
            </div>
        </section>
        @include('frontend::components.footer')
    </main>
@endsection

