let faktor0, faktor1, produkten;

const tabeller = {};

for (let faktorA = 1; faktorA <= 10; faktorA++) {
    for (let faktorB = 1; faktorB <= 10; faktorB++) {
        let produkt = faktorA * faktorB;
        if (!tabeller[produkt]) {
            tabeller[produkt] = [ { faktorA, faktorB } ];
        } else {
            tabeller[produkt].push({ faktorA, faktorB });
        }
    }
}

function fixaKnappfarg() {
    let farg = "aktiv";
    if (typeof faktor0 !== "undefined" && typeof faktor1 !== "undefined" && (faktor0 * faktor1 !== produkten)) {
        farg = "aktivfailar";
        erikCostume(2);
    } else {
        if (faktor0 * faktor1 === produkten) {
            erikCostume(3);
        } else {
            erikCostume(1);
        }
    }
    for (let faktor = 0; faktor < 2; faktor++) {
        const value = faktor === 0 ? faktor0 : faktor1;
        const knappar = document.getElementsByClassName("faktorer" + faktor);
        for (let v = 0; v < 10; v++) {
        knappar[v].classList.remove("aktiv");
        knappar[v].classList.remove("aktivfailar");
        if (v + 1 === value) {
                knappar[v].classList.add(farg);
            } else {
                if (faktor0 * faktor1 !== produkten) {
                    knappar[v].classList.remove("osynlig");
                } else {
                    knappar[v].classList.add("osynlig");
                }
            }
        }
    }
}

function erikCostume(costume) {
    if (costume === 1) {
        document.getElementById("erik1").style.display = "block";
    } else {
        document.getElementById("erik1").style.display = "none";
    }
    if (costume === 2) {
        document.getElementById("erik2").style.display = "block";
    } else {
        document.getElementById("erik2").style.display = "none";
    }
    if (costume === 3) {
        document.getElementById("erik3").style.display = "block";
    } else {
        document.getElementById("erik3").style.display = "none";
    }
}

function nyttNr() {
    const produkter = Object.keys(tabeller);
    const slump = Math.floor(Math.random() * produkter.length);    
    produkten = parseInt(produkter[slump]);
    faktor0 = undefined;
    faktor1 = undefined;
    document.getElementById("robotdisplay").innerHTML = produkten;
    fixaKnappfarg();
}

function saveFaktor(faktor, value) {
    if (faktor === 0) faktor0 = value;
    if (faktor === 1) faktor1 = value;
    fixaKnappfarg();
    calculatePoints();

    console.log({ faktor0, faktor1, produkten })
    if (faktor0 * faktor1 === produkten) {
        setTimeout(nyttNr, 2000);
    }

    delete tabeller[produkten];
}

function calculatePoints() {
    const points = (42 - Object.keys(tabeller).length) * 1000;
    document.getElementById("points").innerHTML = points + ' poäng';
}

calculatePoints();
nyttNr()
