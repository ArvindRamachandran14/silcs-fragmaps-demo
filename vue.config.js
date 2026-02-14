const isProduction = process.env.NODE_ENV === "production";
const repoName = "silcs-fragmaps-demo";

module.exports = {
  // GitHub project pages are served under /<repo-name>/.
  publicPath: isProduction ? `/${repoName}/` : "/",
  transpileDependencies: ["vuetify"],
};
