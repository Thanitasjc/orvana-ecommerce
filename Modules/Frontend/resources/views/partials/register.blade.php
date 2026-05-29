<div class="modal modalCentered fade modal-log register" id="register">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="icon-close-popup" data-bs-dismiss="modal">
                    <i class="icon icon-close"></i>
                </div>
                <h3 class="title-pop text-primary text-center">Register</h3>
                <form class="form-log" method="POST" action="{{ route('frontend.auth.register') }}">
                    @csrf
                    <div class="form-content">
                        <fieldset class="tf-field">
                            <label for="name" class="tf-lable">Name<span class="text-secondary">*</span></label>
                            <input type="text" id="name" name="name" placeholder="Name" required>
                        </fieldset>
                        <fieldset class="tf-field">
                            <label for="email" class="tf-lable">Email<span class="text-secondary">*</span></label>
                            <input type="email" id="email" name="email" placeholder="Email" required>
                        </fieldset>
                        <fieldset class="tf-field ">
                            <label for="password" class="tf-lable ">Password<span
                                    class="text-secondary">*</span></label>
                            <div class="password-wrapper">
                                <input class="password-field" type="password" id="password" name="password"
                                    placeholder="Password" required>
                                <span class="toggle-pass icon-eye-open"></span>
                            </div>
                        </fieldset>
                        <fieldset class="tf-field ">
                            <label for="password2" class="tf-lable ">Confirm password<span
                                    class="text-secondary">*</span></label>
                            <div class="password-wrapper">
                                <input class="password-field" type="password" id="password2" name="password_confirmation"
                                    placeholder="Confirm password" required>
                                <span class="toggle-pass icon-eye-open"></span>
                            </div>
                        </fieldset>
                        <div class="check-bottom">
                            <div class="checkbox-wrap">
                                <input id="agree" type="checkbox" class="tf-check style-4 radius-3">
                                <label for="agree" class="text-primary text-caption-01">
                                    I agree to the
                                    <a href="#" class="text-decoration-underline fw-medium text-primary link-2">Terms of
                                        User</a>
                                </label>
                            </div>

                        </div>
                        <button type="submit" class="tf-btn animate-btn w-100">
                            Create A New Account
                        </button>
                        <p class="dont-have text-caption-01 text-center">
                            Already have an account?
                            <a href="#login" data-bs-toggle="modal"
                                class=" text-decoration-underline text-primary fw-medium link-2">
                                Login Here
                            </a>
                        </p>
                        <p class="log-orther text-caption-01">
                            <span></span>
                            or sign up with
                            <span></span>
                        </p>
                        <div class="group-btn">
                            <a href="#" class="tf-btn style-stroke w-100">
                                <span class="icon">
                                    <img loading="lazy" width="24" height="24" src="{{ asset('assets/images/logo/face.svg') }}"
                                        alt="Image">
                                </span>
                                Facebook
                            </a>
                            <a href="#" class="tf-btn style-stroke w-100">
                                <span class="icon">
                                    <img loading="lazy" width="24" height="24" src="{{ asset('assets/images/logo/google.svg') }}"
                                        alt="Image">
                                </span>
                                Google
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
