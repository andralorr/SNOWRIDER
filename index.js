const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");
const pg = require("pg");

const Client=pg.Client;

const timpOferta = 2;
const intervalOferta = timpOferta * 60 * 1000;
const valoriReduceri = [5,10,15,20,25,30,35,40,45,50];
const T2 = 10;

client=new Client({
    database:"snowrider",
    user:"andra",
    password:"andra",
    host:"localhost",
    port:5432
})

client.connect()
client.query("select * from produse", function(err, rezultat ){
    console.log(err)    
    console.log(rezultat)
})
client.query("select * from unnest(enum_range(null::categorie_generala))", function(err, rezultat ){
    console.log(err)    
    console.log(rezultat)
})


app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

obGlobal = {
    obErori:null,
    obImagini: null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
}

app.use(function(req, res, next){
    queryOptiuni = "SELECT unnest(enum_range(NULL::categorie_generala)) AS categ";
    client.query(queryOptiuni, function(err, rezOptiuni){
        if (err) {
            console.log(err);
            res.locals.optiuniMeniu = [];
        } else {
            res.locals.optiuniMeniu = rezOptiuni.rows;
        }
        next();
    });
});

vect_foldere=["temp","backup","temp1"]
for(let folder of vect_foldere){
    let caleFolder=path.join(__dirname,folder)
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder)
    }
}

function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){

        let numeFisExt=path.basename(caleScss);
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
}

vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}

//oferta
function genereazaOferta() {
    let caleOferte = path.join(__dirname, "/resurse/json/oferte.json");

    client.query("SELECT unnest(enum_range(NULL::categorie_generala)) AS categorie", function(err, rezCategorie) {
        if (err) {
            console.error("Eroare interogare categorii:", err);
            return;
        }

        let categorii = rezCategorie.rows.map(row => row.categorie);
        if (categorii.length == 0) {
            return;
        }

        let oferte = [];
        if (fs.existsSync(caleOferte)) {
            let continut = fs.readFileSync(caleOferte).toString("utf-8");
            try {
                let json = JSON.parse(continut);
                let acum = new Date();
                let pragStergere = T2 * 60 * 1000;

                oferte = (json.oferte || []).filter(oferta => {
                    let dataFinalizare = new Date(oferta["data-finalizare"]);
                    return dataFinalizare > acum || (acum - dataFinalizare) <= pragStergere;
                });
            } catch (e) {
                console.error("Eroare la parsare oferte.json:", e);
            }
        }

        let ultimaCategorie = oferte.length > 0 ? oferte[0]["categorie"] : null;

        let categoriiDisponibile = categorii.filter(cat => cat !== ultimaCategorie);
        if (categoriiDisponibile.length == 0) {
            console.error("Nu exista alte categorii disponibile");
            return;
        }

        let categorieAleasa = categoriiDisponibile[Math.floor(Math.random() * categoriiDisponibile.length)];
        let reducere = valoriReduceri[Math.floor(Math.random() * valoriReduceri.length)];

        let dataIncepere = new Date();
        let dataFinalizare = new Date(dataIncepere.getTime() + intervalOferta);

        let ofertaNoua = {
            "categorie": categorieAleasa,
            "data-incepere": dataIncepere.toISOString(),
            "data-finalizare": dataFinalizare.toISOString(),
            "reducere": reducere
        };

        let vectorOferte = [ofertaNoua, ...oferte];
        fs.writeFileSync(caleOferte, JSON.stringify({oferte: vectorOferte}, null, 2));
        console.log("Oferta generata:", ofertaNoua);
    })
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    
    obGlobal.obErori=JSON.parse(continut)
    
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori)
}

initErori()

function initImagini() {
    const indexLuna = new Date().getMonth();
    const luniNume = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", 
                      "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
    const lunaCurenta = luniNume[indexLuna];

    const continut = fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")).toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);

    let toateImaginile = obGlobal.obImagini.imagini;

    let vImagini = toateImaginile.filter(img =>
        Array.isArray(img.luni) && img.luni.includes(lunaCurenta)
    );

    let nrMaxImagini = Math.min(12, vImagini.length);
    obGlobal.obImagini.imagini = vImagini.slice(0, nrMaxImagini);
    
    const caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    const caleAbsMediu = path.join(caleAbs, "mediu");
    const caleAbsMic = path.join(caleAbs, "mic");

    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu, { recursive: true });

    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic, { recursive: true });

    for (let imag of obGlobal.obImagini.imagini) {
        const [numeFis, ext] = imag.cale_fisier.split(".");
        const caleFisAbs = path.join(caleAbs, imag.cale_fisier);
        const caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        const caleFisMicAbs = path.join(caleAbsMic, numeFis + ".webp");

        sharp(caleFisAbs).resize(800).toFile(caleFisMediuAbs);
        sharp(caleFisAbs).resize(500).toFile(caleFisMicAbs);

        imag.fisier_mediu = path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp");
        imag.fisier = path.join("/", obGlobal.obImagini.cale_galerie, imag.cale_fisier);
        imag.fisier_mic = path.join("/", obGlobal.obImagini.cale_galerie, "mic", numeFis + ".webp");
    }
    console.log("Luna curenta:", lunaCurenta);
    console.log("Imagini afisate:", obGlobal.obImagini.imagini.map(i => i.titlu));
}
initImagini();

function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator==identificator
                    });
    if(eroare){
        if(eroare.status)
            res.status(identificator) 
        var titluCustom=titlu || eroare.titlu;
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;
    }
    else{
        var err=obGlobal.obErori.eroare_default
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;
    }
    res.render("pagini/eroare", { 
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
    })

}

console.log("Folderul proiectului", __dirname);
console.log("Cale catre fisier index.js", __filename);
console.log("Folderul de lucru",process.cwd());
// app.use("/node_modules",express.static(path.join(__dirname,"node_modules")));
app.use("/resurse",express.static(path.join(__dirname,'resurse')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'js')));

app.get(["/", "/home", "/index"], function(req, res){
    let caleOferte = path.join(__dirname, "resurse/json/oferte.json");
    let ofertaCurenta = null;

    try {
        let continutOferte = fs.readFileSync(caleOferte, "utf-8");
        let jsonOferte = JSON.parse(continutOferte);
        if (jsonOferte.oferte && jsonOferte.oferte.length > 0) {
            ofertaCurenta = jsonOferte.oferte[0];
        }
    } catch (err) {
        console.error("Eroare citire oferte:", err);
    }

    res.render("pagini/index", {
        ip: req.ip,
        imagini: obGlobal.obImagini.imagini,
        oferta: ofertaCurenta

    });
});

app.get("/favicon.ico",function(req,res){
    res.sendFile(path.join(__dirname,"resurse/imagini/favicon/favicon.ico"));
})

app.get("/desprenoi", function(req, res){
    res.render("pagini/desprenoi");
});

app.get("/magazin", function(req, res){
    res.render("pagini/magazin");
});

app.get("/contact", function(req, res){
    res.render("pagini/contact");
});

app.get("/galerie-foto", function(req, res){
    res.render("pagini/galerie-foto", {
        imagini: obGlobal.obImagini.imagini,
        galerieAnimata: obGlobal.galerieAnimata
    });
});

app.get("/fisier", function(req, res){
    res.sendfile(path.join(__dirname, "package.json"));
});

app.get("/produse", function(req, res) {
    let conditieQuery = "";
    let paramQuery = [];

    if (req.query.categorie) {
        conditieQuery = " WHERE categorie = $1";
        paramQuery.push(req.query.categorie);
    }

    queryOptiuni = "SELECT unnest(enum_range(NULL::categorie_generala)) AS categ";

    client.query(queryOptiuni, function(err, rezOptiuni) {
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
            return;
        }

        let queryProduse = `SELECT * FROM produse ${conditieQuery}`;

        client.query(queryProduse, paramQuery, function(err, rez) {
            if (err) {
                console.log("Eroare la query produse:", err);
                afisareEroare(res, 2);
            } else {
                res.render("pagini/produse", {
                    produse: rez.rows,
                    optiuni: rezOptiuni.rows
                });
            }
        });
    });
});

app.get("/produs/:id", (req, res) => {
    const idProdus = req.params.id;

    const queryProdus = `SELECT * FROM produse WHERE id = $1`;
    const querySeturi = `
        SELECT s.*, 
               array_agg(json_build_object(
                   'id', p.id, 
                   'nume', p.nume, 
                   'imagine', p.imagine, 
                   'pret', p.pret
               )) AS produse,
               ROUND(SUM(p.pret) * (1 - LEAST(COUNT(p.id), 5) * 0.05), 2) AS pret_final
        FROM seturi s
        JOIN asociere_set a ON s.id = a.id_set
        JOIN produse p ON a.id_produs = p.id
        WHERE s.id IN (SELECT id_set FROM asociere_set WHERE id_produs = $1)
        GROUP BY s.id;
    `;

    client.query(queryProdus, [idProdus], (err, rezProdus) => {
        if (err || rezProdus.rows.length === 0) {
            afisareEroare(res, 404, "Produs inexistent", "Produsul căutat nu există.");
            return;
        }

        const produs = rezProdus.rows[0];

        client.query(querySeturi, [idProdus], (err, rezSeturi) => {
            if (err) {
                console.log("Eroare interogare seturi:", err);
                afisareEroare(res, 2, "Eroare server", "Nu s-a putut accesa produsul.");
                return;
            }

            res.render("pagini/produs", {
                produs: produs,
                seturi: rezSeturi.rows
            });
        });
    });
});


app.get("/seturi", (req, res) => {
    const query = `
        SELECT s.*, 
               array_agg(json_build_object('id', p.id, 'nume', p.nume, 'imagine', p.imagine, 'pret', p.pret)) AS produse,
               ROUND(SUM(p.pret) * (1 - LEAST(COUNT(p.id), 5) * 0.05), 2) AS pret_final
        FROM seturi s
        JOIN asociere_set a ON s.id = a.id_set
        JOIN produse p ON a.id_produs = p.id
        GROUP BY s.id
        ORDER BY s.id;
    `;

    client.query(query, (err, rez) => {
        if (err) {
            console.log("Eroare interogare seturi:", err);
            afisareEroare(res, 2);
        } else {
            res.render("pagini/seturi", { seturi: rez.rows });
        }
    });
});

app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function(req, res, next){
    afisareEroare(res, 403);
});

app.get("/*.ejs",function(req,res,next){
    afisareEroare(res,400);
})

app.get("/*",function(req,res,next){
    try{
        res.render("pagini"+req.url,function(err,rezultatRandare){
            if(err){
                if(err.message.startsWith("Failed to lookup view")){
                    afisareEroare(res,404);
                }
            }
            else{
                afisareEroare(res);
            }
        });
    }
    catch(errRandare){
        if(errRandare.message.startsWith("Cannot find module")){
            afisareEroare(res,404);
        }
        else {
            afisareEroare(res);
        }
    }
})

setInterval(genereazaOferta, intervalOferta);
genereazaOferta();

app.listen(8080);
console.log("Serverul a pornit");