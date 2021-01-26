var { StringBuilder } = require("./stringbuilder.js");

const Mods = [
    ["None", 0, ""],
    ["NoFail", 1, "NF"],
    ["Easy", 2, "EZ"],
    ["NoVideo", 4, "NV"],
    ["Hidden", 8, "HD"],
    ["HardRock", 16, "HR"],
    ["SuddenDeath", 32, "SD"],
    ["DoubleTime", 64, "DT"],
    ["Relax", 128, "RX"],
    ["HalfTime", 256, "HT"],
    ["Flashlight", 1024, "FL"],
    ["Autoplay", 2048, "AU"],
    ["SpunOut", 4096, "SO"],
    ["Relax2", 8192, "RX2"],
    ["LastMod", 16384, "LM"]
]

function getFullModsString(modsValue) {
    var finalString = new StringBuilder();

    if (modsValue == Mods[0][1]) {
        return "None";
    }

    for (var modIndex in Mods) {
        var mod = Mods[modIndex];

        if ((Number(modsValue) & Number(mod[1])) > 0) {
            finalString.append(mod[0] + ",");
        }
    }

    var finalReturn = finalString.toString();

    return finalReturn.substr(0, finalReturn.length - 1)
}

function getShortModsString(modsValue) {
    var finalString = new StringBuilder();

    if (modsValue == Mods[0][1]) {
        return "None";
    }

    for (var mod in Mods) {
        if (mod[1] & modsValue > 0) {
            finalString.append(mod[2]);
        }
    }

    return finalString.toString();
}

exports.Mods = Mods;
exports.getFullModsString = getFullModsString;
exports.getShortModsString = getShortModsString;