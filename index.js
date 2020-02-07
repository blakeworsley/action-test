const core = require("@actions/core");
const github = require("@actions/github");
const fetch = require("node-fetch");

const run = async () => {
  try {
    const storyId = core.getInput("storyId");
    const token = core.getInput("token");
    var requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    const result = await fetch(
      `https://api.clubhouse.io/api/v3/stories/${storyId}?token=${token}`,
      requestOptions
    );

    const story = await result.json();

    console.log(">>>>>>>>>>> STORY <<<<<<<<<<<<", story);
    console.log(">>>>>>>>>>> URL <<<<<<<<<<<<", story.app_url);
    console.log(">>>>>>>>>>> TITLE <<<<<<<<<<<<", story.name);

    core.setOutput("storyUrl", story.app_url);
    core.setOutput("storyTitle", story.name);

    // const payload = JSON.stringify(github.context.payload, undefined, 2);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
