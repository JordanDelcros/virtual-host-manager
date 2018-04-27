#!/usr/bin/env node

"use strict";

const { exec } = require("child_process");
const fs = require("fs");

console.info("VIRTUAL HOST MANAGER - TEST MODE");

exec("vhm install --verbose && vhm install --verbose && vhm uninstall && vhm uninstall", function( error, stdout, stderr ){

	if( error ){

		console.error(error);

	}
	else {

		console.log(stdout);

	}

});