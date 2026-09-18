const { v4: uuidv4 } = require("uuid");

const generateSlug = () => {
    // short unique slug (e.g. a1b2c3d4)
    return uuidv4().split("-")[0];
};

module.exports = generateSlug;