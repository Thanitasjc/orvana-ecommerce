<div class="modal modalCentered fade modal-log" id="login">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="icon-close-popup" data-bs-dismiss="modal">
                    <i class="icon icon-close"></i>
                </div>
                <h3 class="title-pop text-primary text-center">Log In</h3>
                <form class="form-log" method="POST" action="{{ route('frontend.auth.login') }}">
                    @csrf
                    <div class="form-content">
                        <fieldset class="tf-field">
                            <label for="email3" class="tf-lable">Email<span class="text-secondary">*</span></label>
                            <input type="email" id="email3" name="email" placeholder="Email" required>
                        </fieldset>
                        <fieldset class="tf-field ">
                            <label for="password-log" class="tf-lable ">Password<span
                                    class="text-secondary">*</span></label>
                            <div class="password-wrapper">
                                <input class="password-field" type="password" id="password-log" name="password"
                                    placeholder="Password" required>
                                <span class="toggle-pass icon-eye-open"></span>
                            </div>
                        </fieldset>
                        <div class="check-bottom">
                            <div class="checkbox-wrap">
                                <input id="save" name="remember" type="checkbox" class="tf-check style-4 radius-3">
                                <label for="save" class="text-primary text-caption-01">
                                    Remember me
                                </label>
                            </div>
                            <a href="#forgotPassword" data-bs-toggle="modal"
                                class="text-caption-01 text-decoration-underline text-primary fw-medium link-2">
                                Forgot Your Password?
                            </a>
                        </div>
                        <button type="submit" class="tf-btn animate-btn w-100">
                            Login
                        </button>
                        <p class="dont-have text-caption-01 text-center">
                            Not registered yet?
                            <a href="#register" data-bs-toggle="modal"
                                class=" text-decoration-underline text-primary fw-medium link-2">
                                Sign Up
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
