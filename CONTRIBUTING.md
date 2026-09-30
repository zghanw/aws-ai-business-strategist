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
- **Explain every option.** Each option gets its own rationale: why it's right, or which requirement it fails.

## Writing style

The questions follow the style of AWS's official practice questions, so practice here feels like the real exam.

**The scenario.** Two to five short, plain sentences in the present tense, such as "A retailer pilots..." Put each constraint in its own sentence ("The company must...", "The company wants to... without..."). Spell out an acronym the first time it appears, for example "foundation model (FM)". Then a blank line, then the question on its own line.

**The question.** Short, with the qualifier in capitals: "Which step should the company take FIRST?", "What is the MOST likely cause?", "Which solution will meet these requirements with the LEAST operational overhead?"

**The options.** This is where most practice tests go wrong.

- Write all options in the same form: all imperatives, all noun phrases, or all "A model that..."
- Keep them about the same length. The right answer must not be the longest, the most detailed, or the most carefully hedged. `node check.js` fails the build if right answers stand out by length.
- Every wrong option should be a real practice that fails one requirement in the scenario, for example one that is reactive instead of preventive, too broad in scope, done in the wrong order, or overly restrictive. No joke options.

**The rationales.** Two to four short sentences each. Say what the option is, tie it to the scenario ("The scenario requires..."), and finish with the verdict.

## Question format

Questions live in `data/d1.js` to `data/d4.js`, one file per exam domain:

```js
{ id: "d2-86", d: 2,
  q: "Scenario sentences.\n\nWhich approach will meet these requirements?",
  o: ["Option", "Option", "Option", "Option"],
  a: [1],
  r: ["Why option 1 is wrong.", "Why option 2 is right.", "Why option 3 is wrong.", "Why option 4 is wrong."] },
```

- `id` is the domain prefix plus the next free number.
- `q` is the scenario, a blank line (`\n\n`), then the question. For multiple response, end the question with `(Select TWO.)`.
- `a` holds the index (from 0) of each correct option.
- `r` holds one rationale per option, in the same order as `o`.
- Options are shuffled when shown, so never write "option A" in a rationale.
- Use commas, colons or parentheses instead of dashes.

## Before opening a pull request

Run the data check. It needs Node.js and nothing else:

```bash
node check.js
```

It catches duplicate IDs, bad answer indexes, missing rationales, a missing `(Select TWO.)` tag, dashes, and answer-length bias. CI runs the same check on every pull request.

To try the site locally, serve the folder with any static server, for example `python -m http.server`, and open http://localhost:8000.
