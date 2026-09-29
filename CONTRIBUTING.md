# Contributing

Thanks for helping other people pass AIB-C01. The most useful contributions are:

1. **Fixing a question.** Wrong answer, unclear wording, or a fact that has changed.
2. **Adding a question** for an exam skill that has few questions.
3. **Reporting a bug** in the quiz itself.

You don't need to write code for the first two. Opening an issue is enough.

## Ground rules for questions

- **Never submit real exam questions.** Sharing live exam content breaks the AWS Certification Program Agreement. Write every question yourself.
- **Don't copy from paid practice tests, dumps, or courses.** Original wording only.
- **Tie it to the exam guide.** Each question should test a skill listed in the [official AIB-C01 exam guide](https://docs.aws.amazon.com/aws-certification/latest/ai-business-strategist-01/ai-business-strategist-01.html). Link your source for any fact.
- **Test judgment, not trivia.** The real exam is scenario-based and strategic. Ask what a business leader should do, not how to configure a service.
- **Explain every answer.** Say why the right answer is right and why the tempting wrong ones are wrong.

## Question format

Questions live in `data/d1.js` to `data/d4.js`, one file per exam domain:

```js
{ id: "d2-42", d: 2,
  q: "Scenario and question text. For multiple response, end with (Select TWO.)",
  o: ["Option", "Option", "Option", "Option"],
  a: [1],
  x: "Explanation." },
```

- `id` is the domain prefix plus the next free number.
- `a` holds the index (from 0) of each correct option.
- Options are shuffled when shown, so never write "option A" in an explanation.
- Use commas, colons or parentheses instead of dashes.

## Before opening a pull request

Run the data check. It needs Node.js and nothing else:

```bash
node check.js
```

It catches duplicate IDs, bad answer indexes, a missing `(Select TWO.)` tag, and a few style problems. CI runs the same check on every pull request.

To try the site locally, serve the folder with any static server, for example `python -m http.server`, and open http://localhost:8000.
