# Rocket.Chat.GitHub.Action.Notification

Forked from ![RocketChat/Rocket.Chat.GitHub.Action.Notification](https://github.com/RocketChat/Rocket.Chat.GitHub.Action.Notification) 
to solve Github Actions warning about node12 deprecation


![](https://github.com/RocketChat/Rocket.Chat.GitHub.Action.Notification/workflows/TS%20Lint%20Check/badge.svg)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/RocketChat/Rocket.Chat.GitHub.Action.Notification?color=brightgreen)
![GitHub](https://img.shields.io/github/license/RocketChat/Rocket.Chat.GitHub.Action.Notification?color=brightgreen)

This is Rocket.Chat Notification for GitHub Actions.<br>
Forked from [homoluctus/slatify](https://github.com/homoluctus/slatify). Thanks a lot for your awesome work!

# Feature
- Notify the result of GitHub Actions
- Support three job status (reference: [job-context](https://help.github.com/en/articles/contexts-and-expression-syntax-for-github-actions#job-context))
  - success
  - failure
  - cancelled
- Mention
  - Notify message to channel members efficiently
  - You can specify the condition to mention

# How to use
First of all, you need to set GitHub secrets for ROCKETCHAT_WEBHOOK that is Incoming Webhook URL.<br>
You can customize the following parameters:

|with parameter|required/optional|default|description|
|:--:|:--:|:--|:--|
|type|required|N/A|The result of GitHub Actions job<br>This parameter value must contain the following word:<br>- `success`<br>- `failure`<br>- `cancelled`<br>We recommend using ${{ job.status }}|
|job_name|required|N/A|Means rocket.chat notification title|
|url|required|N/A|Rocket.Chat Incoming Webhooks URL<br>Please specify this key or ROCKETCHAT_WEBHOOK environment variable<br>※ROCKETCHAT_WEBHOOK will be deprecated|
|mention|optional|N/A|Rocket.Chat message mention|
|mention_if|optional|N/A|The condition to mention<br>This parameter can contain the following word:<br>- `success`<br>- `failure`<br>- `cancelled`<br>- `always`|
|icon_emoji|optional|Use Rocket.Chat Incoming Webhook configuration|Rocket.Chat icon|
|username|optional|Use Rocket.Chat Incoming Webhook configuration|Rocket.Chat username|
|channel|optional|Use Rocket.Chat Incoming Webhook configuration|Rocket.Chat channel name|
|commit|optional|false|If true, Rocket.Chat notification includes the latest commit message and author.|
|token|case by case|N/A|This token is used to get commit data.<br>If commit parameter is true, this parameter is required.<br>${{ secrets.GITHUB_TOKEN }} is recommended.|

Please refer `action.yml` for more details.

## Examples

```..github/workflows/example1.yml
- name: Rocket.Chat Notification
  uses: RocketChat/Rocket.Chat.GitHub.Action.Notification@v1
  if: always()
  with:
    type: ${{ job.status }}
    job_name: '*Lint Check*'
    mention: 'here' #there is an open issue about this config ![issue](https://github.com/RocketChat/Rocket.Chat.GitHub.Action.Notification/issues/2) 
    mention_if: 'failure'
    channel: '#random'
    url: ${{ secrets.ROCKETCHAT_WEBHOOK }}
```

↓ Including the latest commit data

```..github/workflows/example2.yml
- name: Rocket.Chat Notification
  uses: RocketChat/Rocket.Chat.GitHub.Action.Notification@v1
  if: always()
  with:
    type: ${{ job.status }}
    job_name: '*Lint Check*'
    mention: 'here' #there is an open issue about this config ![issue](https://github.com/RocketChat/Rocket.Chat.GitHub.Action.Notification/issues/2) 
    mention_if: 'failure'
    channel: '#random'
    url: ${{ secrets.ROCKETCHAT_WEBHOOK }}
    commit: true
    token: ${{ secrets.GITHUB_TOKEN }}
```

# Rocket.Chat UI Example

<img src="./images/rocketchat.png" alt="Notification Preview" width="90%">

# Contribute
1. Fork this repository
2. Pull your repository in local machine
3. Update original repository
4. Checkout "master" branch based "remotes/origin/master" branch
5. Work on "master" branch
6. Push you changes to your repository
7. Create a new Pull Request

# LICENSE

[The MIT License (MIT)](https://github.com/RocketChat/Rocket.Chat.GitHub.Action.Notification/blob/master/LICENSE)
