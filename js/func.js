function logoutUser() {
  localStorage.removeItem("authToken");
  console.log("Déconnecté, token supprimé.");
  window.location.href = "explore.html";
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const modal = document.getElementById("modal");
const openModalButton = document.getElementById("open-modal");
const closeModalButton = document.getElementById("close-modal");
const modalContent = document.getElementById("modal-content");

openModalButton.addEventListener("click", () => {
  fetch(`${apiUrl}/likes/top`, {
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
      const touit = data.top[0]; // On prend le premier touit de la liste
      const tweetElement = document.createElement("div");
      tweetElement.classList.add("touit");

      const avatarUrl = generateAvatarUrl(touit.name, 200); // Générer l'URL de l'avatar

      const avatardiv = document.createElement("div");
      const avatar = document.createElement("img");
      avatar.src = avatarUrl;
      avatar.alt = `Avatar de ${touit.name}`;
      avatar.loading = "lazy";
      avatardiv.appendChild(avatar);
      avatardiv.classList.add("avatar_div");

      const nameElement = document.createElement("h3");
      nameElement.textContent = touit.name;
      if (touit.is_user_authenticated) {
        nameElement.classList.add("verified");
      }

      const timestampElement = document.createElement("strong");
      timestampElement.textContent = new Date(touit.ts).toLocaleString();

      const messageElement = document.createElement("p");
      messageElement.textContent = touit.message;

      const reactsdiv = document.createElement("div");
      reactsdiv.classList.add("reacts");

      const likesdiv = document.createElement("div");
      likesdiv.classList.add("likes");

      const likesButton = document.createElement("button");
      likesButton.textContent = touit.likes;
      likesdiv.appendChild(likesButton);

      const comsdiv = document.createElement("div");
      comsdiv.classList.add("coms");

      const comsButton = document.createElement("button");
      comsButton.classList.add("coms-btn");
      comsButton.textContent = `${touit.comments_count}`;
      comsdiv.appendChild(comsButton);

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

      modalContent.innerHTML = "";
      modalContent.appendChild(tweetElement);
      modal.classList.add("active");
    })
    .catch((error) => {
      console.error("Erreur :", error);
      modalContent.innerHTML = `<p style="color: red;">Erreur : ${error.message}</p>`;
      modal.classList.add("active");
    });
});

closeModalButton.addEventListener("click", () => {
  modal.classList.remove("active");
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.remove("active");
  }
});

function makeInfluencerBox(username, stats) {
  const avatar = generateAvatarUrl(username, 200);
  const ppavart = document.createElement("img");
  ppavart.src = avatar;

  const divinflu = document.createElement("div");
  divinflu.classList.add("divinflu");

  const influname = document.createElement("h3");
  influname.textContent = username;

  const termElement = document.createElement("li");
  termElement.classList.add("player");
  const termElementparagraph = document.createElement("p");
  const termElementparagraph2 = document.createElement("p");

  termElementparagraph.textContent = `${stats.messages} messages`;
  termElementparagraph2.textContent = `${stats.comments} commentaires`;

  termElement.style.height = `${stats.messages * 10 + 250}px`;

  termElement.appendChild(ppavart);
  termElement.appendChild(influname);
  termElement.appendChild(termElementparagraph);
  termElement.appendChild(termElementparagraph2);

  return termElement;
}

function getTouit() {
  const id = prompt("Entrez l'id du touit à afficher :").trim(); // Nettoie les espaces inutiles

  if (!id) {
    alert("L'ID est requis pour effectuer la requête.");
    return;
  }

  const url = `${apiUrl}/get?id=${encodeURIComponent(id)}`;

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((err) => {
          throw new Error(err || `Erreur HTTP ${response.status}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      modalContent.innerHTML = `<p>Succès : ${JSON.stringify(data)}</p>`;
      const touit = data.data;

      const reactions = Object.entries(touit.reactions)
        .map(([emoji, count]) => `<span>${emoji} : ${count}</span>`)
        .join(", ");

      const date = new Date(touit.ts).toLocaleString(); // Conversion timestamp en date lisible

      modalContent.innerHTML = `
        <div style="border: 1px solid #ddd; padding: 16px; border-radius: 8px;">
          <h2>${touit.name}</h2>
          <p>${touit.message}</p>
          <p><strong>Likes :</strong> ${touit.likes}</p>
          <p><strong>Commentaires :</strong> ${touit.comments_count}</p>
          <p><strong>Réactions :</strong> ${reactions}</p>
          <p><strong>Date :</strong> ${date}</p>
          <p><strong>Authentifié :</strong> ${
            touit.is_user_authenticated ? "Oui" : "Non"
          }</p>
        </div>
      `;
      modal.classList.add("active");
    })
    .catch((error) => {
      console.error("Erreur :", error);
      modalContent.innerHTML = `<p style="color: red;">Erreur : ${error.message}</p>`;
      modal.classList.add("active");
    });
}

function allowedsreacts(container, message_id) {
  // Fonction pour afficher les emojis autorisés
  fetch(apiUrl + "/reactions/allowed", {
    // Requête pour récupérer les emojis autorisés
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((err) => {
          throw new Error(err || `Erreur HTTP ${response.status}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      data.forEach((emoji) => {
        const emojiDiv = document.createElement("div");
        const emojiA = document.createElement("button");
        emojiA.onclick = function () {
          console.log("Emoji cliqué :", emoji);
          console.log("Touit ID :", message_id);
          addReacts(message_id, emoji);
          emojiA.textContent = `L'emoji ${emoji} a été ajouté !`;
        };
        emojiA.textContent = emoji;
        emojiA.classList.add("emoji-link");
        emojiDiv.appendChild(emojiA);
        container.appendChild(emojiDiv);
      });
    })
    .catch((error) => {
      console.error("Erreur :", error);
      modalContent.innerHTML = `<p style="color: red;">Erreur : ${error.message}</p>`;
      modal.classList.add("active");
    });
}

function addReacts(message_id, symbol) {
  const params = new URLSearchParams();
  params.append("message_id", message_id);
  params.append("symbol", symbol);

  return fetch(apiUrl + "/reactions/add", {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
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
      console.log("Emoji envoyé :", data);
      return data;
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoi du like :", error);
      throw error;
    });
}




// FONCTION COMMENTAIRE 
function displayscoms(message_id, tweetElement) {
  let comElement = document.querySelector(".comments-container");

  if (!comElement) { // Si le conteneur n'existe pas, on le crée
    comElement = document.createElement("div");
    comElement.classList.add("comments-container");
    tweetElement.appendChild(comElement);
  }

  const params = new URLSearchParams();
  params.append("message_id", message_id);

  fetch(`${comUrl}?${params.toString()}`, { // Requête pour récupérer les commentaires
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
      comElement.innerHTML = "";
      if (Array.isArray(data.comments) && data.comments.length > 0) {
        data.comments.forEach((comment) => {
          const commentDiv = document.createElement("div");
          commentDiv.classList.add("comment");
          const nameElement = document.createElement("h3");
          nameElement.textContent = comment.name;
          const timestampElement = document.createElement("strong");
          timestampElement.textContent = formatDate(comment.ts);
          const messageElement = document.createElement("p");
          messageElement.textContent = comment.comment;
          commentDiv.appendChild(nameElement);
          commentDiv.appendChild(timestampElement);
          commentDiv.appendChild(messageElement);
          comElement.appendChild(commentDiv);
        });
      } else {
        comElement.innerHTML = "<p>Aucun commentaire trouvé.</p>";
      }
      tweetElement.appendChild(comElement);
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des commentaires :", error);
      comElement.innerHTML = `<p>Erreur lors de la récupération des commentaires : ${error.message}</p>`;
      tweetElement.appendChild(comElement);
    });
}

// Fonction pour ajouter un commentaire
/**
 * Sends a comment to the server.
 *
 * @param {string} name - The name of the commenter.
 * @param {number} message_id - The ID of the message being commented on.
 * @param {string} comment - The content of the comment.
 * @returns {Promise<Object>} A promise that resolves to the server's response data.
 * @throws {Error} Throws an error if the request fails.
 */
async function sendcom(name, message_id, comment) {
  const params = new URLSearchParams();
  params.append("name", name);
  params.append("message_id", message_id);
  params.append("comment", comment);

  return fetch(sendcomUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })
    .then(async (response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.error || "Unknown error");
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Commentaire envoyé :", data);
      return data;
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoi :", error.message || error);
      throw error;
    });
}


/**
 * Generates a URL for a user's avatar.
 *
 * @param {string} username - The username for which to generate the avatar URL.
 * @param {number} [size=850] - The size of the avatar image. Defaults to 850 if not provided.
 * @returns {string} The generated URL for the user's avatar.
 */
function generateAvatarUrl(username, size = 200) {
  return `https://avatar.iran.liara.run/public/boy?username=${username}&size=${size}`;
}


//FONCTION LIKE


/**
 * Sends a like for a specific message.
 *
 * @async
 * @function sendlike
 * @param {string} message_id - The ID of the message to like.
 * @returns {Promise<Object>} The response data from the server.
 * @throws {Error} If there is an error during the request.
 */
async function sendlike(message_id) {
  const params = new URLSearchParams();
  params.append("message_id", message_id);

  try {
    const response = await fetch(sendlikeUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    console.log("Like envoyé :", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de l'envoi du like :", error);
    throw error;
  }
}


/**
 * Sends a request to remove a like from a message.
 *
 * @param {number} message_id - The ID of the message to remove the like from.
 * @returns {Promise<Object>} A promise that resolves to the response data.
 * @throws {Error} If the request fails or the response is not ok.
 */
async function sendRemoveLike(message_id) {
  const params = new URLSearchParams();
  params.append("message_id", message_id);

  try {
    const response = await fetch(removelikeUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    console.log("Like retiré :", data);
    return data;
  } catch (error) {
    console.error("Erreur lors du retrait du like :", error);
    throw error;
  }
}