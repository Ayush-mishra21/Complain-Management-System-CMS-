document.addEventListener("DOMContentLoaded", () => {

    window.showSignup = function () {
        document.getElementById("loginForm").classList.add("hidden");
        document.getElementById("signupForm").classList.remove("hidden");
    };

    window.showLogin = function () {
        document.getElementById("signupForm").classList.add("hidden");
        document.getElementById("loginForm").classList.remove("hidden");
    };

   window.toggleFields = function () {
      const type = document.getElementById("userType").value;

      const emp = document.getElementById("employeeField");
      const adm = document.getElementById("adminField");

      if (emp) {
        emp.classList.toggle("hidden", type !== "Employee");
      }

      if (adm) {
        adm.classList.toggle("hidden", type !== "Admin");
      }
    };

    // ===== PASSWORD LOGIC =====
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmpassword");
    const msg = document.getElementById("msg");

    function checkPassword() {
        if (!password || !confirmPassword) return;

        if (confirmPassword.value === "") {
            msg.textContent = "";
            return;
        }

        if (password.value === confirmPassword.value) {
            msg.style.color = "green";
            msg.textContent = "Passwords matched ✔";
        } else {
            msg.style.color = "red";
            msg.textContent = "Password not matched ❌";
        }
    }

    password?.addEventListener("input", checkPassword);
    confirmPassword?.addEventListener("input", checkPassword);

    // ===== FORM SUBMIT =====
    const form = document.getElementById("signup");

    form?.addEventListener("submit", (e) => {
        if (password.value !== confirmPassword.value) {
            e.preventDefault();
            msg.style.color = "red";
            msg.textContent = "Fix password before submitting ❌";
        }
        const btn = document.getElementById("submitBtn");
        if (btn.disabled) {
          e.preventDefault(); 
          return;
         }
        btn.disabled = true;
        btn.innerText = "Wait Create An Account... ⏳";
    });

});   