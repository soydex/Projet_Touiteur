const logged_as = document.getElementById("logged_as");
const nameInput = document.getElementById("name");
const nameLabel = document.getElementById("nameLabel");
const connect = document.querySelector("#login > a:nth-child(1)");
const create = document.querySelector("#login > a:nth-child(2)");
const decobtn = document.getElementById("deco-btn");
const userCount = document.getElementById("user_count");

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    fetch("https://touiteur.cefim-formation.org/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          alert("Votre session a expiré. Veuillez vous reconnecter.");
          localStorage.clear();
          window.location.href = "connect.html";
          return null;
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          const pseudo = data.logged_in_as.name;
          localStorage.setItem("username", pseudo);
          console.log("Utilisateur connecté :", data);
          logged_as.textContent = "Bonjour, " + data.logged_in_as.name;
          nameInput.disabled = true;
          nameInput.style.display = "none";
          nameLabel.style.display = "none";
          connect.style.display = "none";
          create.style.display = "none";
          decobtn.style.display = "inline";
          logged_as.style.display = "block";
        }
      })
      .catch((error) => console.error("Erreur :", error));
  } else {
    console.error("Aucun token trouvé. Veuillez vous connecter.");
  }
});

const tweetsContainer = document.getElementById("touits");
const p_state = document.getElementById("state");

const sortSelect = document.getElementById("sort-select");
let touitsData = [];
sortSelect.addEventListener("change", function () {
  const selectedValue = sortSelect.value;

  if (selectedValue === "recent") {
    console.log("Trier par le plus récent");
    touitsData.sort((a, b) => b.id - a.id);
    displayTouits(touitsData);
  } else if (selectedValue === "old") {
    console.log("Trier par le plus ancien");
    touitsData.sort((a, b) => a.id - b.id);
    displayTouits(touitsData);
  } else if (selectedValue === "like") {
    console.log("Trier par le plus likés");
    touitsData.sort((a, b) => b.likes - a.likes);
    displayTouits(touitsData);
  } else if (selectedValue === "coms") {
    console.log("Trier par le plus commenté");
    touitsData.sort((a, b) => b.comments_count - a.comments_count);
    displayTouits(touitsData);
  } else {
    console.log("Option non reconnue");
  }
  displayTouits(touitsData);
});

fetch(apiUrllist)
  .then((response) => {
    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} - ${response.statusText}`
      );
    }
    return response.json();
  })
  .then((data) => {
    if (Array.isArray(data.messages)) {
      touitsData = data.messages;
      touitsData.sort((a, b) => b.id - a.id);
      displayTouits(touitsData);
    } else {
      tweetsContainer.innerHTML = "<p>No Touits found.</p>";
    }
  })
  .catch((error) => {
    console.error("Error fetching Touits:", error);
    tweetsContainer.innerHTML = `<p>Une erreur est survenue : ${error.message}</p>`;
  });

function displayTouits(touits) {
  tweetsContainer.innerHTML = "";
  touits.forEach((touit) => {
    const tweetElement = document.createElement("div");
    tweetElement.classList.add("touit");
    tweetElement.id = 'touit-' + touit.id;

    const avatarUrl = generateAvatarUrl(touit.name, 200);

    const avatardiv = document.createElement("div");

    avatardiv.classList.add("avatar_div", "skeleton");

    const avatar = document.createElement("img");
    avatar.src = avatarUrl;
    avatar.alt = `Avatar de ${touit.name}`;
    avatar.loading = "lazy";

    avatar.onload = () => {
      avatardiv.classList.remove("skeleton");
    };

    avatardiv.appendChild(avatar);

    const nameElement = document.createElement("h3");
    nameElement.textContent = touit.name;
    if (touit.is_user_authenticated == true) {
      nameElement.classList.add("verified");
    }
    const timestampElement = document.createElement("strong");
    timestampElement.textContent = formatDate(touit.ts);

    const messageElement = document.createElement("p");
    messageElement.textContent = touit.message;

    const reactsdiv = document.createElement("div");
    reactsdiv.classList.add("reacts");

    const likesdiv = document.createElement("div");
    likesdiv.classList.add("likes");

    const likesButton = document.createElement("button");
    likesButton.textContent = touit.likes;
    likesdiv.appendChild(likesButton);

    function updateLikesUI(newLikes) {
      touit.likes = newLikes;
      likesButton.textContent = touit.likes;
    }

    likesButton.addEventListener("click", function () {
      if (!likesButton.classList.contains("liked")) {
        likesButton.classList.add("liked");
        sendlike(touit.id)
          .then((data) => {
            console.log("Données reçues :", data);
            if (data.success) {
              updateLikesUI(touit.likes + 1);
            } else {
              console.error("Erreur de l'API :", data);
              likesButton.classList.remove("liked");
            }
          })
          .catch((error) => {
            console.error("Erreur lors de l'envoi du like :", error);
            likesButton.classList.remove("liked");
          });
      } else {
        likesButton.classList.remove("liked");
        sendRemoveLike(touit.id)
          .then((data) => {
            console.log("Données reçues :", data);
            if (data.success) {
              updateLikesUI(touit.likes - 1);
            } else {
              console.error("Erreur de l'API :", data);
              likesButton.classList.add("liked");
            }
          })
          .catch((error) => {
            console.error("Erreur lors du retrait du like :", error);
            likesButton.classList.add("liked");
          });
      }
    });

    // Réactions
    const reactdiv = document.createElement("div");
    const reactbutton = document.createElement("button");
    const reactions = Object.entries(touit.reactions)
      .map(([emoji, count]) => `<span>${emoji} : ${count}</span>`)
      .join(" ");
    if (reactions.length === 0) {
      reactbutton.textContent = "+  Réagir";
    } 
    else {
    reactbutton.innerHTML = reactions;}
      
    reactbutton.classList.add("react-button");
    reactbutton.addEventListener("click", () => {
      const emojiContainer = reactdivchild; // Cibler le conteneur local
      emojiContainer.innerHTML = "";
      allowedsreacts(emojiContainer,touit.id); // Appel avec le conteneur spécifique
      if (emojiContainer.style.display === "none") {
        emojiContainer.style.display = "flex";
      } else {
        emojiContainer.style.display = "none";
      }
    });

    const reactdivchild = document.createElement("div");
    reactdivchild.id="emoji-container";
    reactdivchild.style.display = "none";

    reactdiv.appendChild(reactdivchild);
    reactdiv.appendChild(reactbutton);
    reactdiv.classList.add("react");

    // Section des commentaires
    const comsdiv = document.createElement("div");
    comsdiv.classList.add("coms");

    const comsButton = document.createElement("button");
    comsButton.classList.add("coms-btn");
    comsButton.textContent = touit.comments_count;
    comsdiv.appendChild(comsButton);

    const contenucom = document.createElement("input");
    contenucom.classList.add("com_message");
    contenucom.type = "text";
    contenucom.placeholder = "Votre commentaire";
    contenucom.style.display = "none";
    comsdiv.appendChild(contenucom);

    const comsButtonSubmit = document.createElement("button");
    comsButtonSubmit.type = "button";
    comsButtonSubmit.classList.add("animated-button");
    comsButtonSubmit.textContent = "Envoyer";
    comsButtonSubmit.style.display = "none";
    comsdiv.appendChild(comsButtonSubmit);

    reactsdiv.appendChild(likesdiv);
    reactsdiv.appendChild(comsdiv);
    reactsdiv.appendChild(reactdiv);

    const tweettext = document.createElement("div");
    tweettext.classList.add("text_div");
    tweetElement.appendChild(avatardiv);
    tweettext.appendChild(nameElement);
    tweettext.appendChild(timestampElement);
    tweettext.appendChild(messageElement);
    tweettext.appendChild(reactsdiv);
    tweetElement.appendChild(tweettext);
    tweetsContainer.appendChild(tweetElement);

    comsButton.addEventListener("click", function () {
      if (contenucom.style.display === "none") {
        contenucom.style.display = "block";
        comsButtonSubmit.style.display = "inline-block";
        displayscoms(touit.id, tweettext);
      } else {
        contenucom.style.display = "none";
        comsButtonSubmit.style.display = "none";
        let clearclass = document.querySelector(".comments-container");
        clearclass.innerHTML = "";
      }
    });

    comsButtonSubmit.addEventListener("click", function () {
      const token = localStorage.getItem("authToken");
      const usernamelocal = localStorage.getItem("username");
      const comment = contenucom.value.trim();
      if (comment.length === 0) {
        alert("Le commentaire ne peut pas être vide.");
        return;
      }
      const username = token ? usernamelocal : "User";
      sendcom(username, touit.id, comment)
        .then(() => {
          contenucom.value = "";
          const comElement = document.querySelector(".comments-container");
          comElement.innerHTML = "";
          displayscoms(touit.id, tweettext);
        })
        .catch((error) => {
          console.error("Erreur lors de l'envoi du commentaire :", error);
        });
    });
  });
}

const submitTouit = document.getElementById("submit-touit");

function sendTouit(message, token = null, name = null) {
  const trimmedMessage = message.trim();

  if (trimmedMessage.length < 3 || trimmedMessage.length > 256) {
    console.error("Le message doit faire entre 3 et 256 caractères.");
    p_state.textContent = "Le message doit faire entre 3 et 256 caractères.";
    p_state.style.color = "red";
    return;
  }

  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  const params = new URLSearchParams();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    params.append("message", trimmedMessage);
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 16) {
      console.error("Le nom doit faire entre 3 et 16 caractères.");
      p_state.textContent = "Le nom doit faire entre 3 et 16 caractères.";
      p_state.style.color = "red";
      return;
    }
    params.append("name", trimmedName);
    params.append("message", trimmedMessage);
  }

  p_state.textContent = "Envoi en cours...";
  p_state.style.color = "black";

  return fetch(sendTouitUrl, {
    method: "POST",
    headers: headers,
    body: params,
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((err) => {
          throw new Error(err);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Touit envoyé :", data);
      p_state.textContent = "Touit envoyé !";
      p_state.style.color = "rgba(102, 102, 102, 0.8)";
      fetch(apiUrllist)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data.messages)) {
            touitsData = data.messages;
            touitsData.sort((a, b) => b.id - a.id);
            displayTouits(touitsData);
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la mise à jour des touits :", error);
        });
    })
    .catch((error) => {
      p_state.textContent = "Erreur lors de l'envoi : " + error.message;
      p_state.style.color = "red";
      console.error("Erreur lors de l'envoi :", error.message || error);
    });
}


submitTouit.addEventListener("click", function (event) {
  event.preventDefault();

  const token = localStorage.getItem("authToken");
  const content = document.getElementsByName("touit")[0].value;
  const contentInput = document.getElementById("touit");
  if (token) {
    sendTouit(content, token);
    touitsData.sort((a, b) => b.id - a.id);
    displayTouits(touitsData);
    contentInput.value = "";
  } else {
    const username = document.getElementsByName("name")[0].value;
    sendTouit(content, null, username);
    touitsData.sort((a, b) => b.id - a.id);
    displayTouits(touitsData);
    contentInput.value = "";
  }
  console.log("Touit envoyé !");
});


fetch(trendingUrl, {
  method: "GET",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
})
  .then((response) => {
    if (!response.ok) {
      return response.text().then((err) => {
        throw new Error(err);
      });
    }
    return response.json();
  })
  .then((data) => {
    const box = document.getElementById("tendances_list");
    if (!box) {
      console.error("L'élément avec l'ID 'tendances_list' est introuvable.");
      return;
    }
    box.innerHTML = "";
    const sortedEntries = Object.entries(data).sort(
      ([, countA], [, countB]) => countB - countA
    );

    for (const [term, count] of sortedEntries) {
      const termElement = document.createElement("li");
      termElement.textContent = `${term} : ${count} Touits`;
      termElement.style.cursor = "pointer";
      termElement.addEventListener("click", () => {
        document.querySelectorAll('.touit p').forEach((p) => {
          p.style.backgroundColor = "transparent";
          if (p.textContent.includes(term)) {
            p.style.backgroundColor = "yellow";
          }
        });
      });
      box.appendChild(termElement);
    }
  })
  .catch((error) => {
    console.error("Erreur :", error);
  });

fetch(influeUrl, {
  method: "GET",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
})
  .then((response) => {
    if (!response.ok) {
      return response.text().then((err) => {
        throw new Error(err);
      });
    }
    return response.json();
  })
  .then((data) => {
    const box = document.getElementById("influ_list");
    if (!box) {
      console.error("L'élément avec l'ID 'influ_list' est introuvable.");
      return;
    }
    box.innerHTML = "";
    userCount.textContent=`Nombres de comptes : ${data.user_count}`;
    const influencers = data.influencers;
    const entries = Object.entries(influencers);
    entries.sort(([, statsA], [, statsB]) => statsB.messages - statsA.messages);
    console.log(entries)

    const premier = makeInfluencerBox(entries[0][0], entries[0][1]);
    premier.style.backgroundColor = "#DAA520";
    const second = makeInfluencerBox(entries[1][0], entries[1][1]);
    second.style.backgroundColor = "silver";

    const troisieme = makeInfluencerBox(entries[2][0], entries[2][1]);
    troisieme.style.backgroundColor = "#CD7F32";


    box.appendChild(second);
    box.appendChild(premier);
    box.appendChild(troisieme);
  })
  .catch((error) => {
    console.error("Erreur :", error);
  });
