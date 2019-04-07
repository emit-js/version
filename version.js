module.exports = function(emit) {
  if (emit.version) {
    return
  }

  emit("dependencies", "version", [
    "@emit-js/args",
    "@emit-js/glob",
    "@emit-js/store",
    "@emit-js/wait",
  ])

  emit("args", "version", {
    paths: {
      alias: ["_", "p"],
      default: [],
    },
  })

  require("./versionProject")(emit)

  emit.any("version", version)
}

async function version(arg, prop, emit) {
  const paths = await emit.glob(prop, {
    absolute: true,
    pattern: arg.paths,
  })

  return Promise.all(
    paths.map(
      async path =>
        await emit.versionProject(prop, {
          ...arg,
          path,
          paths,
        })
    )
  )
}
