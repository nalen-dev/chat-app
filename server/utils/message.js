const moment = require("moment");

function generateMessage(from, message) {
  return { from, message, createdAt: moment().valueOf() };
}

function generateLocationMessage(from, lat, lng) {
  return {
    from,
    url: `https://www.google.com/maps?q=${lat},${lng}`,
    createdAt: moment().valueOf(),
  };
}

module.exports = { generateMessage, generateLocationMessage };
