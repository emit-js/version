module.exports = function(dot) {
  if (dot.version) {
    return
  }

  dot("dependencies", "version", {
    arg: [
      "@dot-event/args",
      "@dot-event/glob",
      "@dot-event/store",
      "@dot-event/wait",
    ],
  })

  dot("args", "version", {
    paths: {
      alias: ["_", "p"],
      default: [],
    },
  })

  require("./versionProject")(dot)

  dot.any("version", version)
}

async function version(prop, arg, dot) {
  const paths = await dot.glob(prop, {
    absolute: true,
    pattern: "{" + arg.paths.join(",") + "}",
  })

  return Promise.all(
    paths.map(
      async path =>
        await dot.versionProject(prop, {
          ...arg,
          path,
          paths,
        })
    )
  )
}
