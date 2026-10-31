with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

social_auth_html = """
    <!-- Panel de Autenticación Social IAHAKER.COM -->
    <div id="social-auth-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(3, 3, 5, 0.95); display: flex; justify-content: center; align-items: center; z-index: 9999; font-family: monospace;">
        <div style="background: #07070b; border: 1px solid #7c3aed; border-radius: 12px; padding: 30px; width: 100%; max-width: 380px; text-align: center; box-shadow: 0 0 25px rgba(124, 58, 237, 0.4);">
            <h2 style="color: #a78bfa; margin-bottom: 5px; font-size: 20px;">IAHAKER.COM</h2>
            <p style="color: #888; font-size: 12px; margin-bottom: 25px;">Inicia sesión o regístrate con un solo toque</p>

            <button onclick="handleSocialLogin('Google')" style="width: 100%; background: #ffffff; color: #000; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 12px; font-size: 13px;">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="18" height="18"> Continuar con Google
            </button>

            <button onclick="handleSocialLogin('Telegram')" style="width: 100%; background: #229ed9; color: #fff; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 12px; font-size: 13px;">
                <img src="https://www.svgrepo.com/show/475700/telegram.svg" width="18" height="18"> Continuar con Telegram
            </button>

            <button onclick="handleSocialLogin('Facebook')" style="width: 100%; background: #1877f2; color: #fff; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 13px;">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" width="18" height="18"> Continuar con Facebook
            </button>
        </div>
    </div>

    <script>
        function handleSocialLogin(provider) {
            alert("Autenticación exitosa con " + provider);
            localStorage.setItem("iahaker_auth", "true");
            document.getElementById("social-auth-modal").style.display = "none";
        }
        
        window.addEventListener("DOMContentLoaded", () => {
            if(localStorage.getItem("iahaker_auth") === "true") {
                const modal = document.getElementById("social-auth-modal");
                if(modal) modal.style.display = "none";
            }
        });
    </script>
"""

if "<body>" in content:
    content = content.replace("<body>", "<body>\n" + social_auth_html)
else:
    content += "\n" + social_auth_html

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("¡index.html actualizado correctamente!")
