import * as github from '@actions/github';
import * as core from '@actions/core';
import {Context} from '@actions/github/lib/context';
import axios from 'axios';
import {OctokitOptions} from '@octokit/core/dist-types/types';

export interface IncomingWebhookDefaultArguments {
	username: string;
	channel: string;
	icon_emoji: string;
}

interface Accessory {
	color: string;
	result: string;
}

class Helper {
	readonly context: Context = github.context;

	public get success(): Accessory {
		return {
			color: '#2cbe4e',
			result: 'Succeeded'
		};
	}

	public get failure(): Accessory {
		return {
			color: '#cb2431',
			result: 'Failed'
		};
	}

	public get cancelled(): Accessory {
		return {
			color: '#ffc107',
			result: 'Cancelled'
		};
	}

	public get isPullRequest(): boolean {
		const {eventName} = this.context;
		return eventName === 'pull_request';
	}

	public get baseFields(): any[] {
		const {sha, eventName, workflow, ref} = this.context;
		const {owner, repo} = this.context.repo;
		const {number} = this.context.issue;

		const githubUrl: string = process.env.GITHUB_URL || core.getInput('github_url') || 'https://github.com';
		const repoUrl: string = `${githubUrl}/${owner}/${repo}`;
		let actionUrl: string = repoUrl;
		let eventUrl: string = eventName;

		if (this.isPullRequest) {
			eventUrl = `[${eventName}](${repoUrl}/pull/${number})`;
			actionUrl += `/pull/${number}/checks`;
		} else {
			actionUrl += `/commit/${sha}/checks`;
		}

		return [
			{
				short: true,
				title: 'ref',
				value: ref
			},
			{
				short: true,
				title: 'event name',
				value: eventUrl
			},
			{
				short: true,
				title: 'workflow',
				value: `[${workflow}](${actionUrl})`
			},
			{
				short: false,
				title: 'repository',
				value: `[${owner}/${repo}](${repoUrl})`
			}
		];
	}

	public async getCommitFields(token: string, githubUrl: string): Promise<any[]> {
		const {owner, repo} = this.context.repo;
		const head_ref: string = process.env.GITHUB_HEAD_REF as string;
		const ref: string = this.isPullRequest ? head_ref.replace(/refs\/heads\//, '') : this.context.sha;

		let options: OctokitOptions = {
			log: {
				debug: console.debug,
				info: console.info,
				warn: console.warn,
				error: console.error
			}
		};

		if (githubUrl) {
			options.baseUrl = `${githubUrl}/api/v3`;
		}

		const client = github.getOctokit(token, options);
		const {data: commit} = await client.rest.repos.getCommit({owner, repo, ref});

		const authorName: string = commit.commit.author?.name || commit.author?.login || 'Unknown';
		const authorUrl: string = commit.author?.html_url || '';
		const commitMsg: string = commit.commit.message;
		const commitUrl: string = commit.html_url;
		const fields = [
			{
				short: true,
				title: 'commit',
				value: `[${commitMsg}](${commitUrl})`
			},
			{
				short: true,
				title: 'author',
				value: `[${authorName}]${authorUrl ? `(${authorUrl})` : ''}`
			}
		];
		return fields;
	}
}

export class RocketChat {
	private isMention(condition: string, status: string): boolean {
		return condition === 'always' || condition === status;
	}

	public async generatePayload(jobName: string, status: string, mention: string, mentionCondition: string, commitFlag: boolean, githubUrl: string, token?: string): Promise<any> {
		const helper = new Helper();
		const notificationType: Accessory = helper[status];
		const tmpText: string = `${jobName} ${notificationType.result}`;
		const text = mention && this.isMention(mentionCondition, status) ? `@${mention} ${tmpText}` : tmpText;

		const fields = helper.baseFields;

		if (commitFlag && token) {
			const commitFields = await helper.getCommitFields(token, githubUrl);
			Array.prototype.push.apply(fields, commitFields);
		}

		const attachments = {
			color: notificationType.color,
			fields
		};

		const payload = {
			text,
			attachments: [attachments]
		};

		return payload;
	}

	public async notify(url: string, options: IncomingWebhookDefaultArguments, payload: any): Promise<void> {
		const data = {
			...options,
			...payload
		};

		console.info(`
			Generated payload for Rocket.Chat:
			${JSON.stringify(data, null, 2)}
		`);

		const response = await axios.post(url, data);

		console.info(`
			Response:
			${response.data}
		`);

		if (response.status !== 200) {
			throw new Error(`
				Failed to send notification to Rocket.Chat
				Response: ${response.data}
			`);
		}
	}
}
