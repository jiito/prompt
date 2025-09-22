import { ActionPanel, Action, Form, showToast, Toast, getPreferenceValues, Clipboard } from "@raycast/api";
import { useState, useEffect, useCallback, useRef } from "react";
import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import path from "path";
import os from "os";

interface Preferences {
  promptDirectory: string;
}

interface PromptTemplate {
  key: string;
  title: string;
  content: string;
  filepath: string;
}

function expandPath(inputPath: string): string {
  if (inputPath.startsWith("~/")) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return inputPath;
}

function loadPromptTemplates(): PromptTemplate[] {
  const preferences = getPreferenceValues<Preferences>();
  const promptDir = expandPath(preferences.promptDirectory || "~/git/prompts");

  if (!existsSync(promptDir)) {
    showToast({
      style: Toast.Style.Failure,
      title: "Prompt directory not found",
      message: `Directory ${promptDir} does not exist`,
    });
    return [];
  }

  try {
    const files = readdirSync(promptDir);
    const promptFiles = files.filter(
      (file) => (file.endsWith(".txt") || file.endsWith(".md")) && statSync(path.join(promptDir, file)).isFile(),
    );

    return promptFiles.map((file) => {
      const filepath = path.join(promptDir, file);
      const content = readFileSync(filepath, "utf8");
      const key = path.basename(file, path.extname(file));
      const title = key.replace(/[_-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

      return {
        key,
        title,
        content,
        filepath,
      };
    });
  } catch (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "Failed to load prompts",
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export default function Command() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");
  const templateBody = useRef<string>("");

  useEffect(() => {
    console.log("loading templates");
    const loadedTemplates = loadPromptTemplates();
    setTemplates(loadedTemplates);

    if (loadedTemplates.length > 0) {
      const firstTemplate = loadedTemplates[0];
      setSelectedTemplateKey(firstTemplate.key);
      templateBody.current = firstTemplate.content;
    }
  }, []);

  const onTemplateChange = useCallback(
    (value: string) => {
      console.log("onTemplateChange", value);
      const selectedTemplate = templates.find((t) => t.key === value);
      if (selectedTemplate) {
        setSelectedTemplateKey(value);
        templateBody.current = selectedTemplate.content;
      }
    },
    [templates],
  );

  const onCopy = useCallback(() => {
    console.log("onCopy", templateBody);
    Clipboard.copy(templateBody.current);
  }, [templateBody]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Template" content={templateBody.current} onCopy={onCopy} />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="template" title="Template" value={selectedTemplateKey} onChange={onTemplateChange}>
        {templates.map((template) => (
          <Form.Dropdown.Item key={template.key} value={template.key} title={template.title} />
        ))}
      </Form.Dropdown>
      <Form.TextArea id="body" title="Content" value={templateBody.current} onChange={() => {}} />
    </Form>
  );
}
