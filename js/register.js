const registerUrl = "https://touiteur.cefim-formation.org/user/register";
const loginUrl = "https://touiteur.cefim-formation.org/user/login";
const p_state = document.getElementById("state");

function registerUser(username, password) {
  p_state.innerHTML = "";
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  return fetch(registerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw err;
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Utilisateur enregistré :", data);
      p_state.style.display='block';
      p_state.textContent = "Bienvenue ! " + username;
      p_state.style.color = "rgba(102, 102, 102, 0.8)";
      setTimeout(() => { window.location.href = "connect.html"; }, 1000);
      return data;
    })
    .catch((error) => {
      console.error("Erreur lors de l'enregistrement :", error.error || error);
      p_state.style.display='block';
      p_state.textContent = error.error;
      p_state.style.color = 'red';

    });
}

const submitButton = document.getElementById("submit-create");

submitButton.addEventListener("click", function (event) {
  event.preventDefault();
  const username = document.getElementsByName("uname")[0].value;
  const password = document.getElementsByName("psw")[0].value;
  registerUser(username, password);
});