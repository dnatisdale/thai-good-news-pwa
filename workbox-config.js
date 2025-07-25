module.exports = {
  globDirectory: "build/",
  globPatterns: ["**/*.{js,css,html,json,png,svg,ico}"],
  swSrc: "src/service-worker.js",
  swDest: "build/service-worker.js",
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
}