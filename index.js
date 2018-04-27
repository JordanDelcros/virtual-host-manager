#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const commander = require("commander");
const infos = require("./package.json");

const HTTPDSettings = execSync("httpd -V").toString();

const HTTPDDirectory = path.dirname(HTTPDSettings.match(/SERVER_CONFIG_FILE=\"([^\"]+)\"/)[1]);

const HTTPDVhostsPath = `${HTTPDDirectory}/extra/httpd-vhosts.conf`;

const hostsPath = (process.platform != "win32" ? "/etc/hosts" : "C:\\Windows\\System32\\drivers\\etc\\hosts");

const vhost = fs.readFileSync(path.join(path.dirname(__filename), ".vhost"), "utf8");

const serverName = vhost.match(/ServerName ([^\n\r]+)/)[1];

const vhostServerNameRegExpExists = new RegExp(`ServerName ${serverName}`, "g");

const hostServerNameRegExpExists = new RegExp(`[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\s+${serverName}`, "g");

commander
	.version(infos.version)
	.description(infos.description);

commander
	.command("install")
	.alias("i")
	.option("-v, --verbose", "Enable install output")
	.description("Install the vhost located in the .vhost file of the current directory")
	.action(function( cmd ){

		if( cmd.verbose == true ){

			console.log("vhm install start");

		}

		var HTTPDVhostContent = fs.readFileSync(HTTPDVhostsPath, "utf8");

		var hostsContent = fs.readFileSync(hostsPath, "utf8");

		try {

			if( vhostServerNameRegExpExists.test(HTTPDVhostContent) == false ){

				fs.appendFileSync(HTTPDVhostsPath, `\n\r\n\r${vhost}`);

				if( cmd.verbose == true ){

					console.log(`vhost added to ${HTTPDVhostsPath}`);

				}

			}
			else if( cmd.verbose == true ){

				console.log("vhost already exists in ${HTTPDVhostsPath}");

			}

			if( hostServerNameRegExpExists.test(hostsContent) == false ){

				fs.appendFileSync(hostsPath, `\n\r127.0.0.1\t${serverName}`);

				if( cmd.verbose == true ){

					console.log(`host added to ${hostsPath}`);

				}

			}
			else if( cmd.verbose == true ){

				console.log(`host already exists in ${hostsPath}`);

			}

			execSync("apachectl restart");

			console.log("vhm install complete");

		}
		catch( error ){

			throw new Error("vhm install error, cannot install vhost (${error.message})");

		}

	});

commander
	.command("uninstall")
	.alias("un")
	.option("-v, --verbose", "Enable uninstall output")
	.description("Uninstall the vhost located in the .vhost file of the current directory")
	.action(function( cmd ){

		if( cmd.verbose == true ){

			console.log("vhm uninstall start");

		}

		var HTTPDVhostContent = fs.readFileSync(HTTPDVhostsPath, "utf8");

		var hostsContent = fs.readFileSync(hostsPath, "utf8");

		try {

			if( vhostServerNameRegExpExists.test(HTTPDVhostContent) == true ){

				let vhostRegExp = new RegExp("\\s*" + vhost.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), "g");

				fs.writeFileSync(HTTPDVhostsPath, HTTPDVhostContent.replace(vhostRegExp, ""), "utf8");

				if( cmd.verbose == true ){

					console.log(`vhost removed from ${HTTPDVhostsPath}`);

				}

			}
			else if( cmd.verbose == true ){
				
				console.log("Cannot find vhost in ${HTTPDVhostsPath}");

			}

			if( hostServerNameRegExpExists.test(hostsContent) == false ){

				fs.writeFileSync(hostsPath, hostsContent.replace(hostServerNameRegExpExists, ""), "utf8");

				if( cmd.verbose == true ){

					console.log(`host removed from ${hostsPath}`);

				}

			}
			else if( cmd.verbose == true ){

				console.log(`host already exists in ${hostsPath}`);

			}

			execSync("apachectl restart");

			console.log("vhm uninstall complete");

		}
		catch( error ){

			throw new Error(`vhm uninstall error, cannot uninstall vhost (${error.message})`);

		}

	});

commander.parse(process.argv);