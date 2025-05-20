window.onload = function () {
    function aplicaFiltrare() {
        if (!validareTara()) return;

        let inpNume = normalize(document.getElementById("inp-nume").value.trim().toLowerCase());
        let inpGreutate = document.getElementById("inp-greutate").value;
        let inpCuloare = document.getElementById("inp-culoare").value.trim().toLowerCase();
        let livrare = document.querySelector("input[name='gr_rad']:checked").value;
        let genuri = Array.from(document.querySelectorAll("input[name='gen']:checked")).map(cb => cb.value.toLowerCase());
        let inpTara = document.getElementById("inp-tara-origine").value.trim().toLowerCase();
        let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase();
        let materialeSelectate = Array.from(document.getElementById("inp-materiale").selectedOptions).map(opt => normalize(opt.value));

        let produse = document.getElementsByClassName("produs");
        let produseVizibile = 0;

        for (let prod of produse) {
            prod.style.display = "none";
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            let cond1 = normalize(nume).startsWith(inpNume);

            let greutateProd = parseFloat(prod.getElementsByClassName("val-greutate")[0].innerHTML.trim());
            let cond2 = (inpGreutate == 0 || greutateProd <= inpGreutate);

            let culoare = prod.getElementsByClassName("val-culoare")[0].innerHTML.trim().toLowerCase();
            let cond3 = (!inpCuloare || culoare === inpCuloare);

            let livrareProd = prod.getElementsByClassName("val-livrare")[0].innerHTML.trim().toLowerCase();
            let cond4 = (livrare === "toate" || livrareProd === livrare);

            let genProd = prod.getElementsByClassName("val-gen")[0].innerHTML.trim().toLowerCase();
            let cond5 = (genuri.length === 0 || genuri.includes(genProd));

            let tara = prod.getElementsByClassName("val-tara")[0].innerHTML.trim().toLowerCase();
            let cond6 = (!inpTara || tara.includes(inpTara));

            let categorie = prod.classList[1].toLowerCase();
            let cond7 = (inpCategorie === "toate" || categorie === inpCategorie);

            let materialeProd = prod.dataset.materiale.split(',').map(m => normalize(m));
            let cond8 = (materialeSelectate.length === 0 || materialeSelectate.some(mat => materialeProd.includes(mat)));

            if (
                (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8) ||
                prod.classList.contains("produs-pastrat")
            ) {
                if (!sessionStorage.getItem(`ascuns-${prod.id}`)) {
                    prod.style.display = "block";
                    produseVizibile++;
                }
            }            
        }

        let mesaj = document.getElementById("mesaj-produse");
        if (produseVizibile === 0) {
            if (!mesaj) {
                mesaj = document.createElement("div");
                mesaj.id = "mesaj-produse";
                mesaj.textContent = "Încă nu există produse care să corespundă filtrelor aplicate.";
                mesaj.style.color = "red";
                mesaj.style.textAlign = "center";
                mesaj.style.marginTop = "20px";
                document.querySelector(".grid-produse").appendChild(mesaj);
            }
        } else {
            if (mesaj) mesaj.remove();
        }
    }

    document.getElementById("inp-greutate").oninput = function () {
        document.getElementById("infoGreutate").textContent = `(${this.value})`;
        aplicaFiltrare();
    }

    document.getElementById("btn-filtrare").onclick = aplicaFiltrare;
    document.getElementById("inp-nume").oninput = aplicaFiltrare;
    document.getElementById("inp-culoare").oninput = aplicaFiltrare;
    document.getElementById("inp-tara-origine").oninput = aplicaFiltrare;
    document.getElementById("inp-categorie").onchange = aplicaFiltrare;
    document.getElementById("inp-materiale").onchange = aplicaFiltrare;

    document.querySelectorAll("input[name='gr_rad']").forEach(r => r.onchange = aplicaFiltrare);
    document.querySelectorAll("input[name='gen']").forEach(cb => cb.onchange = aplicaFiltrare);

    document.getElementById("sort-asc").onclick = function () {
        sorteazaProduse(1);
    }

    document.getElementById("sort-desc").onclick = function () {
        sorteazaProduse(-1);
    }

    document.getElementById("calculeaza").onclick = function () {
        calculeazaMedia();
    }

    document.getElementById("btn-resetare").onclick = () => {
        if (!confirm("Sigur vrei să resetezi toate filtrele?")) return;

        document.getElementById("inp-nume").value = "";
        document.getElementById("inp-greutate").value = 0;
        document.getElementById("infoGreutate").textContent = "(0)";
        document.getElementById("inp-culoare").value = "";
        document.querySelector("input[name='gr_rad'][value='toate']").checked = true;
        document.querySelectorAll("input[name='gen']").forEach(cb => cb.checked = false);
        document.getElementById("inp-tara-origine").value = "";
        document.getElementById("inp-categorie").value = "toate";
        document.getElementById("inp-materiale").selectedIndex = -1;

        let produse = document.getElementsByClassName("produs");
        Array.from(produse).forEach(p => {
            p.style.display = "block";
        });

        let mesaj = document.getElementById("mesaj-produse");
        if (mesaj) mesaj.remove();
    };
}

document.querySelectorAll(".produs").forEach(prod => {
    const idProd = prod.id;

    if (sessionStorage.getItem(`ascuns-${idProd}`)) {
        prod.style.display = "none";
    }

    const btnPastreaza = prod.querySelector(".btn-pastreaza");
    const btnAscTemp = prod.querySelector(".btn-ascunde-temporar");
    const btnAscSesiune = prod.querySelector(".btn-ascunde-sesiune");

    btnPastreaza.onclick = () => {
        const icon = btnPastreaza.querySelector("i");
        prod.classList.toggle("produs-pastrat");
        btnPastreaza.classList.toggle("btn-activ");
        icon.classList.toggle("bi-pin");
        icon.classList.toggle("bi-pin-angle-fill");
    };

    btnAscTemp.onclick = () => {
        prod.style.display = "none";
    };

    btnAscSesiune.onclick = () => {
        sessionStorage.setItem(`ascuns-${idProd}`, "1");
        prod.style.display = "none";
    };
});


btnPastreaza.onclick = () => { //bonus 6 etapa 6
    const icon = btnPastreaza.querySelector("i");
    prod.classList.toggle("produs-pastrat");
    btnPastreaza.classList.toggle("btn-success");
    btnPastreaza.classList.toggle("btn-activ");
    icon.classList.toggle("bi-pin");
    icon.classList.toggle("bi-pin-angle-fill");
};



function normalize(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function sorteazaProduse(ordine) {
    let grid = document.querySelector(".grid-produse");
    let produseVizibile = [...document.getElementsByClassName("produs")]
        .filter(p => p.style.display !== "none");

    produseVizibile.sort((a, b) => {
        let pretA = parseFloat(a.querySelector(".val-pret").textContent.trim());
        let pretB = parseFloat(b.querySelector(".val-pret").textContent.trim());

        if (pretA === pretB) {
            let culoareA = a.querySelector(".val-culoare").textContent.trim().toLowerCase();
            let culoareB = b.querySelector(".val-culoare").textContent.trim().toLowerCase();
            return ordine * culoareA.localeCompare(culoareB);
        }

        return ordine * (pretA - pretB);
    });

    produseVizibile.forEach(p => grid.appendChild(p));
}

function calculeazaMedia() {
    let existingDiv = document.getElementById("media-preturilor");
    if (existingDiv) existingDiv.remove();

    let preturi = [...document.getElementsByClassName("produs")]
        .filter(p => p.style.display !== "none")
        .map(p => parseFloat(p.querySelector(".val-pret").textContent.trim()));

    let media = preturi.reduce((a, b) => a + b, 0) / preturi.length;

    let div = document.createElement("div");
    div.id = "media-preturilor";
    div.textContent = `Media prețurilor: ${media.toFixed(2)} RON`;
    div.style.color = "red";
    div.style.fontSize = "0.8rem";
    div.style.marginTop = "1rem";
    div.style.textAlign = "center";

    document.getElementById("calculeaza").appendChild(div);

    setTimeout(() => div.remove(), 3000);
}

function validareTara() {
    let inpTara = document.getElementById("inp-tara-origine").value.trim();
    if (inpTara && !/^[a-zA-Z\s]{2,}$/.test(inpTara)) {
        document.getElementById("inp-tara-origine").classList.add("is-invalid");
        return false;
    } else {
        document.getElementById("inp-tara-origine").classList.remove("is-invalid");
        return true;
    }
}

