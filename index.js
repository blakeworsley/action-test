const core = require("@actions/core");
const fetch = require("node-fetch");

const run = async () => {
  try {
    const storyId = core.getInput("storyId");
    const token = core.getInput("token");

    const result = await fetch(
      `https://api.clubhouse.io/api/v3/stories/${storyId}?token=${token}`,
      { method: "GET", redirect: "follow" }
    );

    const story = await result.json();

    console.log(">>>>>>>>>>> URL <<<<<<<<<<<<", story.app_url);
    console.log(">>>>>>>>>>> TITLE <<<<<<<<<<<<", story.name);
    console.log(">>>>>>>>>>> DESCRIPTION <<<<<<<<<<<<", story.description);

    core.setOutput("url", story?.app_url);
    core.setOutput("title", story?.name);
    core.setOutput("description", story?.description);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
