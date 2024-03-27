# Rocket.Chat.GitHub.Action.Notification

Forked from ![RocketChat/Rocket.Chat.GitHub.Action.Notification](https://github.com/RocketChat/Rocket.Chat.GitHub.Action.Notification) 
to solve Github Actions warning about node12 (and 16 too) deprecation.

Read details about use of this action in the original repository.


How to use this action from this repository
```
- name: Rocket.Chat Notification
  uses: madalozzo/Rocket.Chat.GitHub.Action.Notification@v2
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
