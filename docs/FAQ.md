# FAQ

Plain answers to the questions founders ask before installing Casa.

## What does it cost?

Nothing. Casa is MIT-licensed and free forever: every skill, agent, playbook, and
the engine. It runs inside your own Claude Code on the plan you already pay for,
so Casa adds no inference bill of its own. There is no premium tier and no
paywalled prompt.

## Do I need an API key?

No, not for normal use. Interactive use, where you are present in the terminal
and approve each move, runs on your Claude Code subscription and is within
Anthropic's consumer terms.

The one exception is the optional headless operate mode (running loops on a
schedule with no human present). Anthropic's consumer terms do not allow
automated, unattended use on a subscription, so operate mode requires your own
API key and an explicit opt-in, and it refuses to run otherwise. You can use Casa
fully without ever touching it.

## What leaves my machine?

Nothing. All company state is plain-text files in a `company-brain/` folder
inside your own project, versioned in your own git. There is no telemetry, no
analytics, no account, and no hosted service. The only network traffic is your
own Claude Code session, which you already control.

## What is Capx Pay, and do I need it?

Capx Pay is an optional companion product for real-world actions that cost money:
buying a domain, paying for hosting, running paid media. Casa itself never
charges, prices, or holds funds. If you do not use Pay, everything still works:
bring your own keys for any service, or Casa simply hands the step to you as a
"Waiting on you" item and continues once you have done it.

## Can it really run my company?

Here is the honest answer. Casa does the department work, and does it to a
standard you can review: real research memos, real positioning, real pricing
models, real specs and copy, each checked by a critic panel before it counts.
What it does not do is cross the always-ask line on its own: spending money,
publishing anything public, shipping code, or anything destructive always stops
for your explicit approval, no matter how you set the autonomy dials. You remain
the founder. Casa makes sure the hundred other jobs are done, ordered, and
waiting on your judgment rather than your labor.

## What if I already have a business?

Casa onboards it by reading it. `/casa-start` inside an existing project scans
your files first, infers what kind of business it is and how far along you are,
confirms everything with you in one batch, and asks only what it could not infer.
You are never regressed to idea validation. Foundational work you skipped shows
up as optional catch-up items, not as a forced restart.

## How do I update?

```
/plugin marketplace update capx-casa
/plugin update capx-casa@capx-casa
/reload-plugins
```

`/reload-plugins` activates the new version without restarting Claude Code. If
the update reports "already up to date" when you know there are new commits, run
the marketplace update first; it re-fetches the repo.

## Where do I report issues?

On GitHub: [https://github.com/957codes/casa/issues](https://github.com/957codes/casa/issues).
Bug reports, feature requests, and playbook proposals each have a template. If
you want to contribute a fix or a playbook yourself, start with
[CONTRIBUTING.md](../CONTRIBUTING.md).
