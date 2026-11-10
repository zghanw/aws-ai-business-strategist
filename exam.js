'use strict';
// Everything specific to this exam. app.js, check.js and style.css are the same file in every practice site.
{
  const guide = 'https://docs.aws.amazon.com/aws-certification/latest/ai-business-strategist-01/ai-business-strategist-01.html';
  const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
  window.EXAM = {
    code: 'AIB-C01',
    name: 'AWS Certified AI Business Strategist',
    key: 'aib', // localStorage prefix; index.html's theme script uses it too
    repo: 'https://github.com/zghanw/aws-ai-business-strategist',
    guide,
    pass: 700,
    strip: 'Beta exam: 85 questions · 170 min · 700/1000 to pass',
    domains: {
      1: { name: 'AI Fundamentals and Literacy', weight: 24 },
      2: { name: 'AI Strategy and Business Value Creation', weight: 28 },
      3: { name: 'AI Governance and Responsible AI Leadership', weight: 24 },
      4: { name: 'Business Readiness, Leadership, and AI Transformation', weight: 24 },
    },
    // Beta format (the standard exam's question count is not yet published).
    mock: {
      count: 85, minutes: 170, title: 'Mock exam (beta format)',
      note: `The format follows the beta described in the ${link(guide, 'official exam guide')}.`,
    },
    // Verified against the official AIB-C01 exam guide and certification page, 2026-09-28.
    facts: `
      <li><b>Beta:</b> 85 questions, 170 minutes, USD 50. Delivery started 29 Sep 2026. You can sit the beta only once.</li>
      <li><b>Standard:</b> 130 minutes, USD 100. The question count isn't published yet.</li>
      <li>Question types: multiple choice (1 correct) and multiple response (2+ correct; you must pick all of them to get credit).</li>
      <li>Scaled score 100 to 1,000; <b>700 to pass</b>. Scoring is compensatory, so you don't need to pass each domain. There's no penalty for guessing, so answer every question.</li>
      <li>AWS services appear only at a strategic level: Amazon Bedrock (pricing tiers, Guardrails, Knowledge Bases), Amazon SageMaker AI, Amazon Quick, AWS CAF, the shared responsibility model, Pricing Calculator, Cost Explorer, Marketplace, Savings Plans, and the Well-Architected Responsible AI Lens.</li>`,
    resources: `
      <li>${link(guide, 'AIB-C01 exam guide')}</li>
      <li>${link('https://aws.amazon.com/certification/certified-ai-business-strategist/', 'AWS Certified AI Business Strategist certification page')}</li>
      <li>${link('https://skillbuilder.aws/learning-plan/B8J6KKJ45C/exam-prep-plan--aws-certified-ai-business-strategist-aibc01--english/KQ8WMK8CTE', 'Exam prep plan on AWS Skill Builder')}, which includes the free 20-question official practice set (sign-in required)</li>`,
  };
}
