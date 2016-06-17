'use strict';

angular.module('app')
	.service('Explorer', function () {

		// Globals and dependencies
		var fs = require('fs'),
			cp = require('child_process'),
			rscript = "",
			Explorer = {
				"terminalOutput": "",
				"exitCode": ""
			},
			observerCallback,
			finished = false,
			startDate,
			stopDate;

		// Init
		this.setRscript = function (p) {
			rscript = p;
		}

		// Register observer
		this.registerObserverCallback = function (callback) {
			observerCallback = callback;
		};

		// Notify observer
		var notifyObserver = function (finished) {
			observerCallback(finished);
		};
		// Launch
		this.launchFullOrAblation = function (parameters) {
			Explorer.terminalOutput = "";
			var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
			startDate = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
			var cmd = cp.exec('Rscript "' + rscript + '" '
				+ '--parameter-file "' + parameters.parameterFile + '" '
				+ '--sel-param-file "' + parameters.selectionFile + '" '
				+ '--candidates-file "' + parameters.candidatesFile + '" '
				+ '--instance-file "' + parameters.instanceFile + '" '
				+ '--hook-run "' + parameters.hookRun + '" '
				+ '--parallel 1 --type "' + parameters.type + '" '
				+ '--log-file "' + parameters.logFile + '"');
			cmd.stdout.on('data', function (data) {
				Explorer.terminalOutput += data;
				notifyObserver(finished);
			});

			cmd.stderr.on('data', function (data) {
				Explorer.terminalOutput += data;
				notifyObserver(finished);
			});

			cmd.on('exit', function (code) {
				Explorer.exitCode = code;
				finished = true;
				stopDate = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
				notifyObserver(finished);
			});
		};
		this.launchIrace = function (scenarioFile) {
			Explorer.terminalOutput = "";
			var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
			startDate = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
			var iscript = "/Library/Frameworks/R.framework/Versions/3.2/Resources/library/irace/bin/irace";
			var cmd = cp.exec(iscript + ' --scenario "' + scenarioFile + '"');
			cmd.stdout.on('data', function (data) {
				Explorer.terminalOutput += data;
				notifyObserver(finished);
			});

			cmd.stderr.on('data', function (data) {
				Explorer.terminalOutput += data;
				notifyObserver(finished);
			});

			cmd.on('exit', function (code) {
				Explorer.exitCode = code;
				finished = true;
				stopDate = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
				notifyObserver(finished);
			});
		};

		this.output = function () {
			return Explorer.terminalOutput;
		}

		this.exitCode = function () {
			return Explorer.exitCode;
		}

		this.getDates = function () {
			return [startDate, stopDate];
		}

	});
