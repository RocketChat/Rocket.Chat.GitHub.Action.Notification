import * as github from '@actions/github';
import {Octokit} from '@octokit/rest';
import {Context} from '@actions/github/lib/context';
import axios from 'axios';

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
		const repoUrl: string = `https://github.com/${owner}/${repo}`;
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

	public async getCommitFields(token: string): Promise<any[]> {
		const {owner, repo} = this.context.repo;
		const head_ref: string = process.env.GITHUB_HEAD_REF as string;
		const ref: string = this.isPullRequest ? head_ref.replace(/refs\/heads\//, '') : this.context.sha;
		const client = new Octokit({auth: token});
		const {data: commit} = await client.repos.getCommit({owner, repo, ref});
		const authorName: string = commit.author.login;
		const authorUrl: string = commit.author.html_url;
		const commitMsg: string = commit.commit.message;
		const commitUrl: string = commit.html_url;
		return [
			{
				short: true,
				title: 'commit',
				value: `[${commitMsg}](${commitUrl})`
			},
			{
				short: true,
				title: 'author',
				value: `[${authorName}](${authorUrl})`
			}
		];
	}
}

export class RocketChat {
	private isMention(condition: string, status: string): boolean {
		return condition === 'always' || condition === status;
	}

	public async generatePayload(jobName: string, status: string, mention: string, mentionCondition: string, bodyFlag: boolean, commitFlag: boolean, token?: string): Promise<any> {
		const helper = new Helper();
		const notificationType: Accessory = helper[status];
		const tmpText: string = `${jobName} ${notificationType.result}`;
		const text = mention && this.isMention(mentionCondition, status) ? `@${mention} ${tmpText}` : tmpText;

		const fields = bodyFlag ? helper.baseFields : [];

		if (commitFlag && token) {
			const commitFields = await helper.getCommitFields(token);
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
