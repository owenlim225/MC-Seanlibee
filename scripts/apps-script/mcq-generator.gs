/***********************
 CONFIGURATION
************************/
const REVIEWER_FOLDER_ID = "1O52yxUmnXCJA2Y5SNe0Q4OoJvKRIYPww";
const TEMPLATE_FORM_ID = "1_ztcGfm9bS5rCzfYojbgaC4Z5tZV9cUyhdU1LKoCYfk";
const MCQ_COUNT = 50;

// Debug method labels
const SOURCE_METHOD = {
  AI_GENERATED_FROM_TEXT: "AI_GENERATED_FROM_TEXT",
  DIRECT_JSON_TO_FORM: "DIRECT_JSON_TO_FORM"
};

const SUPPORTED_PROVIDERS = [
  "gemini",
  "nvidia_nim",
  "openrouter",
  "deepseek",
  "lmstudio",
  "llamacpp",
  "ollama"
];

const DEFAULT_PROVIDER_ORDER = ["gemini", "nvidia_nim", "openrouter", "deepseek"];

/***********************
 ENTRY POINT
************************/
function processReviewerFolder() {
  const rootFolder = DriveApp.getFolderById(REVIEWER_FOLDER_ID);
  const files = rootFolder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName().toLowerCase();

    try {
      if (name.endsWith(".txt")) {
        processTextReviewer(file, rootFolder);
      } else if (name.endsWith(".json")) {
        processExistingJSON(file, rootFolder);
      } else {
        Logger.log("Skipped unsupported file: " + file.getName());
      }
    } catch (err) {
      Logger.log(file.getName() + " failed: " + err.message);
    }
  }
}

/***********************
 PROCESS TXT -> AI -> FORM
************************/
function processTextReviewer(file, rootFolder) {
  const baseName = file.getName().replace(/\.txt$/i, "");

  const reviewerFolder = getOrCreateSubfolder(rootFolder, baseName);
  file.moveTo(reviewerFolder);

  const text = file.getBlob().getDataAsString("UTF-8");
  if (!text || text.length < 100) {
    throw new Error("Reviewer text too small.");
  }

  Logger.log("Triggering AI generation (TXT input): " + file.getName());
  const mcqJSON = generateMCQFromText(text, baseName);

  validateJSON(mcqJSON);
  mcqJSON.title = baseName;

  saveJSON(reviewerFolder, baseName, mcqJSON);
  createQuizFromData(mcqJSON, reviewerFolder, SOURCE_METHOD.AI_GENERATED_FROM_TEXT);
}

/***********************
 PROCESS EXISTING JSON -> FORM
************************/
function processExistingJSON(file, rootFolder) {
  const baseName = file.getName().replace(/\.json$/i, "");
  const reviewerFolder = getOrCreateSubfolder(rootFolder, baseName);
  file.moveTo(reviewerFolder);

  const raw = file.getBlob().getDataAsString("UTF-8");
  const data = JSON.parse(raw);

  validateJSON(data);
  data.title = baseName;

  createQuizFromData(data, reviewerFolder, SOURCE_METHOD.DIRECT_JSON_TO_FORM);
}

/***********************
 MULTI-PROVIDER AI CALL
************************/
function generateMCQFromText(text, filename) {
  const cfg = getAIConfig();
  const prompt = buildPrompt(text, filename);
  const providerErrors = [];

  for (let i = 0; i < cfg.providerOrder.length; i += 1) {
    const provider = cfg.providerOrder[i];
    try {
      Logger.log("AI provider attempt: " + provider);
      const rawOutput = callProvider(provider, prompt, cfg);
      const parsed = parseModelOutputToJSON(rawOutput);
      validateJSON(parsed);
      Logger.log("AI provider success: " + provider);
      return parsed;
    } catch (err) {
      providerErrors.push(provider + ": " + err.message);
      Logger.log("AI provider failed: " + provider + " (" + err.message + ")");
    }
  }

  throw new Error("All AI providers failed. " + providerErrors.join(" | "));
}

function getAIConfig() {
  const props = PropertiesService.getScriptProperties();

  const providerOrder = getProviderOrder_(props.getProperty("AI_PROVIDER_ORDER"));

  return {
    providerOrder: providerOrder,
    gemini: {
      apiKey: props.getProperty("GENAI_KEY"),
      model: props.getProperty("GEMINI_MODEL") || "gemini-2.5-flash"
    },
    nvidia_nim: {
      apiKey: props.getProperty("NVIDIA_NIM_API_KEY"),
      model: props.getProperty("NVIDIA_NIM_MODEL") || "z-ai/glm4.7",
      baseUrl: props.getProperty("NVIDIA_NIM_BASE_URL") || "https://integrate.api.nvidia.com/v1"
    },
    openrouter: {
      apiKey: props.getProperty("OPENROUTER_API_KEY"),
      model: props.getProperty("OPENROUTER_MODEL") || "deepseek/deepseek-r1-0528:free",
      baseUrl: props.getProperty("OPENROUTER_BASE_URL") || "https://openrouter.ai/api/v1"
    },
    deepseek: {
      apiKey: props.getProperty("DEEPSEEK_API_KEY"),
      model: props.getProperty("DEEPSEEK_MODEL") || "deepseek-chat",
      baseUrl: props.getProperty("DEEPSEEK_BASE_URL") || "https://api.deepseek.com"
    },
    lmstudio: {
      model: props.getProperty("LMSTUDIO_MODEL") || "local-model",
      baseUrl: props.getProperty("LM_STUDIO_BASE_URL") || "http://localhost:1234/v1"
    },
    llamacpp: {
      model: props.getProperty("LLAMACPP_MODEL") || "local-model",
      baseUrl: props.getProperty("LLAMACPP_BASE_URL") || "http://localhost:8080/v1"
    },
    ollama: {
      model: props.getProperty("OLLAMA_MODEL") || "llama3.1",
      baseUrl: props.getProperty("OLLAMA_BASE_URL") || "http://localhost:11434/v1"
    }
  };
}

function getProviderOrder_(rawOrder) {
  if (!rawOrder) {
    return DEFAULT_PROVIDER_ORDER.slice();
  }

  const parsed = rawOrder
    .split(",")
    .map(function (item) { return item.trim().toLowerCase(); })
    .filter(function (item) { return item !== ""; });

  const valid = parsed.filter(function (item) {
    return SUPPORTED_PROVIDERS.indexOf(item) !== -1;
  });

  if (!valid.length) {
    return DEFAULT_PROVIDER_ORDER.slice();
  }

  return valid;
}

function buildPrompt(text, filename) {
  return [
    "You are an expert educational assessment generator.",
    "",
    "Generate exactly " + MCQ_COUNT + " MCQs strictly from reviewer text below.",
    "",
    "SCHEMA:",
    "",
    "{",
    '  "title": "' + filename + '",',
    '  "questions": [',
    "    {",
    '      "question": "string",',
    '      "choices": ["A","B","C","D"],',
    '      "correct": 0,',
    '      "points": 1',
    "    }",
    "  ]",
    "}",
    "",
    "Rules:",
    "- Use ONLY reviewer content",
    "- Exactly " + MCQ_COUNT + " questions",
    "- Focus on important keywords, dates, and quotes",
    "- 4 choices each",
    "- One correct answer",
    '- "correct" must be index 0-3',
    "- All points = 1",
    "- Output ONLY valid JSON",
    "",
    "REVIEWER CONTENT:",
    text
  ].join("\n");
}

function callProvider(provider, prompt, cfg) {
  switch (provider) {
    case "gemini":
      return callGemini(prompt, cfg.gemini);
    case "nvidia_nim":
      return callOpenAICompatible(prompt, cfg.nvidia_nim, "nvidia_nim");
    case "openrouter":
      return callOpenAICompatible(prompt, cfg.openrouter, "openrouter");
    case "deepseek":
      return callOpenAICompatible(prompt, cfg.deepseek, "deepseek");
    case "lmstudio":
      return callOpenAICompatible(prompt, cfg.lmstudio, "lmstudio");
    case "llamacpp":
      return callOpenAICompatible(prompt, cfg.llamacpp, "llamacpp");
    case "ollama":
      return callOpenAICompatible(prompt, cfg.ollama, "ollama");
    default:
      throw new Error("Unsupported provider: " + provider);
  }
}

function callGemini(prompt, cfg) {
  if (!cfg.apiKey) {
    throw new Error("Missing GENAI_KEY.");
  }

  const endpoint = "https://generativelanguage.googleapis.com/v1/models/" + encodeURIComponent(cfg.model) + ":generateContent?key=" + encodeURIComponent(cfg.apiKey);
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const parsed = fetchJson_(endpoint, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  }, "gemini");

  if (!parsed.candidates || !parsed.candidates.length) {
    throw new Error("No candidates in Gemini response.");
  }

  const parts = parsed.candidates[0].content && parsed.candidates[0].content.parts;
  if (!parts || !parts.length || !parts[0].text) {
    throw new Error("No text content in Gemini response.");
  }

  return parts[0].text;
}

function callOpenAICompatible(prompt, cfg, providerName) {
  if (!cfg.baseUrl) {
    throw new Error("Missing base URL for " + providerName + ".");
  }

  if (!cfg.model) {
    throw new Error("Missing model for " + providerName + ".");
  }

  const endpoint = cfg.baseUrl.replace(/\/$/, "") + "/chat/completions";
  const payload = {
    model: cfg.model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  };

  const headers = {};
  if (cfg.apiKey) {
    headers.Authorization = "Bearer " + cfg.apiKey;
  } else if (providerName === "nvidia_nim" || providerName === "openrouter" || providerName === "deepseek") {
    throw new Error("Missing API key for " + providerName + ".");
  }

  const parsed = fetchJson_(endpoint, {
    method: "post",
    contentType: "application/json",
    headers: headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  }, providerName);

  const choice = parsed.choices && parsed.choices[0];
  if (!choice || !choice.message || !choice.message.content) {
    throw new Error("No chat completion content from " + providerName + ".");
  }

  const content = choice.message.content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const firstTextPart = content.find(function (part) {
      return part && (part.type === "text" || part.text);
    });

    if (firstTextPart && firstTextPart.text) {
      return firstTextPart.text;
    }
  }

  throw new Error("Unsupported content format from " + providerName + ".");
}

function fetchJson_(url, options, providerName) {
  const res = UrlFetchApp.fetch(url, options);
  const status = res.getResponseCode();
  const body = res.getContentText();

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (err) {
    throw new Error(providerName + " returned non-JSON response (HTTP " + status + ").");
  }

  if (status < 200 || status >= 300) {
    const errMsg = parsed.error && (parsed.error.message || parsed.error.code);
    throw new Error(providerName + " HTTP " + status + (errMsg ? ": " + errMsg : ""));
  }

  return parsed;
}

function parseModelOutputToJSON(rawOutput) {
  if (!rawOutput || typeof rawOutput !== "string") {
    throw new Error("Model output empty.");
  }

  const cleaned = rawOutput.replace(/```json|```/gi, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const candidate = cleaned.match(/\{[\s\S]*\}/);
    if (!candidate) {
      throw new Error("No JSON object found in model output.");
    }

    try {
      return JSON.parse(candidate[0]);
    } catch (innerErr) {
      throw new Error("Model output is not valid JSON.");
    }
  }
}

/***********************
 VALIDATE JSON
************************/
function validateJSON(data) {
  if (!data.title || !Array.isArray(data.questions)) {
    throw new Error("Invalid JSON structure.");
  }

  if (data.questions.length !== MCQ_COUNT) {
    throw new Error("Expected exactly " + MCQ_COUNT + " questions, got " + data.questions.length + ".");
  }

  data.questions.forEach(function (q, i) {
    if (
      !q.question ||
      !Array.isArray(q.choices) ||
      q.choices.length !== 4 ||
      typeof q.correct !== "number" ||
      q.correct < 0 ||
      q.correct > 3
    ) {
      throw new Error("Broken question at index " + i);
    }
  });
}

/***********************
 SAVE JSON
************************/
function saveJSON(folder, baseName, data) {
  folder.createFile(
    baseName + ".json",
    JSON.stringify(data, null, 2),
    MimeType.PLAIN_TEXT
  );
}

/***********************
 CREATE GOOGLE FORM
************************/
function createQuizFromData(data, folder, sourceMethod) {
  const title = data.title || "Generated Exam";

  Logger.log("Method used for '" + title + "': " + (sourceMethod || "UNKNOWN"));

  const templateFile = DriveApp.getFileById(TEMPLATE_FORM_ID);
  const newFormFile = templateFile.makeCopy(title, folder);
  const form = FormApp.openById(newFormFile.getId());

  form.setTitle(title);
  form.getItems().forEach(function (item) { form.deleteItem(item); });

  data.questions.forEach(function (q) {
    const item = form.addMultipleChoiceItem();
    item.setTitle(q.question);
    item.setRequired(true);

    const choices = q.choices.map(function (choice, i) {
      return item.createChoice(choice, i === q.correct);
    });

    item.setChoices(choices);
    item.setPoints(q.points || 1);
  });

  Logger.log("Form created: " + form.getEditUrl());
}

/***********************
 UTILITIES
************************/
function getOrCreateSubfolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }

  return parent.createFolder(name);
}
