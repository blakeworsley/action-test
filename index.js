const core = require("@actions/core");
const github = require("@actions/github");
const fetch = require("node-fetch");

const getStoryIdFromBranch = ref => {
  return (
    ref &&
    ref.includes("/ch") &&
    ref
      .split("/")
      .find(f => f.includes("ch") && parseInt(f.split("ch")[1]))
      .split("ch")[0]
  );
};

const getClubhouseStory = (storyId, token) => {
  return fetch(
    `https://api.clubhouse.io/api/v3/stories/${storyId}?token=${token}`,
    { method: "GET", redirect: "follow" }
  )
    .then(result => result.json())
    .catch(error => error);
};

const sanitizeBody = (body, url, title, description) => {
  // const descriptionHeader = "### What does this pull request do?";
  const descriptionHeader = core.getInput("descriptionHeader");
  const descriptionBody = description;

  // const urlHeader = "### What is the relevant story?";
  const urlHeader = core.getInput("urlHeader");
  const urlBody = title && url && `[${title}](${url})`;

  const delimiter = core.getInput("delimiter");
  const bodyParts = body.split(delimiter);

  const newBody = bodyParts.map(part => {
    if (part.includes(descriptionHeader)) {
      return `${descriptionHeader}\n${descriptionBody}\n`;
    }
    if (part.includes(urlHeader)) {
      return `${urlHeader}\n${urlBody}\n`;
    } else {
      return part;
    }
  });
  return newBody.join(`${delimiter}\n`);
};

const updatePR = async (url, title, description) => {
  const github_token = core.getInput("GITHUB_TOKEN", { required: true });
  const request = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context.payload.pull_request.number
  };

  const body = github.context.payload.pull_request.body;

  request.body = sanitizeBody(body, url, title, description);
  const client = new github.GitHub(github_token);
  const response = await client.pulls.update(request);
  core.info(`response: ${response.status}`);
  console.log("PR was successfully updated");
};

const run = async () => {
  try {
    const clubhouse_token = core.getInput("CLUBHOUSE_TOKEN");
    console.log("clubhouse_token", clubhouse_token);
    console.log("github", github);
    console.log("github.context", github.context);
    console.log("github.context.payload", github.context.payload);
    console.log("github.context.payload.ref", github.context.payload.ref);
    const storyId = await getStoryIdFromBranch(github.context.payload.ref);
    console.log("storyId", storyId);
    const story = await getClubhouseStory(storyId, clubhouse_token);
    console.log("story", story);
    core.setOutput("clubhouseToken", clubhouse_token);
    core.setOutput("storyId", storyId);
    core.setOutput("url", story.app_url);
    core.setOutput("title", story.name);
    core.setOutput("description", story.description);
    if (story) {
      await updatePR(story.app_url, story.name, story.description);
    } else {
      console.log("PR was not updated");
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
