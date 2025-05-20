document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("produs-modal");
  const modalDetalii = document.getElementById("modal-detalii");
  const closeBtn = document.querySelector(".modal-close");

  document.querySelectorAll(".titlu-modal").forEach(titlu => {
    titlu.addEventListener("click", (e) => {
      e.stopPropagation();

      const produs = titlu.closest("article.produs");

      const nume = produs.dataset.nume;
      const pret = produs.dataset.pret;
      const img = produs.dataset.img;
      const greutate = produs.dataset.greutate;
      const culoare = produs.dataset.culoare;
      const gen = produs.dataset.gen;
      const materiale = produs.dataset.materiale.split(",").join(", ");
      const tara = produs.dataset.tara;
      const livrare = produs.dataset.livrare;
      const categorie = produs.dataset.categorie;

      modalDetalii.innerHTML = `
        <img src="/resurse/imagini/produse/${img}" alt="${nume}">
        <div class="info">
        <h2>${nume.toUpperCase()}</h2>
          <p><strong>Preț:</strong> ${pret} RON</p>
          <p><strong>Greutate:</strong> ${greutate} kg</p>
          <p><strong>Culoare:</strong> ${culoare}</p>
          <p><strong>Gen:</strong> ${gen}</p>
          <p><strong>Materiale:</strong> ${materiale}</p>
          <p><strong>Țara de origine:</strong> ${tara || "-"}</p>
          <p><strong>Livrare gratuită:</strong> ${livrare}</p>
          <p><strong>Categorie:</strong> ${categorie.replaceAll("_", " ")}</p>
        </div>
      `;

      modal.classList.remove("hidden");
    });
  });

  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});
