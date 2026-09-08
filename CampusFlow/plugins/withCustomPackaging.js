const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withCustomPackaging(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes("OSGI-INF/MANIFEST.MF")) {
      const packagingSnippet = `
        resources {
            pickFirsts += [
                "META-INF/versions/9/OSGI-INF/MANIFEST.MF",
                "**/META-INF/versions/9/OSGI-INF/MANIFEST.MF"
            ]
        }`;

      contents = contents.replace(
        /packagingOptions\s*\{/,
        `packagingOptions {${packagingSnippet}`
      );

      config.modResults.contents = contents;
    }

    return config;
  });
};
