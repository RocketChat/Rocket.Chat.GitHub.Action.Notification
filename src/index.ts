import * as core from '@actions/core';

import {validateStatus, isValidCondition} from './utils';
import {RocketChat, IncomingWebhookDefaultArguments} from './rocketchat';

async function run() {
	try {
		const status: string = validateStatus(core.getInput('type', {required: true}).toLowerCase());
		const jobName: string = core.getInput('job_name', {required: true});
		const url: string = process.env.ROCKETCHAT_WEBHOOK || core.getInput('url');
		let mention: string = core.getInput('mention');
		let mentionCondition: string = core.getInput('mention_if').toLowerCase();
		const options: IncomingWebhookDefaultArguments = {
			username: core.getInput('username'),
			channel: core.getInput('channel'),
			icon_emoji: core.getInput('icon_emoji')
		};
		const bodyFlag: boolean = core.getInput('body') === 'true';
		const commitFlag: boolean = core.getInput('commit') === 'true';
		const token: string = core.getInput('token');

		if (mention && !isValidCondition(mentionCondition)) {
			mention = '';
			mentionCondition = '';
			console.warn(`
				Ignore Rocket.Chat message metion:
				mention_if: ${mentionCondition} is invalid
			`);
		}

		if (url === '') {
			throw new Error(`
				[Error] Missing Rocket.Chat Incoming Webhooks URL.
				Please configure "ROCKETCHAT_WEBHOOK" as environment variable or
				specify the key called "url" in "with" section.
			`);
		}

		const rocketchat = new RocketChat();
		const payload = await rocketchat.generatePayload(jobName, status, mention, mentionCondition, bodyFlag, commitFlag, token);

		await rocketchat.notify(url, options, payload);
		console.info('Sent message to Rocket.Chat');
	} catch (err) {
		core.setFailed(err.message);
	}
}

run();
