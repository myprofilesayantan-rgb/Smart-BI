/* SMarBI Authentication Logic (login/login.js) */

document.addEventListener("DOMContentLoaded", () => {
  const authWrapper = document.getElementById("auth-wrapper");
  const authForm = document.getElementById("auth-form");
  const stateToggleLink = document.getElementById("state-toggle-link");
  const formTitle = document.getElementById("form-title");
  const stateToggleContainer = document.getElementById("state-toggle-container");
  const submitBtn = document.getElementById("auth-submit-btn");
  const submitText = document.getElementById("submit-text");
  const submitSpinner = document.getElementById("submit-spinner");
  
  const nameInput = document.getElementById("name-input");
  const emailInput = document.getElementById("email-input");
  const passwordInput = document.getElementById("password-input");
  const passwordToggle = document.getElementById("password-toggle");
  
  const ssoGoogleBtn = document.getElementById("sso-google-btn");
  const ssoDefaultBtn = document.getElementById("sso-default-btn");
  
  let isSignupState = false;

  // Toast System
  const showToast = (message, type = 'success') => {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "pointer-events-auto flex items-center gap-2.5 py-2 px-3.5 bg-white/95 backdrop-blur-md border border-outline rounded-xl shadow-lg transition-all duration-300 transform -translate-y-10 opacity-0 min-w-[200px] z-[100]";
    
    const icon = type === 'success' ? 'check_circle' : 'info';
    const iconColor = type === 'success' ? 'text-success' : 'text-primary';

    toast.innerHTML = `
      <span class="material-symbols-outlined ${iconColor} text-[18px]" style="font-variation-settings: 'FILL' 1;">${icon}</span>
      <span class="text-[10px] font-semibold text-on-surface font-body">${message}</span>
    `;

    container.appendChild(toast);

    gsap.to(toast, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power3.out"
    });

    setTimeout(() => {
      gsap.to(toast, {
        opacity: 0,
        y: -10,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          toast.remove();
        }
      });
    }, 3000);
  };

  // Check for logout param
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("logout") === "true") {
    // Show logout toast on load
    setTimeout(() => {
      showToast("Logged out successfully.", "success");
    }, 300);
    
    // Clean up URL query parameters without reloading
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: newurl }, '', newurl);
  }

  // State Switcher (Login vs Signup) via Event Delegation
  if (stateToggleContainer) {
    stateToggleContainer.addEventListener("click", (e) => {
      if (e.target && e.target.id === "state-toggle-link") {
        e.preventDefault();
        isSignupState = !isSignupState;

        // Animate transition using GSAP
        gsap.to(authWrapper, {
          opacity: 0,
          scale: 0.98,
          y: 5,
          duration: 0.2,
          onComplete: () => {
            if (isSignupState) {
              authWrapper.classList.remove("state-login");
              authWrapper.classList.add("state-signup");
              formTitle.innerText = "Create your account!";
              stateToggleContainer.innerHTML = 'Already have an account? <a href="#" id="state-toggle-link" class="text-primary font-bold hover:underline cursor-pointer">Log in</a>';
              submitText.innerText = "Create Free Account";
              nameInput.required = true;
            } else {
              authWrapper.classList.remove("state-signup");
              authWrapper.classList.add("state-login");
              formTitle.innerText = "Welcome back!";
              stateToggleContainer.innerHTML = 'Don\'t have an account? <a href="#" id="state-toggle-link" class="text-primary font-bold hover:underline cursor-pointer">Sign up</a>';
              submitText.innerText = "Log In";
              nameInput.required = false;
              nameInput.value = "";
            }

            validateForm();

            // Animate back in
            gsap.to(authWrapper, {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: "back.out(1.2)"
            });
          }
        });
      }
    });
  }

  // Form Field Validation (enables/disables button dynamically)
  const validateForm = () => {
    const isEmailFilled = emailInput.value.trim().length > 0;
    const isPasswordFilled = passwordInput.value.length >= 6;
    let isNameFilled = true;

    if (isSignupState) {
      isNameFilled = nameInput.value.trim().length > 0;
    }

    if (isEmailFilled && isPasswordFilled && isNameFilled) {
      submitBtn.removeAttribute("disabled");
    } else {
      submitBtn.setAttribute("disabled", "true");
    }
  };

  [nameInput, emailInput, passwordInput].forEach(input => {
    input.addEventListener("input", validateForm);
  });

  // Password Visibility Toggle
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      passwordToggle.innerText = type === "password" ? "visibility" : "visibility_off";
    });
  }

  // Simulated Email & Password Auth Submission
  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Disable inputs during submission
      nameInput.setAttribute("disabled", "true");
      emailInput.setAttribute("disabled", "true");
      passwordInput.setAttribute("disabled", "true");
      submitBtn.setAttribute("disabled", "true");
      
      // Show loading spinner
      submitSpinner.classList.remove("hidden");
      submitText.classList.add("opacity-50");

      setTimeout(() => {
        // Show success notification
        if (isSignupState) {
          showToast("Account created successfully! Setting up your workspace...", "success");
        } else {
          showToast("Welcome back! Redirecting to dashboard...", "success");
        }

        // Redirect based on state
        setTimeout(() => {
          if (isSignupState) {
            window.location.href = "onboarding.html";
          } else {
            window.location.href = "dashboard.html";
          }
        }, 1200);
      }, 1500);
    });
  }

  // Simulated Google SSO Click
  if (ssoGoogleBtn) {
    ssoGoogleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Simulate quick pulse on the card
      gsap.to(ssoGoogleBtn, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });
      
      // Show loading state
      const ssoEmail = ssoGoogleBtn.querySelector(".text-on-surface-variant");
      const ssoLabel = ssoGoogleBtn.querySelector(".text-on-surface");
      if (ssoEmail) ssoEmail.innerText = isSignupState ? "Creating account..." : "Signing in...";
      if (ssoLabel) ssoLabel.innerText = isSignupState ? "Signing up with Google" : "Connecting Google account";

      setTimeout(() => {
        if (isSignupState) {
          showToast("Account created with Google! Welcome to SMarBI.", "success");
        } else {
          showToast("Logged in with Google as San.", "success");
        }
        
        setTimeout(() => {
          if (isSignupState) {
            window.location.href = "onboarding.html";
          } else {
            window.location.href = "dashboard.html";
          }
        }, 1000);
      }, 1200);
    });
  }

  // Simulated Default SSO Click
  if (ssoDefaultBtn) {
    ssoDefaultBtn.addEventListener("click", (e) => {
      e.preventDefault();
      gsap.to(ssoDefaultBtn, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });
      
      showToast("Redirecting to corporate SSO gate...", "info");
      
      setTimeout(() => {
        if (isSignupState) {
          showToast("Corporate account created via SSO.", "success");
        } else {
          showToast("SSO Authorized.", "success");
        }
        setTimeout(() => {
          if (isSignupState) {
            window.location.href = "onboarding.html";
          } else {
            window.location.href = "dashboard.html";
          }
        }, 800);
      }, 1500);
    });
  }

  // Entrance animations for elements
  gsap.from(".ambient-blur-circle", {
    opacity: 0,
    duration: 1.5,
    stagger: 0.3,
    ease: "power2.out"
  });

  gsap.from("#auth-wrapper", {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: "power4.out"
  });
});
