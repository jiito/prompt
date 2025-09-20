import { ActionPanel, Action, Form, environment, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { readFileSync } from "fs";
import path from "path";

type TemplateKey = "learning" | "paper";

const PAPER_SUMMARY_TEMPLATE = `
Role
You are an expert research assistant who writes clear, faithful, and concise summaries of academic papers and long articles.

Input
- One or more links, PDFs, or pasted text excerpts.

Your Tasks
1) Identify the main question or problem addressed.
2) Summarize the core contributions and key findings.
3) Explain methods/approach at a high level.
4) Note assumptions, limitations, and potential biases.
5) Provide practical takeaways or implications.
6) List 3-5 key quotes or passages (if available in input).
7) Suggest 2-3 follow-up questions or next steps.

Output Format
- TL;DR (1-3 sentences)
- Key Contributions (bulleted)
- Methods (short paragraph)
- Limitations (bulleted)
- Practical Implications (bulleted)
- Notable Quotes (bulleted)
- Follow-ups (bulleted)

Constraints
- Be accurate and non-speculative; do not invent content not present in sources.
- Prefer brevity and clarity; avoid jargon unless essential.
- If multiple sources conflict, call it out.
`;

let cachedLearningTemplate: string | null = null;

function loadLearningTemplate(): string {
  try {
    const filePath = path.join(environment.assetsPath, "learning_mode.txt");
    if (cachedLearningTemplate !== null) {
      return cachedLearningTemplate;
    }
    const content = readFileSync(filePath, "utf8");
    cachedLearningTemplate = content;
    return content;
  } catch (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "Failed to load learning template",
      message: error instanceof Error ? error.message : String(error),
    });
    cachedLearningTemplate = "";
    return cachedLearningTemplate;
  }
}

export default function Command() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>("learning");
  const [templateBody, setTemplateBody] = useState<string>(() => loadLearningTemplate());

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Template" content={templateBody} />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="template"
        title="Template"
        value={selectedTemplate}
        onChange={(value) => {
          const nextKey = value as TemplateKey;
          setSelectedTemplate(nextKey);
          const nextBody = nextKey === "learning" ? loadLearningTemplate() : PAPER_SUMMARY_TEMPLATE;
          if (nextBody !== templateBody) {
            setTemplateBody(nextBody);
          }
        }}
      >
        <Form.Dropdown.Item value="learning" title="Learning mode" />
        <Form.Dropdown.Item value="paper" title="Paper summary" />
      </Form.Dropdown>
      <Form.TextArea id="body" title="Template" value={templateBody} onChange={setTemplateBody} />
    </Form>
  );
}
