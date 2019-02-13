import fs from "fs-extra"
import { join } from "path"
import semver from "semver"

module.exports = function(dot, opts) {
  if (dot.state.version) {
    return
  }

  dot.state.version = opts || {}

  require("@dot-event/store")(dot)
  require("@dot-event/wait")(dot)

  dot.any("version", version)
}

async function version(prop, arg, dot) {
  const { paths } = arg,
    baseProp = prop.slice(0, -1)

  let { path } = arg

  if (!path.match(/\/package\.json$/)) {
    path = join(path, "package.json")
  }

  if (await fs.pathExists(path)) {
    const {
      dependencies,
      devDependencies,
    } = await fs.readJson(path)

    await Promise.all([
      setVersions(dot, dependencies),
      setVersions(dot, devDependencies),
    ])
  }

  await dot.wait(baseProp, "gatherVersions", {
    count: paths.length,
  })

  if (paths.indexOf(arg.path) === 0) {
    dot.log(dot.get("versions"))
  }
}

async function setVersions(dot, deps = {}) {
  return Promise.all(
    Object.keys(deps).map(name => {
      return dot.set("versions", name, current => {
        let version = fixDep(deps[name])

        if (current) {
          version = semver.gt(current, version)
            ? current
            : version
        }

        return version
      })
    })
  )
}

function fixDep(dep) {
  return dep
    ? semver.coerce(dep).version + depHyphen(dep)
    : "0.0.0"
}

function depHyphen(dep) {
  return dep && dep.indexOf("-") > -1
    ? "-" + dep.split(/-/)[1]
    : ""
}
