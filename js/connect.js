const loginUrl = "https://touiteur.cefim-formation.org/user/login";
const p_state = document.getElementById("state");

function loginUser(username, password) {
  p_state.innerHTML = "";
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  return fetch(loginUrl, {
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
      console.log("Réponse API Login :", data); 
      const token = data.access_token;
      if (token) {
        localStorage.removeItem("authToken");
        localStorage.setItem("authToken", token);
        console.log(localStorage.getItem("authToken"));
      } else {
        console.error("Token non trouvé dans la réponse.");
      }    
      console.log("Nouveau token enregistré :", token);
      p_state.style.display = "block";
      setTimeout(() => { window.location.href = "explore.html"; }, 1000);
      return token;
    })
    .catch((error) => {
      console.error("Erreur lors de la connexion :", error.error || error);
      p_state.textContent = error.error;
      p_state.style.color = "red";
      p_state.style.display='block';
      p_state.classList.remove("loader")
    });
}

const submitButtonconnect = document.getElementById("submit");

submitButtonconnect.addEventListener("click", function (event) {
  const username = document.getElementsByName("uname")[0].value;
  const password = document.getElementsByName("psw")[0].value;
  loginUser(username, password);
  event.preventDefault()
});
