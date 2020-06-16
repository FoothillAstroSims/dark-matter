


let _enumCounter = 11;

function enumerate() {
    return _enumCounter++;
}

/**
 * Enumerated Keys for each of the Galaxy. Use these as a key to acesss info
 * from GALAXY_DATA.
 */
export const GALAXIES = {
    NONE:                   enumerate(),
    MILKY_WAY:              enumerate(),
    ANDROMEDA:              enumerate(),
    TRIANGULUM:             enumerate(),
    SILVER_SLIVER:          enumerate(),
    GREAT_BARRED_SPIRAL:    enumerate(),
    BODES:                  enumerate(),
    CIGAR:                  enumerate(),
    SOUTHERN_PINWHEEL:      enumerate(),
};

export const DEFAULT_GALAXY_KEY = GALAXIES.MILKY_WAY;

export const GALAXY_DATA = {
    [GALAXIES.NONE]: {
        NAME: "Choose a Galaxy!",
        IMG: null,
    },
    [GALAXIES.MILKY_WAY]: {
        NAME: "Milky Way",
        IMG: null,
    },
    [GALAXIES.ANDROMEDA]: {
        NAME: "Andromeda (NGC 224)",
    },
    [GALAXIES.TRIANGULUM]: {
        NAME: "Triangulum (NGC 598)",
    },
    [GALAXIES.SILVER_SLIVER]: {
        NAME: "Silver Sliver (NGC 891)",
    },
    [GALAXIES.GREAT_BARRED_SPIRAL]: {
        NAME: "Great Barred Spiral (NGC 1365)",
    },
    [GALAXIES.BODES]: {
        NAME: "Bode's (NGC 3031)",
    },
    [GALAXIES.CIGAR]: {
        NAME: "Cigar (NGC 3034)",
    },
    [GALAXIES.SOUTHERN_PINWHEEL]: {
        NAME: "Southern Pinwheel (NGC 5236)",
    },
};

