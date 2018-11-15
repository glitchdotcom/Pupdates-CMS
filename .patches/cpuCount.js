"use strict";

// this patches Parcel cpuCount so that it only uses one process.
module.exports = function () {
  return 1;
};
