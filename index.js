const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");
const pg = require("pg");

const Client=pg.Client;

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

app.use(async function(req, res, next){
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


obGlobal = {
    obErori:null,
    obImagini: null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
}

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
    //console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
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

app.get("/favicon.ico",function(req,res){
    res.sendFile(path.join(__dirname,"resurse/imagini/favicon/favicon.ico"));
})

// app.get("/cerere",function(req,res){
//     res.send("<p style= 'color: green;'>Hello world</p>")
// })

app.get(["/", "/home", "/index"], function(req, res){
    res.render("pagini/index", {
        ip: req.ip,
        imagini: obGlobal.obImagini.imagini
    });
});

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

// app.get("/cerere", function(req, res){
//     res.send("<p style = 'color:green;'> Bună ziua! </p>");
// });

// app.get("/abc", function(req, res, next){
//     res.write("Data curenta: ");
//     next();
// });

// app.get("/abc", function(req, res, next){
//     res.write((new Date() + ""));
//     res.end();
// });

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
    else{
        afisareEroare(res);
    }
}
})

app.listen(8080);
console.log("Serverul a pornit");